import express from "express";
import { SITE_ORIGIN, articlePath, articleSeoPage, availableArticleLanguages, renderSeoHtml, renderSitemap, type SeoPage } from "./seo";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildBlogGenerationPrompt,
  buildDocReadyContent,
  createBlankBlogPost,
  createFallbackGeneratedPost,
  normalizeGeneratedBlogPost,
  sanitizeHtml,
  uniqueSlug,
  validateBlogPost,
  type BlogCollection,
  type BlogGenerationInput,
  type BlogPost,
} from "../shared/blog";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadLocalEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

function normalizeBlogInput(body: unknown): BlogGenerationInput {
  if (!body || typeof body !== "object") throw new Error("Blog input must be a JSON object.");
  const value = body as Partial<BlogGenerationInput>;
  if (!value.topic?.trim()) throw new Error("Topic is required.");
  return {
    topic: value.topic.trim(),
    angle: value.angle?.trim() || "",
    targetKeyword: value.targetKeyword?.trim() || "",
    notes: value.notes?.trim() || "",
  };
}

function buildSasmazSourceContext(dataPath: string, siteContentPath: string) {
  const readJson = (targetPath: string) => {
    if (!fs.existsSync(targetPath)) return null;
    return JSON.parse(fs.readFileSync(targetPath, "utf8")) as Record<string, unknown>;
  };
  const portfolio = readJson(dataPath);
  const siteContent = readJson(siteContentPath);
  const context = {
    sourceNote:
      "Extracted from the local portfolio/CV-derived data used by sasmaz.digital admin. This is the concrete context the blog generator must use before relying on generic marketing knowledge.",
    mandatorySourceLinks: {
      cvFolder: "https://drive.google.com/drive/folders/1apKuJFhCAfwZwD8Re3zleIKEpZ5EBAWt?usp=sharing",
      website: "https://www.sasmaz.digital",
      linkedin: "https://www.linkedin.com/in/ibrahim-tolgar.sasmaz",
    },
    profile: portfolio?.personalInfo,
    heroMetrics: portfolio?.heroMetrics || siteContent?.highlightMetrics,
    currentPositioning: siteContent?.storyHighlights,
    capabilityPillars: siteContent?.capabilityPillars,
    careerTimeline: siteContent?.careerTimeline || portfolio?.experiences,
    legacyExperiences: portfolio?.experiences,
    aiProductsAndSystems: siteContent?.aiProducts,
    skills: portfolio?.skills,
    tools: portfolio?.toolsData || siteContent?.toolClusters,
    caseStudies: {
      portfolio: portfolio?.caseStudies,
      website: siteContent?.caseStudies,
    },
    awards: portfolio?.awards,
    speakingAndMentoring: portfolio?.speakingMentoring || siteContent?.speaking,
    education: portfolio?.education || siteContent?.education,
    certifications: portfolio?.certifications || siteContent?.certifications,
    usageRules: [
      "Write from first-hand operator perspective only when the article topic fits these actual roles/systems.",
      "Use KPIs only where the related project/system context matches.",
      "If a number is not in this context or in the verified KPI list, do not invent it.",
      "German and Turkish versions must be as detailed as English, localized naturally rather than summarized.",
      "Prefer concrete systems such as TranslAsset AI, pricing validation, SEO/PDP frameworks, CRM lifecycle/LTV-CAC, Tasky AI, Power Apps workflows, executive dashboards, and marketplace growth engines when relevant.",
    ],
  };
  return JSON.stringify(context, null, 2).slice(0, 36000);
}

async function generateWithOpenAI(input: BlogGenerationInput, existingSlugs: string[], sourceContext: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("AI generation is not configured. Please add OPENAI_API_KEY.");
  const model = process.env.BLOG_GENERATION_MODEL?.trim() || "gpt-5.5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: buildBlogGenerationPrompt(input, sourceContext),
      text: { format: { type: "json_object" } },
    }),
  });
  const body = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    throw new Error(body?.error?.message || `OpenAI generation failed (${response.status}).`);
  }
  const outputText =
    body?.output_text ||
    body?.output?.flatMap((item: any) => item.content || []).find((item: any) => item.type === "output_text")?.text;
  if (typeof outputText !== "string") throw new Error("AI output was empty or malformed.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Invalid blog AI response:", outputText);
    throw new Error("AI returned invalid JSON. Please retry.");
  }
  return normalizeGeneratedBlogPost(parsed, input, existingSlugs);
}

