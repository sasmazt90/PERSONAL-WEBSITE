import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { BriefcaseBusiness, ChevronDown, FileText, Globe, Plus, RefreshCcw, Save, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlogAdmin } from "@/components/admin/BlogAdmin";
import { setPageSeo } from "@/lib/seo";
import { usePortfolioData, type PortfolioData } from "@/contexts/PortfolioDataContext";
import { useSiteContent, type SiteContent } from "@/contexts/SiteContentContext";

type SourceKind = "portfolio" | "site";
type PortfolioKey = keyof PortfolioData;
type SiteKey = keyof SiteContent;
type DraftKey = `${SourceKind}:${string}`;
type ViewMode = "form" | "json";
const ADMIN_SESSION_KEY = "portfolio-admin-authenticated";
const ADMIN_PASSWORD_SESSION_KEY = "portfolio-admin-password";

interface SectionDescriptor {
  draftKey: DraftKey;
  source: SourceKind;
  key: string;
  title: string;
  description: string;
  group?: string;
  order: number;
}

const portfolioSectionMeta: Partial<Record<PortfolioKey, { title: string; description: string; order: number }>> = {
  personalInfo: {
    title: "Personal Info",
    description: "Hero iletişim bilgileri, sosyal linkler ve temel kimlik alanları.",
    order: 10,
  },
  heroMetrics: {
    title: "Legacy Hero Metrics",
    description: "Eski veri yapisindan kalan hero metric alanlari.",
    order: 15,
  },
  experiences: {
    title: "Legacy Experience",
    description: "Eski veri yapısından kalan deneyim alanları.",
    order: 20,
  },
  education: {
    title: "Legacy Education",
    description: "Eski veri yapısından kalan eğitim alanları.",
    order: 30,
  },
  skills: {
    title: "Legacy Skills",
    description: "Eski veri yapısından kalan yetkinlik alanları.",
    order: 40,
  },
  projects: {
    title: "Legacy Projects",
    description: "Eski veri yapısından kalan proje alanları.",
    order: 50,
  },
  certifications: {
    title: "Legacy Certifications",
    description: "Eski veri yapisindan kalan sertifika alanlari.",
    order: 55,
  },
  languages: {
    title: "Legacy Languages",
    description: "Eski veri yapisindan kalan dil alanlari.",
    order: 58,
  },
  toolsData: {
    title: "Legacy Tools Data",
    description: "Eski veri yapisindan kalan tools / platform alanlari.",
    order: 60,
  },
  awards: {
    title: "Legacy Awards",
    description: "Eski veri yapisindan kalan odul alanlari.",
    order: 62,
  },
  caseStudies: {
    title: "Legacy Case Studies",
    description: "Eski veri yapisindan kalan case study alanlari.",
    order: 64,
  },
  speakingMentoring: {
    title: "Legacy Speaking & Mentoring",
    description: "Eski veri yapisindan kalan konusma ve mentorluk alanlari.",
    order: 66,
  },
};

const siteSectionMeta: Partial<Record<SiteKey, { title: string; description: string; group?: string; order: number }>> = {
  highlightMetrics: {
    title: "Hero Metrics",
    description: "Hero görselinin altında çıkan sayaç/metrik kutuları.",
    group: "Hero",
    order: 100,
  },
  education: {
    title: "Education",
    description: "About bölümünün sağındaki eğitim kartları.",
    group: "About",
    order: 200,
  },
  careerTimeline: {
    title: "Career Journey",
    description: "Timeline node’ları ve alttaki detay kartı içeriği.",
    group: "Career Journey",
    order: 300,
  },
  aiProducts: {
    title: "AI Innovation & Product Portfolio",
    description: "Vibe Coding ve Power Apps kartlarının ana içerik listesi.",
    group: "Products",
    order: 400,
  },
  videoPortfolio: {
    title: "Digital Video Production",
    description: "Artık ürün portföyü section’ı altında gösterilen video işleri.",
    group: "Products",
    order: 410,
  },
  caseStudies: {
    title: "Selected Case Studies",
    description: "Industry Impact & Recognition altındaki case study kartları.",
    group: "Industry Impact & Recognition",
    order: 500,
  },
  speaking: {
    title: "Speaking & Mentorship",
    description: "Konuşma, mentorluk ve akademik görünürlük kartları.",
    group: "Industry Impact & Recognition",
    order: 510,
  },
  toolClusters: {
    title: "Technology Stack",
    description: "Core Competencies altında gösterilen teknoloji stack kartları.",
    group: "Core Competencies",
    order: 600,
  },
  certifications: {
    title: "Advanced Certifications",
    description: "Core Competencies altında gösterilen sertifika kartları.",
    group: "Core Competencies",
    order: 610,
  },
  capabilityPillars: {
    title: "Capability Pillars",
    description: "Ek stratejik capability verileri.",
    group: "Supporting Content",
    order: 700,
  },
  storyHighlights: {
    title: "Story Highlights",
    description: "Metinsel highlight blokları ve yardımcı içerikler.",
    group: "Supporting Content",
    order: 710,
  },
  photoMoments: {
    title: "Photo Moments",
    description: "Eski yapıdan kalan fotoğraf verileri. Şu an hero carousel dışında aktif kullanılmıyor.",
    group: "Supporting Content",
    order: 720,
  },
};

