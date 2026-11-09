import type { BlogPost } from "../shared/blog";
import { SITE_ORIGIN, articlePath, availableArticleLanguages } from "./seo";

/**
 * Search-visible HTML generated from the same published content as the React app.
 * This is a temporary initial DOM; createRoot replaces it after JavaScript loads.
 * All editor-provided text is escaped to avoid injecting unsafe HTML.
 */
const escape = (value: string) => value
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function textOnly(html: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  };
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
      if (entity.startsWith("#")) {
        const code = entity[1]?.toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
        if (Number.isInteger(code) && code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)) {
          return String.fromCodePoint(code);
        }
      }
      return named[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ").trim();
}

function articleBody(html: string): string {
  const result: string[] = [];
  const re = /<(h[2-6]|p|li|blockquote|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const text = textOnly(match[2]);
    if (!text) continue;
    const tag = /^h[2-6]$/i.test(match[1]) ? match[1].toLowerCase() : "p";
    result.push("<" + tag + ">" + escape(text) + "</" + tag + ">");
  }
  return result.length ? result.join("\n") : "<p>" + escape(textOnly(html)) + "</p>";
}

export function renderArticleSnapshot(post: BlogPost, language: "en" | "de" | "tr"): string {
  const title = post.seo[language].title || post.topic;
  const description = post.seo[language].metaDescription || post.topic;
  const alternates = availableArticleLanguages(post).map(lang =>
    '<a href="' + escape(articlePath(post, lang)) + '" hreflang="' + lang + '">' + lang.toUpperCase() + "</a>"
  ).join(" · ");
  const faq = post.faq?.[language] || [];
  const label = language === "tr" ? "Sık Sorulan Sorular" :
    language === "de" ? "Häufige Fragen" : "Frequently Asked Questions";
  const faqMarkup = faq.length ? '<section aria-label="' + escape(label) + '"><h2>' + escape(label) + "</h2>" +
    faq.map(item => "<h3>" + escape(item.question) + "</h3><p>" + escape(item.answer) + "</p>").join("\n") +
    "</section>" : "";
  return '<main class="seo-prerender"><article lang="' + language + '">' +
    '<nav aria-label="Blog navigation"><a href="/blog">Blog</a> · ' + alternates + "</nav>" +
    "<header><h1>" + escape(title) + "</h1><p>" + escape(description) + "</p></header>" +
    articleBody(post.content[language] || "") + faqMarkup + "</article></main>";
}

export function renderBlogIndexSnapshot(posts: BlogPost[]): string {
  const articles = posts.map(post => {
    const languages = availableArticleLanguages(post);
    if (!languages.length) return "";
    const primary = languages.includes("en") ? "en" : languages[0];
    const title = post.seo[primary].title || post.topic;
    const description = post.seo[primary].metaDescription || post.topic;
    const links = languages.map(lang =>
      '<a href="' + escape(articlePath(post, lang)) + '" hreflang="' + lang + '">' + lang.toUpperCase() + "</a>"
    ).join(" · ");
    return '<article><h2><a href="' + escape(articlePath(post, primary)) + '">' + escape(title) +
      "</a></h2><p>" + escape(description) + "</p><p>" + links + "</p></article>";
  }).filter(Boolean).join("\n");
  return '<main class="seo-prerender"><h1>Blog: AI, Digital Growth & Marketing</h1>' +
    "<p>Original articles and applied case studies by Ibrahim Tolgar Sasmaz.</p>" + articles + "</main>";
}

export function renderHomepageSnapshot(posts: BlogPost[]): string {
  const links = posts.slice(0, 12).map(post => {
    const languages = availableArticleLanguages(post);
    const lang = languages.includes("en") ? "en" : languages[0];
    if (!lang) return "";
    return '<li><a href="' + escape(articlePath(post, lang)) + '">' +
      escape(post.seo[lang].title || post.topic) + "</a></li>";
  }).filter(Boolean).join("");
  return '<main class="seo-prerender"><h1>Ibrahim Tolgar Sasmaz — Digital Growth, AI & Transformation</h1>' +
    "<p>Munich-based digital growth, marketing and AI transformation leadership.</p>" +
    '<p>Explore the <a href="/blog">blog and original case studies</a>.</p>' +
    (links ? "<section><h2>Selected articles</h2><ul>" + links + "</ul></section>" : "") + "</main>";
}

/** An optional, machine-readable directory of the same publicly accessible content. */
export function renderLlmsTxt(posts: BlogPost[]): string {
  const lines = [
    "# Ibrahim Tolgar Sasmaz | Digital Growth, AI & Transformation", "",
    "> Personal portfolio and original articles on AI, digital growth, performance marketing and e-commerce.",
    "", "- [Homepage](" + SITE_ORIGIN + "/)", "- [Blog](" + SITE_ORIGIN + "/blog)",
    "", "## Published articles",
  ];
  for (const post of posts) {
    for (const lang of availableArticleLanguages(post)) {
      const title = (post.seo[lang].title || post.topic).replace(/[\r\n\[\]]/g, " ");
      const description = (post.seo[lang].metaDescription || "").replace(/[\r\n]/g, " ");
      lines.push("- [" + title + " (" + lang.toUpperCase() + ")](" +
        SITE_ORIGIN + articlePath(post, lang) + "): " + description);
    }
  }
  return lines.join("\n") + "\n";
}
