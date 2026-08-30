import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing patch target: ${label}`);
  return source.replace(before, after);
}

function patch(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next === source) {
    console.log(`No change needed for ${path}`);
    return;
  }
  fs.writeFileSync(path, next);
}

patch('shared/blog.ts', (input) => {
  let s = input;
  s = replaceOnce(s,
`  visuals: BlogVisual[];
  internalLinks: BlogInternalLink[];
  docReadyContent: string;`,
`  visuals: BlogVisual[];
  internalLinks: BlogInternalLink[];
  relatedArticleIds?: string[];
  relatedSystems?: BlogInternalLink[];
  docReadyContent: string;`, 'BlogPost related fields');

  s = replaceOnce(s,
`    visuals: [],
    internalLinks: defaultInternalLinks(),
    docReadyContent: "",`,
`    visuals: [],
    internalLinks: defaultInternalLinks(),
    relatedArticleIds: [],
    relatedSystems: [],
    docReadyContent: "",`, 'blank related fields');

  s = replaceOnce(s,
`    internalLinks: Array.isArray(value.internalLinks) ? value.internalLinks : defaultInternalLinks(),
    docReadyContent: value.docReadyContent || "",`,
`    internalLinks: Array.isArray(value.internalLinks) ? value.internalLinks : defaultInternalLinks(),
    relatedArticleIds: Array.isArray(value.relatedArticleIds) ? value.relatedArticleIds.filter((id): id is string => typeof id === "string") : [],
    relatedSystems: Array.isArray(value.relatedSystems) ? value.relatedSystems : [],
    docReadyContent: value.docReadyContent || "",`, 'normalize related fields');

  s = replaceOnce(s,
`  const links = post.internalLinks.map((link) => \`- \${link.label}: \${link.url} (\${link.language || "all"}) \${link.context || ""}\`).join("\\n");
  return \`# \${post.topic}`,
`  const links = post.internalLinks.map((link) => \`- \${link.label}: \${link.url} (\${link.language || "all"}) \${link.context || ""}\`).join("\\n");
  const relatedSystems = (post.relatedSystems || []).map((link) => \`- \${link.label}: \${link.url}\`).join("\\n");
  const relatedArticles = (post.relatedArticleIds || []).map((id) => \`- \${id}\`).join("\\n");
  return \`# \${post.topic}`, 'doc-ready related variables');

  s = replaceOnce(s,
`## Internal Links
\${links}

## Codex Implementation Prompt`,
`## Internal Links
\${links}

## Related Articles
\${relatedArticles || "- None selected"}

## Related Systems
\${relatedSystems || "- None selected"}

## Codex Implementation Prompt`, 'doc-ready related sections');

  s = replaceOnce(s,
`function defaultInternalLinks(): BlogInternalLink[] {
  return [
    { label: "SASMAZ Digital", url: "https://www.sasmaz.digital", language: "all", context: "Main portfolio and case-study context" },
    { label: "AdaptifAI", url: "https://adaptifai.sasmaz.digital", language: "all", context: "AI adaptation and product workflow context" },
    { label: "Wellpaid", url: "https://wellpaid.sasmaz.digital", language: "all", context: "Growth system/tool reference when relevant" },
  ];
}`,
`export const relatedSystemOptions: BlogInternalLink[] = [
  { label: "SASMAZ Digital", url: "https://www.sasmaz.digital", language: "all", context: "Main portfolio and case-study context" },
  { label: "AdaptifAI", url: "https://adaptifai.sasmaz.digital", language: "all", context: "AI adaptation and product workflow context" },
  { label: "BluffRoom", url: "https://bluffroom.sasmaz.digital", language: "all", context: "Interactive AI product and experimentation context" },
  { label: "Gamebooks AI", url: "https://gamebooks-ai.sasmaz.digital", language: "all", context: "AI storytelling and product experimentation context" },
  { label: "Recycle Lens", url: "https://recycle-lens.sasmaz.digital", language: "all", context: "Computer vision and sustainability product context" },
  { label: "WellPaid", url: "https://wellpaid.sasmaz.digital", language: "all", context: "Growth system and product reference" },
];

function defaultInternalLinks(): BlogInternalLink[] {
  return relatedSystemOptions.filter((item) => ["SASMAZ Digital", "AdaptifAI", "WellPaid"].includes(item.label)).map((item) => ({ ...item }));
}`, 'related system catalog');
  return s;
});

