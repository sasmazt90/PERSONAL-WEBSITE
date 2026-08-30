import fs from 'node:fs';

function patch(path, transform) {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`No changes applied to ${path}`);
  fs.writeFileSync(path, after);
}

patch('client/src/components/admin/RichTextEditor.tsx', (input) => {
  let source = input;

  source = source.replace(
`      href: {
        default: null,
        parseHTML: (element: HTMLElement) => element.closest("a")?.getAttribute("href") || element.getAttribute("data-href") || null,
      },`,
`      href: {
        default: null,
        parseHTML: (element: HTMLElement) => element.closest("a")?.getAttribute("href") || element.getAttribute("data-href") || null,
      },
      visualId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-visual-id") || null,
        renderHTML: (attributes: { visualId?: string | null }) => attributes.visualId ? { "data-visual-id": attributes.visualId } : {},
      },`
  );

  source = source.replace(
`  onUploadImage?: (file: File) => Promise<{ url: string; alt?: string }>;`,
`  onUploadImage?: (file: File) => Promise<{ url: string; alt?: string; visualId?: string }>;`
  );

  source = source.replace(
`        class: "prose prose-invert max-w-none min-h-[68vh] px-7 py-8 text-[17px] leading-8 text-slate-100 outline-none prose-headings:font-['Space_Grotesk'] prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-blue-300 prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-blockquote:border-l-blue-400 prose-blockquote:text-slate-300",`,
`        class: "blog-article-body max-w-none min-h-[68vh] px-7 py-8 outline-none",`
  );

  source = source.replace(
`    editor.chain().focus().setTextSelection(insertionPoint).setImage({ src: visual.url, alt: visual.alt[language] || visual.fileName }).run();`,
`    editor.chain().focus().setTextSelection(insertionPoint).insertContent({ type: "image", attrs: { src: visual.url, alt: visual.alt[language] || visual.fileName, visualId: visual.id } }).run();`
  );

  source = source.replace(
`      editor.chain().focus().setTextSelection(insertionPoint).setImage({ src: result.url, alt: result.alt || file.name.replace(/\\.[^.]+$/, "") }).run();`,
`      editor.chain().focus().setTextSelection(insertionPoint).insertContent({ type: "image", attrs: { src: result.url, alt: result.alt || file.name.replace(/\\.[^.]+$/, ""), visualId: result.visualId || null } }).run();`
  );

  source = source.replace(
`      <EditorContent editor={editor} />`,
`      <div className="overflow-hidden bg-white">
        <EditorContent editor={editor} />
      </div>`
  );

  return source;
});

