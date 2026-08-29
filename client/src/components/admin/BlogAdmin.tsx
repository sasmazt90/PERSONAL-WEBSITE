import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Eye,
  ImagePlus,
  Languages,
  Loader2,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  blogCategories,
  blogLanguages,
  buildDocReadyContent,
  sanitizeHtml,
  uniqueBaseSlug,
  validateBlogPost,
  type BlogLanguage,
  type BlogPost,
  type BlogVisual,
} from "@shared/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  createManualBlogPost,
  deleteBlogPost,
  fetchAiStatus,
  fetchAdminBlogPosts,
  generateBlogVisual,
  generateBlogPost,
  publishBlogPost,
  saveBlogPost,
  uploadBlogVisual,
} from "@/lib/blogApi";

type BlogAdminMode = { type: "list" } | { type: "edit"; postId: string } | { type: "preview"; postId: string };
type StatusFilter = "all" | "draft" | "published";
type AiStatus = Awaited<ReturnType<typeof fetchAiStatus>>;
type SaveState = "saved" | "saving" | "unsaved" | "error";

const languageLabels: Record<BlogLanguage, string> = { en: "EN", de: "DE", tr: "TR" };
const languageNames: Record<BlogLanguage, string> = { en: "English", de: "German (DACH)", tr: "Turkish" };