patch('client/src/components/admin/BlogAdmin.tsx', (input) => {
  let s = input;
  s = replaceOnce(s,
`  buildDocReadyContent,
  sanitizeHtml,`,
`  buildDocReadyContent,
  relatedSystemOptions,
  sanitizeHtml,`, 'import system options');
  s = replaceOnce(s,
`  type BlogLanguage,
  type BlogPost,
  type BlogVisual,`,
`  type BlogInternalLink,
  type BlogLanguage,
  type BlogPost,
  type BlogVisual,`, 'import link type');
  s = replaceOnce(s,
`        post={selectedPost}
        password={password}`,
`        post={selectedPost}
        availablePosts={posts}
        password={password}`, 'pass available posts');
  s = replaceOnce(s,
`function BlogEditor({
  post,
  password,`,
`function BlogEditor({
  post,
  availablePosts,
  password,`, 'editor param');
  s = replaceOnce(s,
`  post: BlogPost;
  password: string;`,
`  post: BlogPost;
  availablePosts: BlogPost[];
  password: string;`, 'editor props type');

  s = replaceOnce(s,
`          <MediaManager post={draft} language={language} password={password} onChange={(next) => { currentDraftRef.current = next; setDraft(next); onSaved(next); lastSavedFingerprintRef.current = fingerprint(next); }} />
          <FaqEditor post={draft} language={language} onChange={updateDraft} />
          <InternalLinksEditor post={draft} onChange={updateDraft} />`,
`          <MediaManager post={draft} language={language} password={password} onChange={(next) => { currentDraftRef.current = next; setDraft(next); setSaveState("unsaved"); }} onPersisted={(next) => { currentDraftRef.current = next; setDraft(next); onSaved(next); lastSavedFingerprintRef.current = fingerprint(next); setSaveState("saved"); }} />
          <FaqEditor post={draft} language={language} onChange={updateDraft} />
          <RelatedContentEditor post={draft} availablePosts={availablePosts} onChange={updateDraft} />
          <InternalLinksEditor post={draft} onChange={updateDraft} />`, 'editor content sections');

  s = replaceOnce(s,
`function MediaManager({ post, language, password, onChange }: { post: BlogPost; language: BlogLanguage; password: string; onChange: (post: BlogPost) => void }) {`,
`function MediaManager({ post, language, password, onChange, onPersisted }: { post: BlogPost; language: BlogLanguage; password: string; onChange: (post: BlogPost) => void; onPersisted: (post: BlogPost) => void }) {`, 'media manager signature');

  s = s.replaceAll('onChange(await uploadBlogVisual(', 'onPersisted(await uploadBlogVisual(');
  s = s.replaceAll('onChange(await generateBlogVisual(', 'onPersisted(await generateBlogVisual(');

  s = replaceOnce(s,
`function InternalLinksEditor({ post, onChange }: { post: BlogPost; onChange: (patch: Partial<BlogPost>) => void }) {`,
`function RelatedContentEditor({ post, availablePosts, onChange }: { post: BlogPost; availablePosts: BlogPost[]; onChange: (patch: Partial<BlogPost>) => void }) {
  const [articleId, setArticleId] = useState("");
  const [systemUrl, setSystemUrl] = useState("");
  const selectedArticleIds = post.relatedArticleIds || [];
  const selectedSystems = post.relatedSystems || [];
  const articleOptions = availablePosts.filter((item) => item.id !== post.id && !selectedArticleIds.includes(item.id));
  const systemCatalog = [...relatedSystemOptions, ...post.internalLinks].filter((item, index, items) => item.url && items.findIndex((candidate) => candidate.url === item.url) === index);
  const availableSystems = systemCatalog.filter((item) => !selectedSystems.some((selected) => selected.url === item.url));

  const addArticle = () => {
    if (!articleId) return;
    onChange({ relatedArticleIds: [...selectedArticleIds, articleId] });
    setArticleId("");
  };

  const addSystem = () => {
    const system = systemCatalog.find((item) => item.url === systemUrl);
    if (!system) return;
    onChange({ relatedSystems: [...selectedSystems, { ...system }] });
    setSystemUrl("");
  };

  const addCustomSystem = () => {
    const label = window.prompt("Related system label")?.trim();
    if (!label) return;
    const url = window.prompt("Related system URL", "https://")?.trim();
    if (!url) return;
    const custom: BlogInternalLink = { label, url, language: "all", context: "Manually selected related system" };
    onChange({ relatedSystems: [...selectedSystems, custom] });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5" data-testid="related-content-editor">
      <div>
        <h3 className="font-['Space_Grotesk'] text-lg font-bold">Related Content</h3>
        <p className="mt-1 text-xs text-slate-500">Manually control the Related Articles and Related Systems blocks shown below the article.</p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-sm font-bold text-white">Related Articles</div>
          <div className="mt-3 flex gap-2">
            <select aria-label="Related article" value={articleId} onChange={(event) => setArticleId(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-slate-200">
              <option value="">Select an existing article…</option>
              {articleOptions.map((item) => <option key={item.id} value={item.id}>{item.seo.en.title || item.topic} · {item.status}</option>)}
            </select>
            <Button type="button" variant="outline" size="sm" onClick={addArticle} disabled={!articleId}><Plus size={14} />Add</Button>
          </div>
          <div className="mt-3 grid gap-2">
            {selectedArticleIds.map((id) => {
              const item = availablePosts.find((candidate) => candidate.id === id);
              return <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-xs"><span className="min-w-0 truncate text-slate-200">{item?.seo.en.title || item?.topic || id}</span><button type="button" onClick={() => onChange({ relatedArticleIds: selectedArticleIds.filter((itemId) => itemId !== id) })} className="shrink-0 font-bold text-rose-300">Remove</button></div>;
            })}
            {!selectedArticleIds.length ? <p className="text-xs text-slate-500">No related articles selected.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="flex items-center justify-between gap-3"><div className="text-sm font-bold text-white">Related Systems</div><button type="button" onClick={addCustomSystem} className="text-xs font-bold text-blue-300 hover:text-blue-200">+ Custom</button></div>
          <div className="mt-3 flex gap-2">
            <select aria-label="Related system" value={systemUrl} onChange={(event) => setSystemUrl(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-slate-200">
              <option value="">Select an existing system…</option>
              {availableSystems.map((item) => <option key={item.url} value={item.url}>{item.label}</option>)}
            </select>
            <Button type="button" variant="outline" size="sm" onClick={addSystem} disabled={!systemUrl}><Plus size={14} />Add</Button>
          </div>
          <div className="mt-3 grid gap-2">
            {selectedSystems.map((item) => <div key={item.url} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-xs"><span className="min-w-0 truncate"><span className="font-bold text-slate-200">{item.label}</span><span className="ml-2 text-slate-500">{item.url}</span></span><button type="button" onClick={() => onChange({ relatedSystems: selectedSystems.filter((system) => system.url !== item.url) })} className="shrink-0 font-bold text-rose-300">Remove</button></div>)}
            {!selectedSystems.length ? <p className="text-xs text-slate-500">No related systems selected.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function InternalLinksEditor({ post, onChange }: { post: BlogPost; onChange: (patch: Partial<BlogPost>) => void }) {`, 'related content editor');

  s = replaceOnce(s,
`<div className="flex items-center justify-between gap-3"><div><h3 className="font-['Space_Grotesk'] text-lg font-bold">Internal Links</h3><p className="mt-1 text-xs text-slate-500">These are available from the editor’s Internal Link action.</p></div>`,
`<div className="flex items-center justify-between gap-3"><div><h3 className="font-['Space_Grotesk'] text-lg font-bold">Inline / Internal Links</h3><p className="mt-1 text-xs text-slate-500">Link library for inserting links inside article copy. Related Systems are managed separately above.</p></div>`, 'internal links copy');

  const oldReadiness = `function PublishReadiness({ post, validation }: { post: BlogPost; validation: ReturnType<typeof validateBlogPost> }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="font-['Space_Grotesk'] text-lg font-bold">Publish Readiness</h3>
      <div className="mt-4 grid gap-2 text-xs">
        {readinessItems(post).map((item) => <div key={item.label} className={\`flex items-center gap-2 \${item.ok ? "text-emerald-300" : "text-amber-300"}\`}>{item.ok ? <Check size={13} /> : <span className="w-[13px] text-center">!</span>}{item.label}</div>)}
      </div>
      {validation.errors.length ? <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{validation.errors.join(" ")}</div> : null}
      {validation.warnings.length ? <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">{validation.warnings.slice(0, 6).map((warning) => <div key={warning}>{warning}</div>)}</div> : null}
    </section>
  );
}`;
  const newReadiness = `function PublishReadiness({ post, validation }: { post: BlogPost; validation: ReturnType<typeof validateBlogPost> }) {
  const blockers = Array.from(new Set(validation.errors));
  const recommendations = Array.from(new Set(validation.warnings));
  const languagesReady = blogLanguages.filter((item) => post.content[item]?.trim() && post.seo[item]?.title?.trim() && post.seo[item]?.metaDescription?.trim()).length;
  const mediaReady = Boolean(post.visuals.find((visual) => visual.visualType === "hero")?.url) && Boolean(getThumbnail(post)?.url);
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-['Space_Grotesk'] text-lg font-bold">Publish Readiness</h3>
        <span className={\`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide \${blockers.length ? "bg-rose-400/15 text-rose-200" : "bg-emerald-400/15 text-emerald-200"}\`}>{blockers.length ? \`\${blockers.length} required\` : "Ready"}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3"><span className="text-slate-500">Languages</span><div className={\`mt-1 font-bold \${languagesReady === 3 ? "text-emerald-300" : "text-amber-300"}\`}>{languagesReady}/3 complete</div></div>
        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3"><span className="text-slate-500">Media</span><div className={\`mt-1 font-bold \${mediaReady ? "text-emerald-300" : "text-amber-300"}\`}>{mediaReady ? "Hero + thumbnail" : "Needs review"}</div></div>
      </div>
      {blockers.length ? <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3"><div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-rose-200">Required before publishing</div><div className="grid gap-1.5 text-xs text-rose-100">{blockers.map((item) => <div key={item}>• {item}</div>)}</div></div> : <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-200"><Check size={14} />No blocking validation errors.</div>}
      {recommendations.length ? <details className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.08] p-3"><summary className="cursor-pointer text-xs font-bold text-amber-100">{recommendations.length} recommendation{recommendations.length === 1 ? "" : "s"}</summary><div className="mt-2 grid gap-1.5 text-xs text-amber-100/90">{recommendations.map((item) => <div key={item}>• {item}</div>)}</div></details> : null}
    </section>
  );
}`;
  s = replaceOnce(s, oldReadiness, newReadiness, 'publish readiness');

  s = replaceOnce(s,
`    internalLinks: post.internalLinks,
  });`,
`    internalLinks: post.internalLinks,
    relatedArticleIds: post.relatedArticleIds || [],
    relatedSystems: post.relatedSystems || [],
  });`, 'fingerprint related fields');

  const readinessStart = s.indexOf('function readinessItems(post: BlogPost) {');
  if (readinessStart !== -1) {
    const readinessEnd = s.indexOf('\nfunction updateArray', readinessStart);
    if (readinessEnd === -1) throw new Error('Could not locate readinessItems end');
    s = s.slice(0, readinessStart) + s.slice(readinessEnd + 1);
  }
  return s;
});