patch('client/src/components/admin/BlogAdmin.tsx', (input) => {
  let source = input;

  source = source.replace(
`    return { url: result.url, alt: result.alt[language] || stripExtension(file.name) };`,
`    return { url: result.url, alt: result.alt[language] || stripExtension(file.name), visualId: result.id };`
  );

  source = source.replace(
`  const hero = post.visuals.find((visual) => visual.visualType === "hero");
  const thumbnail = getThumbnail(post);
  return (`,
`  const hero = post.visuals.find((visual) => visual.visualType === "hero");
  const thumbnail = getThumbnail(post);
  const previewInlineVisualIds = getInlineVisualIds(post.content[language] || "");
  const previewBodyVisuals = post.visuals.filter((visual) => visual.visualType !== "hero" && visual.visualType !== "thumbnail" && !previewInlineVisualIds.has(visual.id));
  return (`
  );

  source = source.replace(
`            {hero?.url ? <img src={hero.url} alt={hero.alt[language]} className="mb-8 max-h-[32rem] w-full rounded-2xl object-contain" /> : null}
            <div className="prose max-w-none prose-headings:font-['Space_Grotesk']" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content[language]) }} />
            {post.faq[language]?.length ?`,
`            {hero?.url ? <figure className="mb-10 overflow-hidden rounded-[1.75rem] border border-[#dce7f9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]"><img src={hero.url} alt={hero.alt[language]} className="max-h-[34rem] w-full bg-white object-contain" />{hero.caption[language] ? <figcaption className="px-5 py-4 text-sm text-[#5b667b]">{hero.caption[language]}</figcaption> : null}</figure> : null}
            <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content[language]) }} />
            {previewBodyVisuals.length ? <section className="mt-10 grid gap-6">{previewBodyVisuals.map((visual) => <figure key={visual.id} className="overflow-hidden rounded-[1.5rem] border border-[#dce7f9] bg-white">{visual.url ? <img src={visual.url} alt={visual.alt[language] || visual.fileName} className="max-h-[34rem] w-full bg-white object-contain" /> : <div className="flex min-h-56 items-center justify-center bg-[#eef4ff] px-6 text-center text-sm text-[#5b667b]">{visual.prompt}</div>}{visual.caption[language] ? <figcaption className="px-5 py-4 text-sm text-[#5b667b]">{visual.caption[language]}</figcaption> : null}</figure>)}</section> : null}
            {post.faq[language]?.length ?`
  );

  const helperAnchor = `function getThumbnail(post: BlogPost) {
  return post.visuals.find((visual) => visual.visualType === "thumbnail") || post.visuals.find((visual) => visual.visualType === "hero") || post.visuals[0];
}`;
  const helperReplacement = `${helperAnchor}\n\nfunction getInlineVisualIds(content: string) {\n  const ids = new Set<string>();\n  const pattern = /data-visual-id=[\"']([^\"']+)[\"']/g;\n  let match = pattern.exec(content);\n  while (match) {\n    ids.add(match[1]);\n    match = pattern.exec(content);\n  }\n  return ids;\n}`;
  if (!source.includes(helperAnchor)) throw new Error('BlogAdmin helper anchor not found');
  source = source.replace(helperAnchor, helperReplacement);

  return source;
});

patch('client/src/index.css', (input) => {
  let source = input;
  const anchor = `  .blog-article-body figure img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 34rem;
    object-fit: contain;
    background: #ffffff;
  }`;
  const replacement = `${anchor}\n\n  .blog-article-body > img,\n  .blog-article-body > a[data-linked-image] img {\n    display: block;\n    width: 100%;\n    height: auto;\n    max-height: 34rem;\n    margin: 2.25rem 0;\n    object-fit: contain;\n    border: 1px solid #dce7f9;\n    border-radius: 1.5rem;\n    background: #ffffff;\n    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);\n  }\n\n  .blog-article-body > a[data-linked-image] {\n    display: block;\n    text-decoration: none;\n  }\n\n  .blog-article-body a {\n    color: #2563eb;\n    font-weight: 700;\n    text-decoration: underline;\n    text-underline-offset: 0.16em;\n  }\n\n  .blog-article-body blockquote {\n    margin: 1.75rem 0;\n    border-left: 4px solid #2563eb;\n    background: #f8fbff;\n    padding: 1rem 1.25rem;\n    color: #475569;\n    font-style: italic;\n  }\n\n  .blog-article-body hr {\n    margin: 2.5rem 0;\n    border: 0;\n    border-top: 1px solid #dce7f9;\n  }\n\n  .blog-article-body pre {\n    margin: 1.75rem 0;\n    overflow-x: auto;\n    border-radius: 1rem;\n    background: #0f172a;\n    padding: 1rem 1.25rem;\n    color: #e2e8f0;\n    font-size: 0.92rem;\n    line-height: 1.65;\n  }\n\n  .blog-article-body code {\n    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;\n  }\n\n  .blog-article-body [data-cta-wrap] a[data-cta-button] {\n    color: #ffffff;\n    text-decoration: none;\n  }`;
  if (!source.includes(anchor)) throw new Error('Blog body CSS anchor not found');
  source = source.replace(anchor, replacement);
  return source;
});

console.log('Authoring canvas, preview and published article body now share the same rendering contract.');