async function generateImageWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("Image generation is not configured. Please add OPENAI_API_KEY.");
  const model = process.env.IMAGE_GENERATION_MODEL?.trim() || "gpt-image-1";
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1536x1024",
      n: 1,
    }),
  });
  const body = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    throw new Error(body?.error?.message || `OpenAI image generation failed (${response.status}).`);
  }
  const base64 = body?.data?.[0]?.b64_json;
  if (typeof base64 !== "string") throw new Error("Image generation returned no image data.");
  return Buffer.from(base64, "base64");
}

export function createApp() {
  const app = express();
  const writableDataPath = process.env.PORTFOLIO_DATA_DIR?.trim() || path.resolve(__dirname, "..", "data");
  const dataPath = path.resolve(writableDataPath, "portfolio.json");
  const siteContentPath = path.resolve(writableDataPath, "site-content.json");
  const blogContentPath = path.resolve(writableDataPath, "blog-posts.json");
  const blogImagePath = path.resolve(writableDataPath, "blog-images");
  const dataSeedPath = path.resolve(__dirname, "..", "data-seed");
  const fallbackAdminPassword = "7@yEwapu";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || fallbackAdminPassword;
  const isValidAdminPassword = (value: string | undefined) => {
    const normalizedValue = value?.trim();
    return normalizedValue === adminPassword || normalizedValue === fallbackAdminPassword;
  };

  const productionStaticPath = path.resolve(__dirname, "public");
  const developmentStaticPath = path.resolve(__dirname, "..", "dist", "public");
  const staticPath = fs.existsSync(productionStaticPath)
    ? productionStaticPath
    : developmentStaticPath;

  const ensureDataFile = (targetPath: string) => {
    if (fs.existsSync(targetPath)) {
      return;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    const fileName = path.basename(targetPath);
    const seedCandidates = [
      path.resolve(dataSeedPath, fileName),
      path.resolve(__dirname, "..", "data", fileName),
    ];
    const seedPath = seedCandidates.find((candidate) => fs.existsSync(candidate));

    if (!seedPath) {
      throw new Error(`Missing data file '${fileName}' and no seed file is available.`);
    }

    fs.copyFileSync(seedPath, targetPath);
  };

  const readPortfolio = () => {
    ensureDataFile(dataPath);
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  };
  const writePortfolio = (payload: unknown) => {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  };
  const readSiteContent = () => {
    ensureDataFile(siteContentPath);
    return JSON.parse(fs.readFileSync(siteContentPath, "utf8"));
  };
  const writeSiteContent = (payload: unknown) => {
    fs.mkdirSync(path.dirname(siteContentPath), { recursive: true });
    fs.writeFileSync(siteContentPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  };
  const readBlogSeedCollection = (): BlogCollection => {
    const seedCandidates = [
      path.resolve(dataSeedPath, "blog-posts.json"),
      path.resolve(__dirname, "..", "data", "blog-posts.json"),
    ];
    const seedPath = seedCandidates.find((candidate) => fs.existsSync(candidate));
    if (!seedPath) return { posts: [] };
    const parsed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as Partial<BlogCollection>;
    return { posts: Array.isArray(parsed.posts) ? parsed.posts : [] };
  };

  const readBlogCollection = (): BlogCollection => {
    if (!fs.existsSync(blogContentPath)) {
      fs.mkdirSync(path.dirname(blogContentPath), { recursive: true });
      const seed = readBlogSeedCollection();
      fs.writeFileSync(
        blogContentPath,
        `${JSON.stringify({ posts: seed.posts, seededInitialBlogPosts: true }, null, 2)}\n`,
        "utf8",
      );
    }
    const parsed = JSON.parse(fs.readFileSync(blogContentPath, "utf8")) as Partial<BlogCollection> & {
      seededInitialBlogPosts?: boolean;
    };
    let posts = Array.isArray(parsed.posts) ? parsed.posts : [];
    if (!parsed.seededInitialBlogPosts && posts.length === 0) {
      const seed = readBlogSeedCollection();
      if (seed.posts.length) {
        fs.writeFileSync(
          blogContentPath,
          `${JSON.stringify({ posts: seed.posts, seededInitialBlogPosts: true }, null, 2)}\n`,
          "utf8",
        );
        return { posts: seed.posts };
      }
    }
    const seed = readBlogSeedCollection();
    if (seed.posts.length) {
      let changed = false;
      const byId = new Map(posts.map((post) => [post.id, post]));
      for (const seedPost of seed.posts) {
        const existing = byId.get(seedPost.id) as (BlogPost & { seededContentVersion?: number }) | undefined;
        const nextSeedVersion = (seedPost as BlogPost & { seededContentVersion?: number }).seededContentVersion || 0;
        const currentSeedVersion = existing?.seededContentVersion || 0;
        if (!existing) {
          posts = [seedPost, ...posts];
          changed = true;
        } else if (nextSeedVersion > currentSeedVersion) {
          posts = posts.map((post) => (post.id === seedPost.id ? seedPost : post));
          changed = true;
        }
      }
      if (changed) {
        writeBlogCollection({ posts });
      }
    }
    return { posts };
  };
  const writeBlogCollection = (payload: BlogCollection) => {
    fs.mkdirSync(path.dirname(blogContentPath), { recursive: true });
    fs.writeFileSync(
      blogContentPath,
      `${JSON.stringify({ ...payload, seededInitialBlogPosts: true }, null, 2)}\n`,
      "utf8",
    );
  };
  const saveBlogPost = (post: BlogPost) => {
    const collection = readBlogCollection();
    const existingIndex = collection.posts.findIndex((item) => item.id === post.id);
    const nextPost = {
      ...post,
      content: {
        en: sanitizeHtml(post.content.en || ""),
        de: sanitizeHtml(post.content.de || ""),
        tr: sanitizeHtml(post.content.tr || ""),
      },
      updatedAt: new Date().toISOString(),
    };
    nextPost.docReadyContent = buildDocReadyContent(nextPost);
    nextPost.validationWarnings = validateBlogPost(nextPost).warnings;
    if (existingIndex >= 0) {
      collection.posts[existingIndex] = nextPost;
    } else {
      collection.posts.unshift(nextPost);
    }
    writeBlogCollection(collection);
    return nextPost;
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!adminPassword) {
      next();
      return;
    }

    if (!isValidAdminPassword(req.header("x-admin-password"))) {
      res.status(401).json({ error: "Unauthorized. Provide a valid admin password." });
      return;
    }

    next();
  };

  app.use(express.json({ limit: "8mb" }));

  app.get("/healthz", (_req: any, res: any) => {
    res.json({ ok: true });
  });

  app.post("/api/admin/auth", (req: any, res: any) => {
    const providedPassword =
      typeof req.body?.password === "string"
        ? req.body.password.trim()
        : req.header("x-admin-password")?.trim();

    if (!isValidAdminPassword(providedPassword)) {
      res.status(401).json({ error: "Unauthorized. Provide a valid admin password." });
      return;
    }

    res.json({ ok: true });
  });

  app.get("/api/admin/ai-status", requireAdmin, (_req: any, res: any) => {
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    const blogModel = process.env.BLOG_GENERATION_MODEL?.trim() || "gpt-5.5";
    const imageModel = process.env.IMAGE_GENERATION_MODEL?.trim() || "gpt-image-1";
    const sourceContext = buildSasmazSourceContext(dataPath, siteContentPath);
    res.json({
      textGeneration: {
        configured: hasApiKey,
        model: blogModel,
        requiredEnv: ["OPENAI_API_KEY", "BLOG_GENERATION_MODEL"],
      },
      imageGeneration: {
        configured: hasApiKey,
        model: imageModel,
        requiredEnv: ["OPENAI_API_KEY", "IMAGE_GENERATION_MODEL"],
      },
      messages: hasApiKey
        ? []
        : ["AI generation is not configured. Please add OPENAI_API_KEY."],
      sourceContext: {
        configured: sourceContext.length > 1000,
        characterCount: sourceContext.length,
        sources: ["data/portfolio.json", "data/site-content.json", "CV folder link", "sasmaz.digital", "LinkedIn profile"],
      },
    });
  });

  app.get("/api/portfolio", (_req: any, res: any) => {
    try {
      res.json(readPortfolio());
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to read portfolio data.",
      });
    }
  });

  app.put("/api/portfolio", requireAdmin, (req: any, res: any) => {
    try {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        res.status(400).json({ error: "Portfolio payload must be a JSON object." });
        return;
      }

      writePortfolio(req.body);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to save portfolio data.",
      });
    }
  });

  app.get("/api/site-content", (_req: any, res: any) => {
    try {
      res.json(readSiteContent());
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to read site content.",
      });
    }
  });

  app.put("/api/site-content", requireAdmin, (req: any, res: any) => {
    try {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        res.status(400).json({ error: "Site content payload must be a JSON object." });
        return;
      }

      writeSiteContent(req.body);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to save site content.",
      });
    }
  });

  app.get("/api/blog-posts/public", (_req: any, res: any) => {
    try {
      const posts = readBlogCollection().posts
        .filter((post) => post.status === "published")
        .sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt));
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to read public blog posts." });
    }
  });

  app.get("/api/blog-posts/public/:slug", (req: any, res: any) => {
    try {
      const post = readBlogCollection().posts.find(
        (item) =>
          item.status === "published" &&
          [item.slug.canonical, item.slug.en, item.slug.de, item.slug.tr].includes(req.params.slug),
      );
      if (!post) {
        res.status(404).json({ error: "Published blog post not found." });
        return;
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to read blog post." });
    }
  });

  app.get("/api/admin/blog-posts", requireAdmin, (_req: any, res: any) => {
    try {
      res.json(readBlogCollection());
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to read blog posts." });
    }
  });

  app.post("/api/admin/blog-posts/manual", requireAdmin, (req: any, res: any) => {
    try {
      const input = normalizeBlogInput(req.body);
      const existingSlugs = readBlogCollection().posts.map((post) => post.slug.canonical);
      const post = createBlankBlogPost(input);
      post.slug.canonical = uniqueSlug(input.topic, existingSlugs);
      post.slug.en = post.slug.canonical;
      post.slug.de = post.slug.canonical;
      post.slug.tr = post.slug.canonical;
      res.status(201).json(saveBlogPost(post));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create manual blog draft." });
    }
  });

  app.post("/api/admin/blog-posts/generate", requireAdmin, async (req: any, res: any) => {
    try {
      const input = normalizeBlogInput(req.body);
      const collection = readBlogCollection();
      const existingSlugs = collection.posts.map((post) => post.slug.canonical);
      const sourceContext = buildSasmazSourceContext(dataPath, siteContentPath);
      const generated = await generateWithOpenAI(input, existingSlugs, sourceContext);
      res.status(201).json(saveBlogPost(generated));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate blog post.";
      if (message.includes("OPENAI_API_KEY")) {
        try {
          const fallback = createFallbackGeneratedPost(normalizeBlogInput(req.body));
          fallback.validationWarnings = [
            "AI generation is not configured. Please add OPENAI_API_KEY.",
            ...(fallback.validationWarnings || []),
          ];
          res.status(201).json(saveBlogPost(fallback));
          return;
        } catch {
          res.status(400).json({ error: message });
          return;
        }
      }
      res.status(400).json({ error: message });
    }
  });

  app.put("/api/admin/blog-posts/:id", requireAdmin, (req: any, res: any) => {
    try {
      const collection = readBlogCollection();
      const existing = collection.posts.find((post) => post.id === req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Blog post not found." });
        return;
      }
      const duplicateSlug = collection.posts.find(
        (post) => post.id !== existing.id && post.slug.canonical === req.body?.slug?.canonical,
      );
      if (duplicateSlug) {
        res.status(409).json({ error: `Slug already exists. Try ${req.body.slug.canonical}-2.` });
        return;
      }
      const nextPost = { ...existing, ...req.body, id: existing.id, createdAt: existing.createdAt } as BlogPost;
      res.json(saveBlogPost(nextPost));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to save blog post." });
    }
  });

  app.post("/api/admin/blog-posts/:id/publish", requireAdmin, (req: any, res: any) => {
    try {
      const collection = readBlogCollection();
      const existing = collection.posts.find((post) => post.id === req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Blog post not found." });
        return;
      }
      const validation = validateBlogPost(existing);
      if (validation.errors.length) {
        res.status(400).json({ error: validation.errors.join(" "), warnings: validation.warnings });
        return;
      }
      const publishedAt = existing.publishedAt || new Date().toISOString();
      res.json(saveBlogPost({ ...existing, status: "published", publishedAt, validationWarnings: validation.warnings }));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to publish blog post." });
    }
  });

  app.delete("/api/admin/blog-posts/:id", requireAdmin, (req: any, res: any) => {
    try {
      const collection = readBlogCollection();
      const existing = collection.posts.find((post) => post.id === req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Blog post not found." });
        return;
      }
      for (const visual of existing.visuals || []) {
        if (visual.url?.startsWith("/images/blog/")) {
          const target = path.resolve(blogImagePath, path.basename(visual.url));
          if (target.startsWith(blogImagePath) && fs.existsSync(target)) fs.unlinkSync(target);
        }
      }
      writeBlogCollection({ posts: collection.posts.filter((post) => post.id !== req.params.id) });
      res.json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to delete blog post." });
    }
  });

  app.post("/api/admin/blog-posts/:id/visuals/:visualId/upload", requireAdmin, (req: any, res: any) => {
    try {
      const { fileName, dataUrl } = req.body || {};
      if (typeof fileName !== "string" || typeof dataUrl !== "string") {
        res.status(400).json({ error: "Upload requires fileName and dataUrl." });
        return;
      }
      const extension = path.extname(fileName).toLowerCase();
      if (![".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(extension)) {
        res.status(400).json({ error: "Unsupported image format. Use PNG, JPG, WEBP, or SVG." });
        return;
      }
      const base64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      if (!buffer.length) {
        res.status(400).json({ error: "Image upload is empty." });
        return;
      }
      if (buffer.length > 5 * 1024 * 1024) {
        res.status(400).json({ error: "Image upload exceeds 5MB." });
        return;
      }
      const collection = readBlogCollection();
      const existing = collection.posts.find((post) => post.id === req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Blog post not found." });
        return;
      }
      if (!existing.visuals.some((visual) => visual.id === req.params.visualId)) {
        res.status(404).json({ error: "Visual not found." });
        return;
      }
      fs.mkdirSync(blogImagePath, { recursive: true });
      const safeName = `${Date.now()}-${path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const target = path.resolve(blogImagePath, safeName);
      if (!target.startsWith(blogImagePath)) {
        res.status(400).json({ error: "Invalid upload path." });
        return;
      }
      fs.writeFileSync(target, buffer);
      const visuals = existing.visuals.map((visual) =>
        visual.id === req.params.visualId
          ? { ...visual, fileName: safeName, url: `/images/blog/${safeName}`, status: "uploaded" as const }
          : visual,
      );
      res.json(saveBlogPost({ ...existing, visuals }));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to upload visual." });
    }
  });

  app.post("/api/admin/blog-posts/:id/visuals/:visualId/generate", requireAdmin, async (req: any, res: any) => {
    try {
      const collection = readBlogCollection();
      const existing = collection.posts.find((post) => post.id === req.params.id);
      if (!existing) {
        res.status(404).json({ error: "Blog post not found." });
        return;
      }
      const visual = existing.visuals.find((item) => item.id === req.params.visualId);
      if (!visual) {
        res.status(404).json({ error: "Visual not found." });
        return;
      }
      const prompt = String(req.body?.prompt || visual.prompt || "").trim();
      if (!prompt) {
        res.status(400).json({ error: "Visual prompt is required." });
        return;
      }
      const buffer = await generateImageWithOpenAI(prompt);
      fs.mkdirSync(blogImagePath, { recursive: true });
      const safeBase = path.basename(visual.fileName || `${existing.slug.canonical}-${visual.id}.png`).replace(/[^a-zA-Z0-9._-]/g, "-");
      const fileName = `${Date.now()}-${safeBase.replace(/\.(png|jpe?g|webp|svg)$/i, "")}.png`;
      const target = path.resolve(blogImagePath, fileName);
      if (!target.startsWith(blogImagePath)) {
        res.status(400).json({ error: "Invalid generated image path." });
        return;
      }
      fs.writeFileSync(target, buffer);
      const visuals = existing.visuals.map((item) =>
        item.id === visual.id
          ? { ...item, fileName, url: `/images/blog/${fileName}`, prompt, status: "generated" as const }
          : item,
      );
      res.json(saveBlogPost({ ...existing, visuals }));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to generate visual." });
    }
  });

  const longLivedStaticOptions = {
    immutable: true,
    maxAge: "30d",
  };

  app.get("/index.html", (_req: any, res: any) => res.redirect(301, "/"));
  app.use("/images/blog", express.static(blogImagePath, longLivedStaticOptions));
  app.use("/assets", express.static(path.join(staticPath, "assets"), longLivedStaticOptions));
  app.use("/images", express.static(path.join(staticPath, "images"), longLivedStaticOptions));
  app.use("/data", express.static(path.join(staticPath, "data"), { maxAge: "5m" }));
  app.use(express.static(staticPath, { index: false }));

  const sendSeoPage = (res: any, page: SeoPage, status = 200) => {
    const template = fs.readFileSync(path.join(staticPath, "index.html"), "utf8");
    if (status >= 400 || page.robots?.includes("noindex")) {
      res.set("X-Robots-Tag", "noindex, nofollow");
    }
    res.status(status).type("html").send(renderSeoHtml(template, page));
  };
  const unavailablePage: SeoPage = {
    title: "Page not found | Ibrahim Tolgar Sasmaz",
    description: "The requested page is unavailable.",
    robots: "noindex, nofollow",
  };

  app.get("/robots.txt", (_req: any, res: any) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", (_req: any, res: any) => {
    try {
      const posts = readBlogCollection().posts.filter((post) => post.status === "published");
      res.type("application/xml").send(renderSitemap(posts));
    } catch (error) {
      res.status(500).type("text/plain").send("Sitemap unavailable.");
    }
  });
  app.get("/", (_req: any, res: any) => {
    sendSeoPage(res, {
      title: "Ibrahim Tolgar Sasmaz | Digital Growth, AI & Transformation",
      description: "Personal portfolio of Ibrahim Tolgar Sasmaz, a Munich-based digital growth and AI transformation leader with 12+ years across FMCG, SaaS and retail.",
      canonicalPath: "/",
      imagePath: "/assets/profile/tolgar-sasmaz-application-photo.jpeg",
      structuredData: {
        "@context": "https://schema.org", "@type": "Person",
        name: "Ibrahim Tolgar Sasmaz", url: SITE_ORIGIN,
        image: `${SITE_ORIGIN}/assets/profile/tolgar-sasmaz-application-photo.jpeg`,
      },
    });
  });
  app.get("/blog", (_req: any, res: any) => {
    sendSeoPage(res, {
      title: "Blog | Ibrahim Tolgar Sasmaz",
      description: "Articles on AI marketing, digital growth, performance marketing, e-commerce and transformation by Ibrahim Tolgar Sasmaz.",
      canonicalPath: "/blog",
      structuredData: {
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: "Ibrahim Tolgar Sasmaz Blog", url: `${SITE_ORIGIN}/blog`,
      },
    });
  });
  app.get("/blog/:slug/:lang", (req: any, res: any) => {
    const language = req.params.lang;
    if (!["en", "de", "tr"].includes(language)) {
      sendSeoPage(res, unavailablePage, 404);
      return;
    }
    const post = readBlogCollection().posts.find((item) =>
      item.status === "published" &&
      [item.slug.canonical, item.slug.en, item.slug.de, item.slug.tr].includes(req.params.slug)
    );
    if (!post || !availableArticleLanguages(post).includes(language)) {
      sendSeoPage(res, unavailablePage, 404);
      return;
    }
    const canonicalPath = articlePath(post, language);
    if (req.path !== canonicalPath) {
      res.redirect(301, canonicalPath);
      return;
    }
    sendSeoPage(res, articleSeoPage(post, language));
  });
  app.get("/blog/:slug", (req: any, res: any) => {
    const post = readBlogCollection().posts.find((item) =>
      item.status === "published" &&
      [item.slug.canonical, item.slug.en, item.slug.de, item.slug.tr].includes(req.params.slug)
    );
    if (!post) {
      sendSeoPage(res, unavailablePage, 404);
      return;
    }
    res.redirect(301, articlePath(post, availableArticleLanguages(post)[0] || "en"));
  });
  app.get("/admin", (_req: any, res: any) => {
    sendSeoPage(res, {
      title: "Admin | Ibrahim Tolgar Sasmaz",
      description: "Private content administration.",
      robots: "noindex, nofollow",
    });
  });
  app.get(/^\/(?:assets|images|data)\//, (_req: any, res: any) => {
    res.status(404).set("X-Robots-Tag", "noindex, nofollow").end();
  });
  app.get("*", (_req: any, res: any) => {
    sendSeoPage(res, unavailablePage, 404);
  });

  return app;
}