export function BlogAdmin({ password }: { password: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [mode, setMode] = useState<BlogAdminMode>({ type: "list" });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  const loadPosts = async () => {
    if (!password) return;
    setError(null);
    try {
      const [collection, status] = await Promise.all([fetchAdminBlogPosts(password), fetchAiStatus(password)]);
      setPosts(collection.posts);
      setAiStatus(status);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load blog posts.");
    }
  };

  useEffect(() => {
    void loadPosts();
  }, [password]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      return [post.topic, post.slug.canonical, post.targetKeyword, post.seo.en.title, post.seo.de.title, post.seo.tr.title]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [posts, query, statusFilter]);

  const selectedPost = mode.type !== "list" ? posts.find((post) => post.id === mode.postId) : undefined;
  const replacePost = (post: BlogPost) => setPosts((current) => current.map((item) => (item.id === post.id ? post : item)));

  const addNewContent = async () => {
    setBusy(true);
    setError(null);
    try {
      const post = await createManualBlogPost({ topic: "Untitled Article", angle: "", targetKeyword: "", notes: "" }, password);
      setPosts((current) => [post, ...current]);
      setMode({ type: "edit", postId: post.id });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create a new draft.");
    } finally {
      setBusy(false);
    }
  };

  if (mode.type === "edit" && selectedPost) {
    return (
      <BlogEditor
        post={selectedPost}
        password={password}
        aiStatus={aiStatus}
        onBack={() => setMode({ type: "list" })}
        onPreview={(post) => {
          replacePost(post);
          setMode({ type: "preview", postId: post.id });
        }}
        onSaved={replacePost}
        onPublished={(post) => {
          replacePost(post);
          setMode({ type: "preview", postId: post.id });
        }}
        onDeleted={(postId) => {
          setPosts((current) => current.filter((post) => post.id !== postId));
          setMode({ type: "list" });
        }}
      />
    );
  }

  if (mode.type === "preview" && selectedPost) {
    return (
      <BlogPreview
        post={selectedPost}
        onBack={() => setMode({ type: "list" })}
        onEdit={() => setMode({ type: "edit", postId: selectedPost.id })}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold">Blog Content</h2>
            <p className="mt-1 text-sm text-slate-400">Write, localize, preview and publish articles from one editor.</p>
          </div>
          <Button type="button" onClick={() => void addNewContent()} disabled={busy} className="min-h-11 px-5">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add New Content
          </Button>
        </div>

        {aiStatus ? (
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <StatusPill label="AI localization" ok={aiStatus.textGeneration.configured} detail={aiStatus.textGeneration.model} />
            <StatusPill label="Image generation" ok={aiStatus.imageGeneration.configured} detail={aiStatus.imageGeneration.model} />
            {aiStatus.sourceContext ? <StatusPill label="Source context" ok={aiStatus.sourceContext.configured} detail={`${aiStatus.sourceContext.characterCount.toLocaleString()} chars`} /> : null}
          </div>
        ) : null}
        {error ? <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p> : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex rounded-2xl border border-white/10 bg-slate-950/50 p-1">
            {(["all", "draft", "published"] as StatusFilter[]).map((filter) => (
              <button key={filter} type="button" onClick={() => setStatusFilter(filter)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${statusFilter === filter ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10"}`}>
                {filter}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2.5">
            <Search size={16} className="text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, slug or keyword" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-500 sm:w-72" />
          </label>
        </div>

        <div className="grid gap-3">
          {filteredPosts.map((post) => {
            const thumbnail = getThumbnail(post);
            return (
              <article key={post.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 transition hover:border-white/20 md:flex-row md:items-center">
                <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 md:w-40">
                  {thumbnail?.url ? <img src={thumbnail.url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">No thumbnail</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge post={post} />
                    <span className="text-xs text-slate-500">Updated {formatDate(post.updatedAt)}</span>
                  </div>
                  <h3 className="mt-2 font-['Space_Grotesk'] text-lg font-bold text-white">{post.seo.en.title || post.topic}</h3>
                  <p className="mt-1 truncate text-sm text-slate-400">/{post.slug.canonical}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {blogLanguages.map((item) => <span key={item} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${post.content[item]?.trim() ? "bg-emerald-400/10 text-emerald-200" : "bg-white/5 text-slate-500"}`}>{languageLabels[item]}</span>)}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setMode({ type: "preview", postId: post.id })}><Eye size={15} />Preview</Button>
                  <Button type="button" size="sm" onClick={() => setMode({ type: "edit", postId: post.id })}>Edit</Button>
                </div>
              </article>
            );
          })}
          {!filteredPosts.length ? <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-500">No content found.</div> : null}
        </div>
      </section>
    </div>
  );
}

function BlogEditor({
  post,
  password,
  aiStatus,
  onBack,
  onPreview,
  onSaved,
  onPublished,
  onDeleted,
}: {
  post: BlogPost;
  password: string;
  aiStatus: AiStatus | null;
  onBack: () => void;
  onPreview: (post: BlogPost) => void;
  onSaved: (post: BlogPost) => void;
  onPublished: (post: BlogPost) => void;
  onDeleted: (postId: string) => void;
}) {
  const [draft, setDraft] = useState<BlogPost>(post);
  const [language, setLanguage] = useState<BlogLanguage>(() => firstPopulatedLanguage(post));
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const currentDraftRef = useRef(draft);
  const lastSavedFingerprintRef = useRef(fingerprint(post));
  const validation = validateBlogPost(draft);

  useEffect(() => {
    currentDraftRef.current = draft;
  }, [draft]);

  const updateDraft = (patch: Partial<BlogPost>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      currentDraftRef.current = next;
      return next;
    });
    setSaveState("unsaved");
  };

  const updateLanguageContent = (value: string) => {
    const sanitizedValue = sanitizeHtml(value);
    setDraft((current) => {
      const next = { ...current, content: { ...current.content, [language]: sanitizedValue } };
      currentDraftRef.current = next;
      return next;
    });
    setSaveState("unsaved");
  };

  const persistSnapshot = async (snapshot: BlogPost, surfaceErrors = false) => {
    setSaveState("saving");
    try {
      const saved = await saveBlogPost({ ...snapshot, docReadyContent: buildDocReadyContent(snapshot) }, password);
      lastSavedFingerprintRef.current = fingerprint(saved);
      onSaved(saved);
      if (fingerprint(currentDraftRef.current) === fingerprint(snapshot)) {
        currentDraftRef.current = saved;
        setDraft(saved);
        setSaveState("saved");
      } else {
        setSaveState("unsaved");
      }
      return saved;
    } catch (saveError) {
      setSaveState("error");
      if (surfaceErrors) setError(saveError instanceof Error ? saveError.message : "Failed to save draft.");
      throw saveError;
    }
  };

  const draftFingerprint = fingerprint(draft);
  useEffect(() => {
    if (draftFingerprint === lastSavedFingerprintRef.current || busy) return;
    const timer = window.setTimeout(() => {
      const snapshot = currentDraftRef.current;
      void persistSnapshot(snapshot).catch(() => undefined);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [draftFingerprint, busy]);

  const localize = async (sourcePost: BlogPost, sourceLanguage: BlogLanguage, force: boolean) => {
    const sourceHtml = sourcePost.content[sourceLanguage]?.trim();
    if (!sourceHtml) throw new Error(`Write the ${languageNames[sourceLanguage]} article first.`);
    if (!aiStatus?.textGeneration.configured) throw new Error("AI localization is not configured.");
    const targets = blogLanguages.filter((item) => item !== sourceLanguage && (force || needsLocalization(sourcePost, item)));
    if (!targets.length) return sourcePost;

    const generated = await generateBlogPost({
      topic: sourcePost.topic,
      targetKeyword: sourcePost.seo[sourceLanguage].focusKeyword || sourcePost.targetKeyword,
      angle: `LOCALIZATION ONLY. Use the supplied ${languageNames[sourceLanguage]} article as source of truth. Preserve facts, KPI values, semantic HTML, links and depth. German must be localized for DACH search intent, not translated literally.`,
      notes: `SOURCE LANGUAGE: ${sourceLanguage.toUpperCase()}\nSOURCE SEO TITLE: ${sourcePost.seo[sourceLanguage].title}\nSOURCE META DESCRIPTION: ${sourcePost.seo[sourceLanguage].metaDescription}\nSOURCE FAQ: ${JSON.stringify(sourcePost.faq[sourceLanguage] || [])}\nSOURCE ARTICLE HTML:\n${sourceHtml}`,
    }, password);

    const next = structuredClone(sourcePost);
    for (const target of targets) {
      next.content[target] = generated.content[target];
      next.seo[target] = generated.seo[target];
      next.slug[target] = generated.slug[target];
      next.faq[target] = generated.faq[target];
      next.visuals = next.visuals.map((visual) => {
        const candidate = generated.visuals.find((item) => item.visualType === visual.visualType);
        if (!candidate) return visual;
        return {
          ...visual,
          alt: { ...visual.alt, [target]: candidate.alt[target] || visual.alt[sourceLanguage] },
          caption: { ...visual.caption, [target]: candidate.caption[target] || visual.caption[sourceLanguage] },
        };
      });
    }
    try { await deleteBlogPost(generated.id, password); } catch { /* generated localization draft cleanup is best effort */ }
    return next;
  };

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      let next = currentDraftRef.current;
      const sourceLanguage = bestSourceLanguage(next, language);
      if (blogLanguages.some((item) => needsLocalization(next, item)) && aiStatus?.textGeneration.configured && next.content[sourceLanguage]?.trim()) {
        setMessage("Saving and localizing missing languages…");
        next = await localize(next, sourceLanguage, false);
        currentDraftRef.current = next;
        setDraft(next);
      }
      const saved = await persistSnapshot(next, true);
      setMessage("Saved");
      currentDraftRef.current = saved;
      setDraft(saved);
    } catch {
      // persist/localize already exposes the useful error
    } finally {
      setBusy(false);
    }
  };

  const handleLocalize = async () => {
    setBusy(true);
    setError(null);
    setMessage("Localizing EN / DE / TR…");
    try {
      const sourceLanguage = bestSourceLanguage(currentDraftRef.current, language);
      const next = await localize(currentDraftRef.current, sourceLanguage, true);
      currentDraftRef.current = next;
      setDraft(next);
      const saved = await persistSnapshot(next, true);
      setDraft(saved);
      currentDraftRef.current = saved;
      setMessage("Localization complete");
    } catch (localizeError) {
      setError(localizeError instanceof Error ? localizeError.message : "Localization failed.");
    } finally {
      setBusy(false);
    }
  };

  const handlePreview = async () => {
    setBusy(true);
    setError(null);
    try {
      const saved = await persistSnapshot(currentDraftRef.current, true);
      currentDraftRef.current = saved;
      setDraft(saved);
      onPreview(saved);
    } catch {
      // error already shown
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm(`Publish “${draft.topic}”?`)) return;
    setBusy(true);
    setError(null);
    setMessage("Preparing all languages…");
    try {
      let next = currentDraftRef.current;
      const sourceLanguage = bestSourceLanguage(next, language);
      if (blogLanguages.some((item) => needsLocalization(next, item))) next = await localize(next, sourceLanguage, false);
      const saved = await persistSnapshot(next, true);
      const published = await publishBlogPost(saved.id, password);
      currentDraftRef.current = published;
      setDraft(published);
      onPublished(published);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Failed to publish.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete “${draft.topic}”?`)) return;
    setBusy(true);
    try {
      await deleteBlogPost(draft.id, password);
      onDeleted(draft.id);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete.");
      setBusy(false);
    }
  };

  const uploadInlineImage = async (file: File) => {
    const visual: BlogVisual = {
      id: `visual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      visualType: "workflow",
      fileName: file.name,
      alt: { en: stripExtension(file.name), de: stripExtension(file.name), tr: stripExtension(file.name) },
      caption: { en: "", de: "", tr: "" },
      prompt: `Uploaded editorial visual for ${draft.topic}`,
      placement: "Inline article body",
      stylePreset: "editorial-lifestyle",
      status: "placeholder",
    };
    const withVisual = { ...currentDraftRef.current, visuals: [...currentDraftRef.current.visuals, visual] };
    const persisted = await saveBlogPost(withVisual, password);
    const uploaded = await uploadBlogVisual(persisted.id, visual.id, file, password);
    currentDraftRef.current = uploaded;
    setDraft(uploaded);
    lastSavedFingerprintRef.current = fingerprint(uploaded);
    onSaved(uploaded);
    const result = uploaded.visuals.find((item) => item.id === visual.id);
    if (!result?.url) throw new Error("Image upload completed but no URL was returned.");
    return { url: result.url, alt: result.alt[language] || stripExtension(file.name) };
  };

  return (
    <div className="space-y-5">
      <header className="sticky top-0 z-40 -mx-2 rounded-2xl border border-white/10 bg-[#0b1020]/95 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <button type="button" onClick={onBack} className="text-xs font-semibold text-slate-400 hover:text-white">← Back to Blog Content</button>
            <div className="mt-1 flex min-w-0 items-center gap-3">
              <h2 className="truncate font-['Space_Grotesk'] text-xl font-bold text-white">{draft.topic || "Untitled Article"}</h2>
              <SaveStateBadge state={saveState} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void handleLocalize()} disabled={busy || !aiStatus?.textGeneration.configured}><Languages size={15} />Localize</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void handleSave()} disabled={busy}><Save size={15} />Save</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void handlePreview()} disabled={busy}><Eye size={15} />Preview</Button>
            <Button type="button" size="sm" onClick={() => void handlePublish()} disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}Publish</Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete()} disabled={busy}><Trash2 size={15} /></Button>
          </div>
        </div>
        {message ? <p className="mt-2 text-xs text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-2 rounded-xl border border-rose-400/20 bg-rose-400/10 p-2.5 text-xs text-rose-200">{error}</p> : null}
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-5">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-xl border border-white/10 bg-slate-950/50 p-1">
                {blogLanguages.map((item) => (
                  <button key={item} type="button" onClick={() => setLanguage(item)} className={`rounded-lg px-4 py-2 text-xs font-bold ${language === item ? "bg-blue-500 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                    {languageLabels[item]}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">Autosaves while you write</span>
            </div>
            <RichTextEditor
              key={language}
              content={draft.content[language]}
              language={language}
              visuals={draft.visuals}
              internalLinks={draft.internalLinks}
              onUploadImage={uploadInlineImage}
              onChange={updateLanguageContent}
            />
          </section>

          <MediaManager post={draft} language={language} password={password} onChange={(next) => { currentDraftRef.current = next; setDraft(next); onSaved(next); lastSavedFingerprintRef.current = fingerprint(next); }} />
          <FaqEditor post={draft} language={language} onChange={updateDraft} />
          <InternalLinksEditor post={draft} onChange={updateDraft} />
        </main>

        <aside className="space-y-4 xl:sticky xl:top-[92px] xl:self-start">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <button type="button" onClick={() => setSettingsOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
              <div><h3 className="font-['Space_Grotesk'] text-lg font-bold">SEO & Publishing</h3><p className="mt-0.5 text-xs text-slate-500">{languageNames[language]}</p></div>
              <ChevronDown size={18} className={`transition ${settingsOpen ? "rotate-180" : ""}`} />
            </button>
            {settingsOpen ? (
              <div className="mt-4 grid gap-4">
                <Field label="Article title"><Input value={draft.topic} onChange={(event) => updateDraft({ topic: event.target.value })} className="bg-slate-950/70" /></Field>
                <Field label="Canonical slug"><Input value={draft.slug.canonical} onChange={(event) => updateDraft({ slug: { ...draft.slug, canonical: uniqueBaseSlug(event.target.value) } })} className="bg-slate-950/70" /></Field>
                <Field label={`${languageLabels[language]} slug`}><Input value={draft.slug[language]} onChange={(event) => updateDraft({ slug: { ...draft.slug, [language]: uniqueBaseSlug(event.target.value) } })} className="bg-slate-950/70" /></Field>
                <Field label="SEO title"><Input value={draft.seo[language].title} onChange={(event) => updateDraft({ seo: { ...draft.seo, [language]: { ...draft.seo[language], title: event.target.value } } })} className="bg-slate-950/70" /></Field>
                <Field label="Meta description"><Textarea value={draft.seo[language].metaDescription} onChange={(event) => updateDraft({ seo: { ...draft.seo, [language]: { ...draft.seo[language], metaDescription: event.target.value } } })} className="min-h-24 bg-slate-950/70" /></Field>
                <Field label="Focus keyword"><Input value={draft.seo[language].focusKeyword || ""} onChange={(event) => updateDraft({ seo: { ...draft.seo, [language]: { ...draft.seo[language], focusKeyword: event.target.value } } })} className="bg-slate-950/70" /></Field>
                <Field label="Categories">
                  <div className="grid gap-2">
                    {blogCategories.map((category) => (
                      <label key={category} className="flex items-center gap-2 text-xs text-slate-300">
                        <input type="checkbox" checked={draft.categories?.includes(category) || false} onChange={(event) => {
                          const current = draft.categories || [];
                          updateDraft({ categories: event.target.checked ? [...current, category] : current.filter((item) => item !== category) });
                        }} />
                        {category}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            ) : null}
          </section>

          <PublishReadiness post={draft} validation={validation} />
        </aside>
      </div>
    </div>
  );
}

function MediaManager({ post, language, password, onChange }: { post: BlogPost; language: BlogLanguage; password: string; onChange: (post: BlogPost) => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const thumbnail = post.visuals.find((visual) => visual.visualType === "thumbnail");
  const hero = post.visuals.find((visual) => visual.visualType === "hero");

  const persistAndUpload = async (visual: BlogVisual, file: File) => {
    setBusyId(visual.id);
    try {
      const exists = post.visuals.some((item) => item.id === visual.id);
      const base = exists ? post : { ...post, visuals: [...post.visuals, visual] };
      const saved = await saveBlogPost(base, password);
      const uploaded = await uploadBlogVisual(saved.id, visual.id, file, password);
      onChange(uploaded);
      return uploaded;
    } finally {
      setBusyId(null);
    }
  };

  const uploadThumbnail = async (file: File) => {
    const visual = thumbnail || createVisual(post, "thumbnail", file.name, "Blog listing thumbnail");
    await persistAndUpload(visual, file);
  };

  const useHeroAsThumbnail = async () => {
    if (!hero?.url) return;
    const nextVisuals = post.visuals.filter((visual) => visual.visualType !== "thumbnail").map((visual) => visual.id === hero.id ? visual : visual);
    const clone: BlogVisual = { ...hero, id: `thumbnail_${Date.now()}`, visualType: "thumbnail", fileName: hero.fileName, placement: "Blog listing thumbnail" };
    const saved = await saveBlogPost({ ...post, visuals: [...nextVisuals, clone] }, password);
    onChange(saved);
  };

  const updateVisual = (id: string, patch: Partial<BlogVisual>) => onChange({ ...post, visuals: post.visuals.map((item) => item.id === id ? { ...item, ...patch } : item) });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h3 className="font-['Space_Grotesk'] text-lg font-bold">Media Library</h3><p className="mt-1 text-xs text-slate-400">Uploaded visuals appear in the editor media picker and can be inserted by clicking their preview.</p></div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold hover:bg-white/10">
          <ImagePlus size={14} />Add visual
          <input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const visual = createVisual(post, "workflow", file.name, "Inline article body");
            await persistAndUpload(visual, file);
            event.currentTarget.value = "";
          }} />
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-400/[0.05] p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950 md:w-48">
            {thumbnail?.url ? <img src={thumbnail.url} alt={thumbnail.alt[language] || "Blog thumbnail"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">No listing thumbnail</div>}
          </div>
          <div className="flex-1">
            <div className="font-bold">Blog Listing Thumbnail</div>
            <p className="mt-1 text-xs text-slate-400">This 16:9 image is used on /blog cards. If missing, the hero is used as fallback.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500">
                <Upload size={14} />{thumbnail ? "Replace thumbnail" : "Upload thumbnail"}
                <input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={async (event) => { const file = event.target.files?.[0]; if (file) await uploadThumbnail(file); event.currentTarget.value = ""; }} />
              </label>
              {hero?.url ? <Button type="button" variant="outline" size="sm" onClick={() => void useHeroAsThumbnail()}>Use hero as thumbnail</Button> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {post.visuals.map((visual) => (
          <div key={visual.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35">
            <div className="aspect-video bg-slate-950">
              {visual.url ? <img src={visual.url} alt={visual.alt[language] || visual.fileName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">{visual.status}</div>}
            </div>
            <div className="grid gap-2 p-3">
              <select value={visual.visualType} onChange={(event) => updateVisual(visual.id, { visualType: event.target.value as BlogVisual["visualType"] })} className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs">
                <option value="hero">hero</option><option value="thumbnail">thumbnail</option><option value="framework">framework</option><option value="kpi">kpi</option><option value="workflow">workflow</option>
              </select>
              <Input value={visual.alt[language]} onChange={(event) => updateVisual(visual.id, { alt: { ...visual.alt, [language]: event.target.value } })} className="h-9 bg-slate-950/70 text-xs" placeholder="Alt text" />
              <Input value={visual.caption[language]} onChange={(event) => updateVisual(visual.id, { caption: { ...visual.caption, [language]: event.target.value } })} className="h-9 bg-slate-950/70 text-xs" placeholder="Caption" />
              <div className="flex gap-2">
                <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-[11px] font-bold hover:bg-white/10">
                  {busyId === visual.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}Replace
                  <input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={async (event) => { const file = event.target.files?.[0]; if (file) await persistAndUpload(visual, file); event.currentTarget.value = ""; }} />
                </label>
                <button type="button" onClick={() => onChange({ ...post, visuals: post.visuals.filter((item) => item.id !== visual.id) })} className="rounded-lg border border-white/10 px-2.5 text-rose-300 hover:bg-rose-400/10"><Trash2 size={13} /></button>
              </div>
              {visual.prompt?.trim() ? <Button type="button" variant="outline" size="sm" disabled={busyId === visual.id} onClick={async () => { setBusyId(visual.id); try { onChange(await generateBlogVisual(post.id, visual.id, visual.prompt, password)); } finally { setBusyId(null); } }}>Generate image</Button> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqEditor({ post, language, onChange }: { post: BlogPost; language: BlogLanguage; onChange: (patch: Partial<BlogPost>) => void }) {
  const items = post.faq[language] || [];
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-['Space_Grotesk'] text-lg font-bold">FAQ</h3><p className="mt-1 text-xs text-slate-500">Structured FAQ also feeds FAQ schema.</p></div><Button type="button" variant="outline" size="sm" onClick={() => onChange({ faq: { ...post.faq, [language]: [...items, { question: "", answer: "" }] } })}><Plus size={14} />Add FAQ</Button></div>
      {items.length ? <div className="mt-4 grid gap-3">{items.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border border-white/10 bg-slate-950/35 p-3"><Input value={item.question} onChange={(event) => onChange({ faq: { ...post.faq, [language]: items.map((faq, i) => i === index ? { ...faq, question: event.target.value } : faq) } })} className="bg-slate-950/70" placeholder="Question" /><Textarea value={item.answer} onChange={(event) => onChange({ faq: { ...post.faq, [language]: items.map((faq, i) => i === index ? { ...faq, answer: event.target.value } : faq) } })} className="bg-slate-950/70" placeholder="Answer" /><button type="button" onClick={() => onChange({ faq: { ...post.faq, [language]: items.filter((_, i) => i !== index) } })} className="justify-self-end text-xs font-bold text-rose-300">Remove</button></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No FAQ items yet.</p>}
    </section>
  );
}

function InternalLinksEditor({ post, onChange }: { post: BlogPost; onChange: (patch: Partial<BlogPost>) => void }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-['Space_Grotesk'] text-lg font-bold">Internal Links</h3><p className="mt-1 text-xs text-slate-500">These are available from the editor’s Internal Link action.</p></div><Button type="button" variant="outline" size="sm" onClick={() => onChange({ internalLinks: [...post.internalLinks, { label: "", url: "", language: "all", context: "" }] })}><Plus size={14} />Add Link</Button></div>
      <div className="mt-4 grid gap-3">{post.internalLinks.map((link, index) => <div key={`${index}-${link.url}`} className="grid gap-2 rounded-xl border border-white/10 bg-slate-950/35 p-3 sm:grid-cols-2"><Input value={link.label} onChange={(event) => onChange({ internalLinks: updateArray(post.internalLinks, index, { label: event.target.value }) })} className="bg-slate-950/70" placeholder="Label" /><Input value={link.url} onChange={(event) => onChange({ internalLinks: updateArray(post.internalLinks, index, { url: event.target.value }) })} className="bg-slate-950/70" placeholder="URL" /><Input value={link.context || ""} onChange={(event) => onChange({ internalLinks: updateArray(post.internalLinks, index, { context: event.target.value }) })} className="bg-slate-950/70 sm:col-span-2" placeholder="Context" /><button type="button" onClick={() => onChange({ internalLinks: post.internalLinks.filter((_, i) => i !== index) })} className="justify-self-end text-xs font-bold text-rose-300 sm:col-span-2">Remove</button></div>)}</div>
    </section>
  );
}

function PublishReadiness({ post, validation }: { post: BlogPost; validation: ReturnType<typeof validateBlogPost> }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="font-['Space_Grotesk'] text-lg font-bold">Publish Readiness</h3>
      <div className="mt-4 grid gap-2 text-xs">
        {readinessItems(post).map((item) => <div key={item.label} className={`flex items-center gap-2 ${item.ok ? "text-emerald-300" : "text-amber-300"}`}>{item.ok ? <Check size={13} /> : <span className="w-[13px] text-center">!</span>}{item.label}</div>)}
      </div>
      {validation.errors.length ? <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{validation.errors.join(" ")}</div> : null}
      {validation.warnings.length ? <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">{validation.warnings.slice(0, 6).map((warning) => <div key={warning}>{warning}</div>)}</div> : null}
    </section>
  );
}

function BlogPreview({ post, onBack, onEdit }: { post: BlogPost; onBack: () => void; onEdit: () => void }) {
  const [language, setLanguage] = useState<BlogLanguage>(() => firstPopulatedLanguage(post));
  const hero = post.visuals.find((visual) => visual.visualType === "hero");
  const thumbnail = getThumbnail(post);
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><button type="button" onClick={onBack} className="text-sm font-semibold text-slate-400 hover:text-white">← Back to Blog Content</button><h2 className="mt-1 font-['Space_Grotesk'] text-2xl font-bold">Preview</h2></div>
          <div className="flex flex-wrap gap-2">{blogLanguages.map((item) => <Button key={item} type="button" variant={language === item ? "default" : "outline"} onClick={() => setLanguage(item)}>{languageLabels[item]}</Button>)}<Button type="button" variant="outline" onClick={onEdit}>Edit</Button></div>
        </div>
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-white text-[#0f172a] shadow-2xl shadow-black/20">
          <header className="border-b border-[#e5eaf2] px-6 py-7 sm:px-10"><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">SEO title</div><h1 className="mt-2 text-4xl font-bold leading-tight">{post.seo[language].title || post.topic}</h1><p className="mt-4 text-lg leading-8 text-[#64748b]">{post.seo[language].metaDescription}</p></header>
          <div className="px-6 py-8 sm:px-10">
            {hero?.url ? <img src={hero.url} alt={hero.alt[language]} className="mb-8 max-h-[32rem] w-full rounded-2xl object-contain" /> : null}
            <div className="prose max-w-none prose-headings:font-['Space_Grotesk']" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content[language]) }} />
            {post.faq[language]?.length ? <section className="mt-10"><h2 className="text-2xl font-bold">FAQ</h2>{post.faq[language].map((item) => <div key={item.question} className="mt-5"><h3 className="font-bold">{item.question}</h3><p className="mt-1 text-[#64748b]">{item.answer}</p></div>)}</section> : null}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h3 className="font-['Space_Grotesk'] text-lg font-bold">Blog Listing Card Preview</h3>
        <div className="mt-4 max-w-md overflow-hidden rounded-2xl bg-white text-[#0f172a]">
          {thumbnail?.url ? <img src={thumbnail.url} alt={thumbnail.alt[language] || ""} className="aspect-video w-full object-cover" /> : <div className="flex aspect-video items-center justify-center bg-[#eef2f7] text-sm text-[#64748b]">No thumbnail</div>}
          <div className="p-5"><h4 className="text-xl font-bold">{post.seo[language].title || post.topic}</h4><p className="mt-2 line-clamp-2 text-sm text-[#64748b]">{post.seo[language].metaDescription}</p></div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-slate-300"><span>{label}</span>{children}</label>;
}

function SaveStateBadge({ state }: { state: SaveState }) {
  const config = state === "saved" ? ["Saved", "text-emerald-300"] : state === "saving" ? ["Saving…", "text-blue-300"] : state === "error" ? ["Save failed", "text-rose-300"] : ["Unsaved", "text-amber-300"];
  return <span className={`shrink-0 text-[11px] font-bold ${config[1]}`}>{config[0]}</span>;
}

function StatusPill({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${ok ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-amber-400/20 bg-amber-400/10 text-amber-200"}`}><span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-300" : "bg-amber-300"}`} />{label}<span className="opacity-60">{detail}</span></span>;
}

function StatusBadge({ post }: { post: BlogPost }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${post.status === "published" ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>{post.status}</span>;
}

function getThumbnail(post: BlogPost) {
  return post.visuals.find((visual) => visual.visualType === "thumbnail") || post.visuals.find((visual) => visual.visualType === "hero") || post.visuals[0];
}

function firstPopulatedLanguage(post: BlogPost): BlogLanguage {
  return blogLanguages.find((item) => post.content[item]?.trim()) || "en";
}

function bestSourceLanguage(post: BlogPost, current: BlogLanguage): BlogLanguage {
  if (post.content[current]?.trim()) return current;
  return firstPopulatedLanguage(post);
}

function needsLocalization(post: BlogPost, language: BlogLanguage) {
  return !post.content[language]?.trim() || !post.seo[language]?.title?.trim() || !post.seo[language]?.metaDescription?.trim();
}

function fingerprint(post: BlogPost) {
  return JSON.stringify({
    topic: post.topic,
    angle: post.angle,
    targetKeyword: post.targetKeyword,
    notes: post.notes,
    categories: post.categories,
    slug: post.slug,
    seo: post.seo,
    content: post.content,
    faq: post.faq,
    visuals: post.visuals,
    internalLinks: post.internalLinks,
  });
}

function createVisual(post: BlogPost, visualType: BlogVisual["visualType"], fileName: string, placement: string): BlogVisual {
  const label = stripExtension(fileName);
  return {
    id: `visual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    visualType,
    fileName,
    alt: { en: label, de: label, tr: label },
    caption: { en: "", de: "", tr: "" },
    prompt: `Premium ${visualType} visual for ${post.topic}. No embedded article title, no neon, no stock-photo look.`,
    placement,
    stylePreset: visualType === "framework" ? "clean-framework" : visualType === "kpi" ? "kpi-cards" : visualType === "workflow" ? "sticky-note-workflow" : "editorial-lifestyle",
    status: "placeholder",
  };
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function readinessItems(post: BlogPost) {
  return [
    ...blogLanguages.map((language) => ({ label: `${languageLabels[language]} content`, ok: Boolean(post.content[language]?.trim()) })),
    { label: "SEO titles & descriptions", ok: blogLanguages.every((language) => post.seo[language]?.title && post.seo[language]?.metaDescription) },
    { label: "Language slugs", ok: blogLanguages.every((language) => post.slug[language]) && Boolean(post.slug.canonical) },
    { label: "H1 structure", ok: blogLanguages.every((language) => !post.content[language]?.trim() || /<h1[\s>]/i.test(post.content[language])) },
    { label: "Hero image", ok: Boolean(post.visuals.find((visual) => visual.visualType === "hero")?.url) },
    { label: "Listing thumbnail", ok: Boolean(getThumbnail(post)?.url) },
    { label: "3+ visuals", ok: post.visuals.length >= 3 },
  ];
}

function updateArray<T>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
