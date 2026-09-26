const siteOrigin = "https://www.sasmaz.digital";

type SeoOptions = {
  title: string;
  description: string;
  canonicalPath?: string;
  language?: string;
  robots?: string;
  imagePath?: string;
  type?: "website" | "article";
  alternates?: { language: string; path: string }[];
  structuredData?: unknown;
};

const absoluteUrl = (path: string) => new URL(path, siteOrigin).href;

function meta(selector: string, attribute: "name" | "property", key: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector) || document.createElement("meta");
  element.setAttribute(attribute, key);
  element.content = content;
  if (!element.isConnected) document.head.appendChild(element);
}

export function setPageSeo(options: SeoOptions) {
  document.title = options.title;
  document.documentElement.lang = options.language || "en";
  meta('meta[name="description"]', "name", "description", options.description);
  meta('meta[name="robots"]', "name", "robots", options.robots || "index, follow");
  meta('meta[property="og:type"]', "property", "og:type", options.type || "website");
  meta('meta[property="og:title"]', "property", "og:title", options.title);
  meta('meta[property="og:description"]', "property", "og:description", options.description);
  meta('meta[name="twitter:title"]', "name", "twitter:title", options.title);
  meta('meta[name="twitter:description"]', "name", "twitter:description", options.description);
  meta('meta[name="twitter:card"]', "name", "twitter:card", options.imagePath ? "summary_large_image" : "summary");

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (options.canonicalPath) {
    const link = canonical || document.createElement("link");
    link.rel = "canonical";
    link.href = absoluteUrl(options.canonicalPath);
    if (!link.isConnected) document.head.appendChild(link);
    meta('meta[property="og:url"]', "property", "og:url", link.href);
  } else {
    canonical?.remove();
    document.head.querySelector('meta[property="og:url"]')?.remove();
  }

  for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
    if (!options.imagePath) document.head.querySelector(selector)?.remove();
  }
  if (options.imagePath) {
    const image = absoluteUrl(options.imagePath);
    meta('meta[property="og:image"]', "property", "og:image", image);
    meta('meta[name="twitter:image"]', "name", "twitter:image", image);
  }

  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
  for (const alternate of options.alternates || []) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = alternate.language;
    link.href = absoluteUrl(alternate.path);
    document.head.appendChild(link);
  }

  const script = document.head.querySelector<HTMLScriptElement>('script[data-site-seo]');
  if (options.structuredData) {
    const node = script || document.createElement("script");
    node.type = "application/ld+json";
    node.dataset.siteSeo = "";
    node.textContent = JSON.stringify(options.structuredData);
    if (!node.isConnected) document.head.appendChild(node);
  } else {
    script?.remove();
  }
}