patch('client/src/pages/BlogArticle.tsx', (input) => {
  let s = input;
  s = replaceOnce(s,
`  const candidates = posts.filter((item) => item.id !== post.id).slice(0, 9);
  const fallbackLinks = post.internalLinks.filter((link) => !link.language || link.language === "all" || link.language === language).slice(0, 6);`,
`  const hasManualArticleSelection = Array.isArray(post.relatedArticleIds);
  const candidates = hasManualArticleSelection
    ? (post.relatedArticleIds || []).map((id) => posts.find((item) => item.id === id)).filter((item): item is BlogPost => Boolean(item))
    : posts.filter((item) => item.id !== post.id).slice(0, 9);
  const fallbackLinks = hasManualArticleSelection ? [] : post.internalLinks.filter((link) => !link.language || link.language === "all" || link.language === language).slice(0, 6);`, 'manual related article candidates');

  s = replaceOnce(s,
`          {post.internalLinks.length ? (
            <section className="mt-10 rounded-[1.75rem] border border-[#dce7f9] bg-white p-6">
              <h2 className="font-['Space_Grotesk'] text-2xl font-bold">Related Systems</h2>
              <div className="mt-4 grid gap-3">
                {post.internalLinks.filter((link) => !link.language || link.language === "all" || link.language === language).map((link) => (`,
`          {(Array.isArray(post.relatedSystems) ? post.relatedSystems : post.internalLinks).length ? (
            <section className="mt-10 rounded-[1.75rem] border border-[#dce7f9] bg-white p-6">
              <h2 className="font-['Space_Grotesk'] text-2xl font-bold">Related Systems</h2>
              <div className="mt-4 grid gap-3">
                {(Array.isArray(post.relatedSystems) ? post.relatedSystems : post.internalLinks).filter((link) => !link.language || link.language === "all" || link.language === language).map((link) => (`, 'manual related systems');
  return s;
});