function toDrafts(source: SourceKind, data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [`${source}:${key}`, JSON.stringify(value, null, 2)]),
  ) as Record<DraftKey, string>;
}

export default function Admin() {
  const portfolio = usePortfolioData();
  const site = useSiteContent();

  const sections = useMemo<SectionDescriptor[]>(
    () =>
      [
        ...Object.keys(portfolio.portfolioData).map((key) => {
          const typedKey = key as PortfolioKey;
          const meta = portfolioSectionMeta[typedKey];
          return {
            draftKey: `portfolio:${key}` as DraftKey,
            source: "portfolio" as const,
            key,
            title: meta?.title ?? prettifyKey(key),
            description: meta?.description ?? "Core profile data used across the portfolio.",
            order: meta?.order ?? 900,
          };
        }),
        ...Object.keys(site.siteContent).map((key) => {
          const typedKey = key as SiteKey;
          const meta = siteSectionMeta[typedKey];
          return {
            draftKey: `site:${key}` as DraftKey,
            source: "site" as const,
            key,
            title: meta?.title ?? prettifyKey(key),
            description: meta?.description ?? "Homepage content block used by the redesigned landing page.",
            group: meta?.group,
            order: meta?.order ?? 1000,
          };
        }),
      ].sort((a, b) => a.order - b.order),
    [portfolio.portfolioData, site.siteContent],
  );

  const [drafts, setDrafts] = useState<Record<DraftKey, string>>({
    ...toDrafts("portfolio", portfolio.portfolioData as Record<string, unknown>),
    ...toDrafts("site", site.siteContent as Record<string, unknown>),
  });
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [savingKey, setSavingKey] = useState<DraftKey | "all" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<DraftKey, ViewMode>>({} as Record<DraftKey, ViewMode>);
  const [activeTab, setActiveTab] = useState<"career" | "blog">("career");
  const [careerQuery, setCareerQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<DraftKey>>(() => new Set());
  const visibleSections = sections.filter((section) =>
    `${section.title} ${section.description} ${section.group || ""}`.toLowerCase().includes(careerQuery.toLowerCase().trim())
  );
  const toggleSection = (draftKey: DraftKey) => setExpandedSections((current) => {
    const next = new Set(current);
    if (next.has(draftKey)) next.delete(draftKey);
    else next.add(draftKey);
    return next;
  });

  useEffect(() => {
    setPageSeo({
      title: "Admin | Ibrahim Tolgar Sasmaz",
      description: "Private content administration.",
      robots: "noindex, nofollow",
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPassword = window.sessionStorage.getItem(ADMIN_PASSWORD_SESSION_KEY);
    if (window.sessionStorage.getItem(ADMIN_SESSION_KEY) !== "true" || !savedPassword) return;
    const controller = new AbortController();
    fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: savedPassword }),
      signal: controller.signal,
    }).then((response) => {
      if (!response.ok) {
        window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
        window.sessionStorage.removeItem(ADMIN_PASSWORD_SESSION_KEY);
        setSaveError("Admin session expired. Please sign in again.");
        return;
      }
      setPassword(savedPassword);
      setIsUnlocked(true);
    }).catch(() => {
      if (!controller.signal.aborted) setSaveError("Could not verify the admin session. Please sign in again.");
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setDrafts({
      ...toDrafts("portfolio", portfolio.portfolioData as Record<string, unknown>),
      ...toDrafts("site", site.siteContent as Record<string, unknown>),
    });
  }, [portfolio.portfolioData, site.siteContent]);

  useEffect(() => {
    setViewModes((current) => {
      const next = { ...current };
      for (const section of sections) {
        next[section.draftKey] ??= "form";
      }
      return next;
    });
  }, [sections]);

  const updateDraftValue = (draftKey: DraftKey, value: unknown) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: JSON.stringify(value, null, 2),
    }));
  };

  const savePayload = async (url: string, payload: unknown) => {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(password ? { "x-admin-password": password } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error || `Save failed (${response.status})`);
    }
  };

  const handleUnlock = async () => {
    setIsAuthenticating(true);
    setSaveError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Authentication failed (${response.status})`);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        window.sessionStorage.setItem(ADMIN_PASSWORD_SESSION_KEY, password);
      }

      setIsUnlocked(true);
      setStatus("Admin access granted.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to verify admin password.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6 space-y-3 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                <Shield size={14} />
                Protected Admin Area
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold">Admin Login</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Bu sayfayi acmadan once admin sifresi girilmelidir.
                </p>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleUnlock();
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Sifre</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  className="bg-slate-950/70"
                />
              </label>

              {saveError ? <p className="text-sm text-rose-300">{saveError}</p> : null}

              <Button type="submit" className="w-full" disabled={!password || isAuthenticating}>
                <Shield size={16} />
                {isAuthenticating ? "Kontrol ediliyor..." : "Giris yap"}
              </Button>

              <div className="text-center">
                <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                  Siteye don
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const saveSection = async (section: SectionDescriptor) => {
    setSaveError(null);
    setStatus(null);

    if (section.source === "portfolio") {
      const nextData = {
        ...portfolio.portfolioData,
        [section.key]: JSON.parse(drafts[section.draftKey]),
      } as PortfolioData;
      await savePayload("/api/portfolio", nextData);
      await portfolio.refresh();
    } else {
      const nextData = {
        ...site.siteContent,
        [section.key]: JSON.parse(drafts[section.draftKey]),
      } as SiteContent;
      await savePayload("/api/site-content", nextData);
      await site.refresh();
    }
  };

  const handleSaveSection = async (section: SectionDescriptor) => {
    setSavingKey(section.draftKey);
    try {
      await saveSection(section);
      setStatus(`${section.title} saved successfully.`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save section.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingKey("all");
    setSaveError(null);
    setStatus(null);

    try {
      const nextPortfolio = { ...portfolio.portfolioData } as Record<PortfolioKey, unknown>;
      const nextSite = { ...site.siteContent } as Record<SiteKey, unknown>;

      for (const key of Object.keys(portfolio.portfolioData) as PortfolioKey[]) {
        nextPortfolio[key] = JSON.parse(drafts[`portfolio:${String(key)}` as DraftKey]);
      }

      for (const key of Object.keys(site.siteContent) as SiteKey[]) {
        nextSite[key] = JSON.parse(drafts[`site:${String(key)}` as DraftKey]);
      }

      await savePayload("/api/portfolio", nextPortfolio);
      await savePayload("/api/site-content", nextSite);
      await Promise.all([portfolio.refresh(), site.refresh()]);
      setStatus("All content saved successfully.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save content.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <Globe size={14} />
                Web uzerinden duzenlenebilir portfolyo
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold sm:text-4xl">Admin Backoffice</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
                  Career tab keeps the existing portfolio admin workflow. Blog tab adds draft generation, editing,
                  preview, publishing, image handling, SEO, and deletion for sasmaz.digital/blog.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                <Shield size={16} className="text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  className="w-44 bg-transparent outline-none placeholder:text-slate-500"
                />
              </label>
              <button
                type="button"
                onClick={() => void Promise.all([portfolio.refresh(), site.refresh()])}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15"
              >
                <RefreshCcw size={16} />
                Yenile
              </button>
              <button
                type="button"
                onClick={() => void handleSaveAll()}
                disabled={savingKey !== null}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {savingKey === "all" ? "Kaydediliyor..." : "Tumunu Kaydet"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <Link href="/" className="rounded-full border border-white/10 px-3 py-1 transition hover:bg-white/10">
              Siteye don
            </Link>
            {(portfolio.isLoading || site.isLoading) && <span>Veri yukleniyor...</span>}
            {portfolio.error && <span className="text-amber-300">Portfolio API fallback: {portfolio.error}</span>}
            {site.error && <span className="text-amber-300">Site content API fallback: {site.error}</span>}
            {status && <span className="text-emerald-300">{status}</span>}
            {saveError && <span className="text-rose-300">{saveError}</span>}
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/45 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("career")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "career" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <BriefcaseBusiness size={16} />
              Career
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("blog")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "blog" ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <FileText size={16} />
              Blog
            </button>
          </div>
        </div>

        {activeTab === "career" ? <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Input
              aria-label="Search career sections"
              value={careerQuery}
              onChange={(event) => setCareerQuery(event.target.value)}
              placeholder="Search sections..."
              className="min-w-52 flex-1 border-white/10 bg-slate-950/60"
            />
            <span className="text-xs text-slate-400">{visibleSections.length} sections</span>
            <Button type="button" variant="outline" onClick={() => setExpandedSections(new Set(visibleSections.map((section) => section.draftKey)))}>Expand visible</Button>
            <Button type="button" variant="outline" onClick={() => setExpandedSections(new Set())}>Collapse all</Button>
          </div>
          {visibleSections.map((section) => (
            <section key={section.draftKey} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" aria-expanded={expandedSections.has(section.draftKey)} aria-controls={`career-section-${section.draftKey.replace(':', '-')}`} onClick={() => toggleSection(section.draftKey)} className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left">
                  <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                      {section.source}
                    </div>
                    {section.group ? (
                      <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                        {section.group}
                      </div>
                    ) : null}
                  </div>
                  <h2 className="font-['Space_Grotesk'] text-xl font-bold">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{section.description}</p>
                  </div>
                  <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${expandedSections.has(section.draftKey) ? "rotate-180" : ""}`} />
                </button>
                {expandedSections.has(section.draftKey) ? <button
                  type="button"
                  onClick={() => void handleSaveSection(section)}
                  disabled={savingKey !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={15} />
                  {savingKey === section.draftKey ? "Kaydediliyor..." : "Bu bolumu kaydet"}
                </button> : null}
              </div>

              {expandedSections.has(section.draftKey) ? <div id={`career-section-${section.draftKey.replace(':', '-')}`} className="mt-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={viewModes[section.draftKey] === "form" ? "default" : "outline"}
                  onClick={() =>
                    setViewModes((current) => ({
                      ...current,
                      [section.draftKey]: "form",
                    }))
                  }
                >
                  Form
                </Button>
                <Button
                  type="button"
                  variant={viewModes[section.draftKey] === "json" ? "default" : "outline"}
                  onClick={() =>
                    setViewModes((current) => ({
                      ...current,
                      [section.draftKey]: "json",
                    }))
                  }
                >
                  JSON
                </Button>
              </div>

              <SectionEditor
                draftKey={section.draftKey}
                draft={drafts[section.draftKey] ?? ""}
                mode={viewModes[section.draftKey] ?? "form"}
                onJsonChange={(value) =>
                  setDrafts((currentDrafts) => ({
                    ...currentDrafts,
                    [section.draftKey]: value,
                  }))
                }
                onValueChange={(value) => updateDraftValue(section.draftKey, value)}
              />
              </div> : null}
            </section>
          ))}
        </div> : <div className="mt-8"><BlogAdmin password={password} /></div>}
      </div>
    </div>
  );
}

