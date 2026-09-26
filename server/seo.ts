import { blogLanguages, type BlogPost } from "../shared/blog";

export const SITE_ORIGIN = "https://www.sasmaz.digital";

type Alternate = { language: string; path: string };
export type SeoPage = {
  title: string;
  description: string;
  canonicalPath?: string;
  language?: string;
  robots?: string;
  imagePath?: string;
  type?: "website" | "article";
  alternates?: Alternate[];
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: unknown;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const absoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).href;

export function renderSeoHtml(template: string, page: SeoPage) {
  const canonical = page.canonicalPath ? absoluteUrl(page.canonicalPath) : undefined;
  const image = page.imagePath ? absoluteUrl(page.imagePath) : undefined;
  const tags = [
    `<meta name="robots" content="${escapeHtml(page.robots || "index, follow")}" />`,
    canonical && `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...(page.alternates || []).map(({ language, path }) =>
      `<link rel="alternate" hreflang="${escapeHtml(language)}" href="${escapeHtml(absoluteUrl(path))}" />`
    ),
    `<meta property="og:type" content="${page.type === "article" ? "article" : "website"}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    canonical && `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    image && `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    image && `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    page.publishedTime && `<meta property="article:published_time" content="${escapeHtml(page.publishedTime)}" />`,
    page.modifiedTime && `<meta property="article:modified_time" content="${escapeHtml(page.modifiedTime)}" />`,
    page.structuredData && `<script type="application/ld+json" data-site-seo>${JSON.stringify(page.structuredData).replace(/</g, "\\u003c")}</script>`,
  ].filter(Boolean).join("\n    ");

  return template
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${escapeHtml(page.language || "en")}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace("</head>", `    ${tags}\n  </head>`);
}

export function articlePath(post: BlogPost, language: string) {
  return `/blog/${encodeURIComponent(post.slug.canonical)}/${language}`;
}

export function availableArticleLanguages(post: BlogPost) {
  return blogLanguages.filter((language) =>
    Boolean(post.content?.[language]?.trim() && post.seo?.[language]?.title?.trim())
  );
}

export function articleAlternates(post: BlogPost): Alternate[] {
  const languages = availableArticleLanguages(post);
  return [
    ...languages.map((language) => ({ language, path: articlePath(post, language) })),
    ...(languages.includes("en") ? [{ language: "x-default", path: articlePath(post, "en") }] : []),
  ];
}

export function articleSeoPage(post: BlogPost, language: "en" | "de" | "tr"): SeoPage {
  const url = absoluteUrl(articlePath(post, language));
  const seo = post.seo[language];
  const visual = post.visuals.find((item) => item.visualType === "hero" && item.url)
    || post.visuals.find((item) => item.visualType === "thumbnail" && item.url)
    || post.visuals.find((item) => item.url);
  return {
    title: seo.title || post.topic,
    description: seo.metaDescription || post.topic,
    canonicalPath: articlePath(post, language),
    language,
    imagePath: visual?.url,
    type: "article",
    alternates: articleAlternates(post),
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: seo.title || post.topic,
      description: seo.metaDescription || post.topic,
      url,
      mainEntityOfPage: url,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      ...(visual?.url ? { image: absoluteUrl(visual.url) } : {}),
      author: { "@type": "Person", name: "Ibrahim Tolgar Sasmaz", url: SITE_ORIGIN },
      publisher: { "@type": "Person", name: "Ibrahim Tolgar Sasmaz", url: SITE_ORIGIN },
    },
  };
}

const lastModified = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `<lastmod>${date.toISOString()}</lastmod>`;
};

export function renderSitemap(posts: BlogPost[]) {
  const entries = [
    `<url><loc>${SITE_ORIGIN}/</loc></url>`,
    `<url><loc>${SITE_ORIGIN}/blog</loc></url>`,
    ...posts.flatMap((post) => {
      const alternates = articleAlternates(post);
      return availableArticleLanguages(post).map((language) =>
        `<url><loc>${escapeHtml(absoluteUrl(articlePath(post, language)))}</loc>${lastModified(post.updatedAt || post.publishedAt)}`
        + alternates.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate.language}" href="${escapeHtml(absoluteUrl(alternate.path))}" />`).join("")
        + `</url>`
      );
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>`;
}