patch('client/src/index.css', (input) => {
  if (input.includes('.blog-article-body table')) return input;
  return `${input}\n\n/* Blog rich-text tables: visible in both editor output and published articles. */\n.blog-article-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; overflow-x: auto; }\n.blog-article-body th,\n.blog-article-body td { border: 1px solid #cbd5e1; padding: 0.65rem 0.75rem; vertical-align: top; }\n.blog-article-body th { font-weight: 700; background: #f8fafc; }\n.blog-article-body a[data-linked-image=\"true\"] { display: inline-block; text-decoration: none; }\n.blog-article-body a[data-linked-image=\"true\"] img { cursor: pointer; }\n`;
});

patch('e2e/blog-cms.spec.ts', (input) => {
  let s = input;
  s = replaceOnce(s,
`  await expect(editor.locator('[data-cta-wrap] a')).toHaveText('Watch the full video');
  await expect(preservedParagraph).toHaveCount(1);

  await page.getByRole('button', { name: 'Media library' }).click();`,
`  await expect(editor.locator('[data-cta-wrap] a')).toHaveText('Watch the full video');
  await expect(preservedParagraph).toHaveCount(1);

  await page.getByRole('button', { name: 'Table' }).click();
  await expect(page.getByTestId('table-tools')).toBeVisible();
  await page.getByLabel('Table rows').fill('4');
  await page.getByLabel('Table columns').fill('5');
  await page.getByRole('button', { name: 'Insert table' }).click();
  await expect(editor.locator('table')).toHaveCount(1);
  await expect(editor.locator('table tr')).toHaveCount(4);
  await expect(editor.locator('table tr').first().locator('th')).toHaveCount(5);
  await editor.locator('table td').first().click();
  await page.getByRole('button', { name: 'Add row below' }).click();
  await page.getByRole('button', { name: 'Add column after' }).click();
  await expect(editor.locator('table tr')).toHaveCount(5);
  await expect(editor.locator('table tr').first().locator('th')).toHaveCount(6);
  await page.getByLabel('Cell background').fill('#334155');
  await page.getByLabel('Cell text color').fill('#ffffff');
  await expect(editor.locator('table td').first()).toHaveAttribute('style', /background-color/);

  await page.getByRole('button', { name: 'Media library' }).click();`, 'table e2e');

  s = replaceOnce(s,
`  await mediaPicker.locator('img').first().locator('xpath=ancestor::button[1]').click();
  await expect(editor.locator('img')).toHaveCount(2);
  await expect(editor.locator('[data-cta-wrap] a')).toHaveText('Watch the full video');`,
`  await mediaPicker.locator('img').first().locator('xpath=ancestor::button[1]').click();
  await expect(editor.locator('img')).toHaveCount(2);
  const linkedImageTarget = 'https://www.sasmaz.digital';
  await editor.locator('img').last().click();
  page.once('dialog', async (dialog) => dialog.accept(linkedImageTarget));
  await page.getByRole('button', { name: 'Image link' }).click();
  await expect(editor.locator('a[data-linked-image="true"]').last()).toHaveAttribute('href', linkedImageTarget);
  await expect(editor.locator('[data-cta-wrap] a')).toHaveText('Watch the full video');`, 'image link e2e');

  s = replaceOnce(s,
`  await expect(page.locator('.ProseMirror img')).toHaveCount(2);
});`,
`  await expect(page.locator('.ProseMirror img')).toHaveCount(2);
  await expect(page.locator('.ProseMirror table')).toHaveCount(1);
  await expect(page.locator('.ProseMirror a[data-linked-image="true"]')).toHaveCount(1);
});`, 'persistence e2e');
  return s;
});

console.log('CMS content controls patch applied.');