function SectionEditor({
  draftKey,
  draft,
  mode,
  onJsonChange,
  onValueChange,
}: {
  draftKey: DraftKey;
  draft: string;
  mode: ViewMode;
  onJsonChange: (value: string) => void;
  onValueChange: (value: unknown) => void;
}) {
  let parsed: unknown;
  let parseError: string | null = null;

  try {
    parsed = JSON.parse(draft);
  } catch (error) {
    parseError = error instanceof Error ? error.message : "Invalid JSON";
  }

  if (mode === "json" || parseError) {
    return (
      <div className="space-y-3">
        {parseError ? <p className="text-sm text-rose-300">Form kapatildi: {parseError}</p> : null}
        <textarea
          value={draft}
          onChange={(event) => onJsonChange(event.target.value)}
          spellCheck={false}
          className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-100 outline-none transition focus:border-blue-400"
        />
      </div>
    );
  }

  if (draftKey === "site:careerTimeline" && Array.isArray(parsed)) {
    return <CareerTimelineEditor items={parsed as TimelineItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:aiProducts" && Array.isArray(parsed)) {
    return <AiProductsEditor items={parsed as AiProductItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:videoPortfolio" && Array.isArray(parsed)) {
    return <SimpleLinkListEditor titleLabel="Title" urlLabel="Video URL" items={parsed as LinkItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:caseStudies" && Array.isArray(parsed)) {
    return <CaseStudiesEditor items={parsed as CaseStudyItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:highlightMetrics" && Array.isArray(parsed)) {
    return <HighlightMetricsEditor items={parsed as MetricItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:toolClusters" && Array.isArray(parsed)) {
    return <ToolClustersEditor items={parsed as ToolClusterItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:speaking" && Array.isArray(parsed)) {
    return <SpeakingEditor items={parsed as SpeakingItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:certifications" && Array.isArray(parsed)) {
    return <CertificationsEditor items={parsed as CertificationItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:photoMoments" && Array.isArray(parsed)) {
    return <PhotoMomentsEditor items={parsed as PhotoMomentItem[]} onChange={onValueChange} />;
  }

  if (draftKey === "site:education" && Array.isArray(parsed)) {
    return <EducationEditor items={parsed as EducationItem[]} onChange={onValueChange} />;
  }

  return <ValueEditor label={draftKey} value={parsed} onChange={onValueChange} depth={0} />;
}

function ValueEditor({
  label,
  value,
  onChange,
  depth,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  depth: number;
}) {
  if (typeof value === "string") {
    const multiline = value.includes("\n") || value.length > 100;
    return (
      <FieldShell label={label}>
        {multiline ? (
          <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 bg-slate-950/70" />
        ) : (
          <Input value={value} onChange={(event) => onChange(event.target.value)} className="bg-slate-950/70" />
        )}
      </FieldShell>
    );
  }

  if (typeof value === "number") {
    return (
      <FieldShell label={label}>
        <Input
          type="number"
          value={String(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="bg-slate-950/70"
        />
      </FieldShell>
    );
  }

  if (typeof value === "boolean") {
    return (
      <FieldShell label={label}>
        <label className="inline-flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={value}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 rounded border border-white/20 bg-slate-950/70"
          />
          {value ? "True" : "False"}
        </label>
      </FieldShell>
    );
  }

  if (value === null) {
    return (
      <FieldShell label={label}>
        <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
          Null value
        </div>
      </FieldShell>
    );
  }

  if (Array.isArray(value)) {
    return (
      <FieldShell label={`${label} (${value.length})`}>
        <div className="space-y-3">
          {value.map((item, index) => (
            <div key={`${label}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Item {index + 1}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 size={14} />
                  Remove
                </Button>
              </div>
              <ValueEditor
                label={`${label}[${index}]`}
                value={item}
                depth={depth + 1}
                onChange={(nextItem) =>
                  onChange(value.map((currentItem, itemIndex) => (itemIndex === index ? nextItem : currentItem)))
                }
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => onChange([...value, createEmptyValue(value[0])])}>
            <Plus size={14} />
            Add item
          </Button>
        </div>
      </FieldShell>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);

  return (
    <FieldShell label={label}>
      <div className={`grid gap-4 ${depth === 0 ? "" : "rounded-2xl border border-white/8 bg-slate-950/30 p-4"}`}>
        {entries.map(([key, nestedValue]) => (
          <ValueEditor
            key={`${label}-${key}`}
            label={prettifyKey(key)}
            value={nestedValue}
            depth={depth + 1}
            onChange={(nextValue) =>
              onChange({
                ...(value as Record<string, unknown>),
                [key]: nextValue,
              })
            }
          />
        ))}
      </div>
    </FieldShell>
  );
}

function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{prettifyKey(label)}</div>
      {children}
    </div>
  );
}

function prettifyKey(value: string) {
  return value
    .replace(/^portfolio:|^site:/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ");
}

function createEmptyValue(example: unknown): unknown {
  if (typeof example === "string") return "";
  if (typeof example === "number") return 0;
  if (typeof example === "boolean") return false;
  if (Array.isArray(example)) return [];
  if (example && typeof example === "object") {
    return Object.fromEntries(
      Object.entries(example as Record<string, unknown>).map(([key, value]) => [key, createEmptyValue(value)]),
    );
  }
  return "";
}

type TimelineItem = {
  year: string;
  company: string;
  brand: string;
  role: string;
  location: string;
  logo?: string;
  focus: string;
  meta: string[];
  bullets: string[];
};

type AiProductItem = {
  title: string;
  category: string;
  image?: string;
  video?: string;
  url?: string;
  summary: string;
  outcome: string;
  tags: string[];
  confidential?: boolean;
};

type LinkItem = {
  title: string;
  url: string;
};

type CaseStudyItem = {
  brand: string;
  result: string;
  url: string;
};

type MetricItem = {
  value: string;
  label: string;
};

type ToolClusterItem = {
  title: string;
  tools: string[];
};

type SpeakingItem = {
  title: string;
  org: string;
  detail: string;
  logo?: string;
  url: string;
};

type CertificationItem = {
  title: string;
  issuer: string;
  date: string;
  image?: string;
};

type PhotoMomentItem = {
  title: string;
  image?: string;
};

type EducationItem = {
  degree: string;
  school: string;
  period: string;
  location: string;
  logo?: string;
};

function CareerTimelineEditor({
  items,
  onChange,
}: {
  items: TimelineItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell
      addLabel="Yeni deneyim ekle"
      onAdd={() =>
        onChange([
          ...items,
          {
            year: "",
            company: "",
            brand: "",
            role: "",
            location: "",
            logo: "",
            focus: "",
            meta: [""],
            bullets: [""],
          },
        ])
      }
    >
      {items.map((item, index) => (
        <CardEditor
          key={`${item.company}-${index}`}
          title={item.role || `Experience ${index + 1}`}
          subtitle={`${item.company || "Company"} | ${item.year || "Year"}`}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Year" value={item.year} onChange={(value) => onChange(updateItem(items, index, { year: value }))} />
            <LabeledInput label="Role" value={item.role} onChange={(value) => onChange(updateItem(items, index, { role: value }))} />
            <LabeledInput label="Company" value={item.company} onChange={(value) => onChange(updateItem(items, index, { company: value }))} />
            <LabeledInput label="Brand" value={item.brand} onChange={(value) => onChange(updateItem(items, index, { brand: value }))} />
            <LabeledInput label="Location" value={item.location} onChange={(value) => onChange(updateItem(items, index, { location: value }))} />
            <LabeledInput label="Logo path" value={item.logo ?? ""} onChange={(value) => onChange(updateItem(items, index, { logo: value }))} />
          </div>
          <LabeledTextarea label="Focus" value={item.focus} onChange={(value) => onChange(updateItem(items, index, { focus: value }))} />
          <StringArrayEditor
            label="Meta chips"
            items={item.meta}
            onChange={(value) => onChange(updateItem(items, index, { meta: value }))}
          />
          <StringArrayEditor
            label="Detail bullets"
            items={item.bullets}
            onChange={(value) => onChange(updateItem(items, index, { bullets: value }))}
          />
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function AiProductsEditor({
  items,
  onChange,
}: {
  items: AiProductItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell
      addLabel="Yeni urun ekle"
      onAdd={() =>
        onChange([
          ...items,
          {
            title: "",
            category: "",
            image: "",
            video: "",
            url: "",
            summary: "",
            outcome: "",
            tags: [""],
            confidential: false,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <CardEditor
          key={`${item.title}-${index}`}
          title={item.title || `Product ${index + 1}`}
          subtitle={item.category || "Category"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Title" value={item.title} onChange={(value) => onChange(updateItem(items, index, { title: value }))} />
            <LabeledInput label="Category" value={item.category} onChange={(value) => onChange(updateItem(items, index, { category: value }))} />
            <LabeledInput label="Image path" value={item.image ?? ""} onChange={(value) => onChange(updateItem(items, index, { image: value }))} />
            <LabeledInput label="Video path / URL" value={item.video ?? ""} onChange={(value) => onChange(updateItem(items, index, { video: value }))} />
            <LabeledInput label="Live URL" value={item.url ?? ""} onChange={(value) => onChange(updateItem(items, index, { url: value }))} />
            <FieldShell label="Confidential">
              <label className="inline-flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={!!item.confidential}
                  onChange={(event) => onChange(updateItem(items, index, { confidential: event.target.checked }))}
                  className="h-4 w-4 rounded border border-white/20 bg-slate-950/70"
                />
                {item.confidential ? "Private" : "Public"}
              </label>
            </FieldShell>
          </div>
          <LabeledTextarea label="Summary" value={item.summary} onChange={(value) => onChange(updateItem(items, index, { summary: value }))} />
          <LabeledTextarea label="Outcome" value={item.outcome} onChange={(value) => onChange(updateItem(items, index, { outcome: value }))} />
          <StringArrayEditor
            label="Tags"
            items={item.tags}
            onChange={(value) => onChange(updateItem(items, index, { tags: value }))}
          />
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function SimpleLinkListEditor({
  items,
  onChange,
  titleLabel,
  urlLabel,
}: {
  items: LinkItem[];
  onChange: (value: unknown) => void;
  titleLabel: string;
  urlLabel: string;
}) {
  return (
    <CardListShell
      addLabel="Yeni video ekle"
      onAdd={() => onChange([...items, { title: "", url: "" }])}
    >
      {items.map((item, index) => (
        <CardEditor
          key={`${item.title}-${index}`}
          title={item.title || `Item ${index + 1}`}
          subtitle={item.url || "URL"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label={titleLabel} value={item.title} onChange={(value) => onChange(updateItem(items, index, { title: value }))} />
            <LabeledInput label={urlLabel} value={item.url} onChange={(value) => onChange(updateItem(items, index, { url: value }))} />
          </div>
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function CaseStudiesEditor({
  items,
  onChange,
}: {
  items: CaseStudyItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell
      addLabel="Yeni case study ekle"
      onAdd={() => onChange([...items, { brand: "", result: "", url: "" }])}
    >
      {items.map((item, index) => (
        <CardEditor
          key={`${item.brand}-${index}`}
          title={item.brand || `Case Study ${index + 1}`}
          subtitle={item.url || "Link"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <LabeledInput label="Brand" value={item.brand} onChange={(value) => onChange(updateItem(items, index, { brand: value }))} />
          <LabeledTextarea label="Result" value={item.result} onChange={(value) => onChange(updateItem(items, index, { result: value }))} />
          <LabeledInput label="URL" value={item.url} onChange={(value) => onChange(updateItem(items, index, { url: value }))} />
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function HighlightMetricsEditor({
  items,
  onChange,
}: {
  items: MetricItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell addLabel="Yeni metric ekle" onAdd={() => onChange([...items, { value: "", label: "" }])}>
      {items.map((item, index) => (
        <CardEditor
          key={`${item.value}-${index}`}
          title={item.value || `Metric ${index + 1}`}
          subtitle={item.label || "Label"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Value" value={item.value} onChange={(value) => onChange(updateItem(items, index, { value }))} />
            <LabeledInput label="Label" value={item.label} onChange={(value) => onChange(updateItem(items, index, { label: value }))} />
          </div>
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function ToolClustersEditor({
  items,
  onChange,
}: {
  items: ToolClusterItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell addLabel="Yeni tool cluster ekle" onAdd={() => onChange([...items, { title: "", tools: [""] }])}>
      {items.map((item, index) => (
        <CardEditor
          key={`${item.title}-${index}`}
          title={item.title || `Cluster ${index + 1}`}
          subtitle={`${item.tools.length} tools`}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <LabeledInput label="Title" value={item.title} onChange={(value) => onChange(updateItem(items, index, { title: value }))} />
          <StringArrayEditor label="Tools" items={item.tools} onChange={(value) => onChange(updateItem(items, index, { tools: value }))} />
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function SpeakingEditor({
  items,
  onChange,
}: {
  items: SpeakingItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell addLabel="Yeni speaking item ekle" onAdd={() => onChange([...items, { title: "", org: "", detail: "", logo: "", url: "" }])}>
      {items.map((item, index) => (
        <CardEditor
          key={`${item.org}-${index}`}
          title={item.org || `Speaking ${index + 1}`}
          subtitle={item.title || "Role"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Title" value={item.title} onChange={(value) => onChange(updateItem(items, index, { title: value }))} />
            <LabeledInput label="Organization" value={item.org} onChange={(value) => onChange(updateItem(items, index, { org: value }))} />
            <LabeledInput label="Logo path" value={item.logo ?? ""} onChange={(value) => onChange(updateItem(items, index, { logo: value }))} />
            <LabeledInput label="URL" value={item.url} onChange={(value) => onChange(updateItem(items, index, { url: value }))} />
          </div>
          <LabeledTextarea label="Detail" value={item.detail} onChange={(value) => onChange(updateItem(items, index, { detail: value }))} />
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function CertificationsEditor({
  items,
  onChange,
}: {
  items: CertificationItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell
      addLabel="Yeni sertifika ekle"
      onAdd={() => onChange([...items, { title: "", issuer: "", date: "", image: "" }])}
    >
      {items.map((item, index) => (
        <CardEditor
          key={`${item.title}-${index}`}
          title={item.title || `Certification ${index + 1}`}
          subtitle={item.issuer || "Issuer"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Title" value={item.title} onChange={(value) => onChange(updateItem(items, index, { title: value }))} />
            <LabeledInput label="Issuer" value={item.issuer} onChange={(value) => onChange(updateItem(items, index, { issuer: value }))} />
            <LabeledInput label="Date" value={item.date} onChange={(value) => onChange(updateItem(items, index, { date: value }))} />
            <LabeledInput label="Image path" value={item.image ?? ""} onChange={(value) => onChange(updateItem(items, index, { image: value }))} />
          </div>
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function PhotoMomentsEditor({
  items,
  onChange,
}: {
  items: PhotoMomentItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell addLabel="Yeni fotograf ekle" onAdd={() => onChange([...items, { title: "", image: "" }])}>
      {items.map((item, index) => (
        <CardEditor
          key={`${item.title}-${index}`}
          title={item.title || `Photo ${index + 1}`}
          subtitle={item.image || "Image path"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Title" value={item.title} onChange={(value) => onChange(updateItem(items, index, { title: value }))} />
            <LabeledInput label="Image path" value={item.image ?? ""} onChange={(value) => onChange(updateItem(items, index, { image: value }))} />
          </div>
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function EducationEditor({
  items,
  onChange,
}: {
  items: EducationItem[];
  onChange: (value: unknown) => void;
}) {
  return (
    <CardListShell
      addLabel="Yeni egitim ekle"
      onAdd={() => onChange([...items, { degree: "", school: "", period: "", location: "", logo: "" }])}
    >
      {items.map((item, index) => (
        <CardEditor
          key={`${item.degree}-${index}`}
          title={item.degree || `Education ${index + 1}`}
          subtitle={item.school || "School"}
          onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Degree" value={item.degree} onChange={(value) => onChange(updateItem(items, index, { degree: value }))} />
            <LabeledInput label="School" value={item.school} onChange={(value) => onChange(updateItem(items, index, { school: value }))} />
            <LabeledInput label="Period" value={item.period} onChange={(value) => onChange(updateItem(items, index, { period: value }))} />
            <LabeledInput label="Location" value={item.location} onChange={(value) => onChange(updateItem(items, index, { location: value }))} />
            <LabeledInput label="Logo path" value={item.logo ?? ""} onChange={(value) => onChange(updateItem(items, index, { logo: value }))} />
          </div>
        </CardEditor>
      ))}
    </CardListShell>
  );
}

function CardListShell({
  children,
  addLabel,
  onAdd,
}: {
  children: ReactNode;
  addLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      {children}
      <Button type="button" variant="outline" onClick={onAdd}>
        <Plus size={14} />
        {addLabel}
      </Button>
    </div>
  );
}

function CardEditor({
  title,
  subtitle,
  children,
  onRemove,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRemove}>
          <Trash2 size={14} />
          Remove
        </Button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldShell label={label}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="bg-slate-950/70" />
    </FieldShell>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldShell label={label}>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 bg-slate-950/70" />
    </FieldShell>
  );
}

function StringArrayEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <FieldShell label={label}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <Input
              value={item}
              onChange={(event) => onChange(items.map((current, itemIndex) => (itemIndex === index ? event.target.value : current)))}
              className="bg-slate-950/70"
            />
            <Button type="button" variant="outline" size="icon-sm" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => onChange([...items, ""])}>
          <Plus size={14} />
          Add line
        </Button>
      </div>
    </FieldShell>
  );
}

function updateItem<T>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
}

