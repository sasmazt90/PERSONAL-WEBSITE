import { describe, expect, it } from "vitest";
import { renderSeoHtml } from "./seo";

const template = '<!doctype html><html lang="en"><head><title>Portfolio</title><meta name="description" content="Portfolio" /></head><body><div id="root"></div><script src="/app.js"></script></body></html>';

describe("server-readable SEO snapshot", () => {
  it.each(["$$", "$&", "$`", "$'"])("preserves literal %s in article content", (token) => {
    const serverContent = `<main><h1>Article</h1><p>Literal ${token} text</p></main>`;
    const html = renderSeoHtml(template, {
      title: "Article",
      description: "Article summary",
      canonicalPath: "/blog/article/en",
      serverContent,
    });

    expect(html).toContain(`<div id="root">${serverContent}</div>`);
    expect(html.match(/id="root"/g)).toHaveLength(1);
    expect(html.match(/<script src="\/app.js"><\/script>/g)).toHaveLength(1);
    expect(html).toContain('rel="canonical" href="https://www.sasmaz.digital/blog/article/en"');
  });
});
