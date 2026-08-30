import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react";
import { sanitizeHtml, type BlogLanguage, type BlogPost } from "@shared/blog";
import { blogLanguages } from "@shared/blog";
import {
  getFileNameFromUrl,
  getFileTypeFromUrl,
  getLinkDomain,
  isDownloadUrl,
  isExternalUrl,
  trackEvent,
} from "@/lib/analytics";
import { fetchPublicBlogPost, fetchPublicBlogPosts } from "@/lib/blogApi";
import { BlogContentSurface } from "@/components/blog/BlogContentSurface";

const languageLabels: Record<BlogLanguage, string> = { en: "EN", de: "DE", tr: "TR" };
const adsenseClient = "ca-pub-4185131193797685";
const adsenseBlogSlot = import.meta.env.VITE_ADSENSE_BLOG_SLOT || "";
const siteUrl = "https://www.sasmaz.digital";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function getHeroVisual(post: BlogPost) {
  return post.visuals.find((visual) => visual.visualType === "hero") || post.visuals[0];
}

function getThumbnailVisual(post: BlogPost) {
  return post.visuals.find((visual) => visual.visualType === "thumbnail") || post.visuals.find((visual) => visual.visualType === "hero") || post.visuals[0];
}

function upsertHeadLink(id: string, attrs: Record<string, string>) {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[data-blog-head="${id}"]`);
  const link = existing || document.createElement("link");
  link.dataset.blogHead = id;
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  if (!existing) document.head.appendChild(link);
}

function trackBlogLinkClick(
  linkText: string,
  destinationUrl: string,
  sectionName: string
) {
  if (isExternalUrl(destinationUrl)) {
    trackEvent("external_link_click", {
      link_text: linkText,
      destination_url: destinationUrl,
      link_domain: getLinkDomain(destinationUrl),
      section_name: sectionName,
    });
  }

  if (isDownloadUrl(destinationUrl)) {
    trackEvent("file_download_click", {
      file_name: getFileNameFromUrl(destinationUrl),
      file_url: destinationUrl,
      file_type: getFileTypeFromUrl(destinationUrl),
      section_name: sectionName,
    });
  }
}

export default function BlogArticle() {
  const [, paramsWithLanguage] = useRoute("/blog/:slug/:lang");
  const [, paramsWithoutLanguage] = useRoute("/blog/:slug");
  const params = paramsWithLanguage || paramsWithoutLanguage;
  const slug = params?.slug || "";
  const routeLanguage = blogLanguages.includes((params as { lang?: string } | null)?.lang as BlogLanguage) ? ((params as { lang?: string }).lang as BlogLanguage) : "en";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [language, setLanguage] = useState<BlogLanguage>(routeLanguage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchPublicBlogPost(slug)
      .then((nextPost) => setPost(nextPost))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Blog article not found."));
  }, [slug]);

  useEffect(() => {
    fetchPublicBlogPosts()
      .then((collection) => setRelatedPosts(collection.posts))
      .catch(() => setRelatedPosts([]));
  }, []);

  useEffect(() => {
    if (!post) return;
    document.title = post.seo[language].title || post.topic;
    const description = document.querySelector('meta[name="description"]') || document.createElement("meta");
    description.setAttribute("name", "description");
    description.setAttribute("content", post.seo[language].metaDescription || "");
    document.head.appendChild(description);
    upsertHeadLink("canonical", { rel: "canonical", href: `${siteUrl}/blog/${post.slug.canonical}/${language}` });
    blogLanguages.forEach((item) => {
      upsertHeadLink(`alternate-${item}`, { rel: "alternate", hreflang: item, href: `${siteUrl}/blog/${post.slug.canonical}/${item}` });
    });
    upsertHeadLink("alternate-x-default", { rel: "alternate", hreflang: "x-default", href: `${siteUrl}/blog/${post.slug.canonical}/en` });
  }, [post, language]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const videoNode = target?.closest<HTMLElement>("[data-video-url]");
      const videoUrl = videoNode?.dataset.videoUrl;
      if (videoUrl) {
        event.preventDefault();
        setActiveVideo(videoUrl);
        trackEvent("cta_click", {
          cta_text: "Play video",
          cta_type: "video",
          destination_url: videoUrl,
          section_name: "blog_article_body",
        });
        return;
      }
      const linkNode = target?.closest<HTMLAnchorElement>(".blog-article-body a");
      const destinationUrl = linkNode?.href;
      if (!destinationUrl) return;
      trackBlogLinkClick(
        linkNode.textContent?.trim() || destinationUrl,
        destinationUrl,
        "blog_article_body"
      );
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const hero = post ? getHeroVisual(post) : undefined;
  const inlineVisualIds = useMemo(() => {
    if (!post) return new Set<string>();
    const ids = new Set<string>();
    const content = post.content[language] || "";
    const visualIdPattern = /data-visual-id=["']([^"']+)["']/g;
    let match = visualIdPattern.exec(content);
    while (match) {
      ids.add(match[1]);
      match = visualIdPattern.exec(content);
    }
    return ids;
  }, [post, language]);
  const bodyVisuals = useMemo(
    () => post?.visuals.filter((visual) => visual.visualType !== "hero" && visual.visualType !== "thumbnail" && !inlineVisualIds.has(visual.id)) || [],
    [post, inlineVisualIds],
  );
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8fbff] px-4 py-16 text-[#0f172a]">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#dce7f9] bg-white p-8 text-center">
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold">Article unavailable</h1>
          <p className="mt-3 text-[#5b667b]">{error}</p>
          <Link href="/blog" className="mt-6 inline-flex rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white">Back to Blog</Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return <main className="min-h-screen bg-[#f8fbff] px-4 py-16 text-center text-[#5b667b]">Loading article...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#0f172a]">
      <article>
        <header className="border-b border-[#dce7f9] bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/blog" className="font-bold text-[#2563eb]">Back to Blog</Link>
              <div className="flex rounded-2xl border border-[#dce7f9] bg-[#f8fbff] p-1">
                {blogLanguages.map((item) => (
                  <Link key={item} href={`/blog/${post.slug.canonical}/${item}`} onClick={() => setLanguage(item)} className={`rounded-xl px-3 py-2 text-sm font-bold ${language === item ? "bg-[#2563eb] text-white" : "text-[#5b667b]"}`}>
                    {languageLabels[item]}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {(post.categories || []).map((category) => (
                  <span key={category} className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2563eb]">{category}</span>
                ))}
              </div>
              <h1 className="font-['Space_Grotesk'] text-4xl font-bold leading-tight sm:text-6xl">{post.seo[language].title || post.topic}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5b667b]">{post.seo[language].metaDescription}</p>
              {post.publishedAt ? <p className="mt-4 text-sm font-semibold text-[#7a8699]">{new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(new Date(post.publishedAt))}</p> : null}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <BlogAd placement="after-article-header" />

          <BlogContentSurface
            post={post}
            language={language}
            onVideo={(videoUrl, visual) => {
              trackEvent("cta_click", {
                cta_text: visual.caption[language] || "Play video",
                cta_type: "video",
                destination_url: videoUrl,
                section_name: "blog_visuals",
              });
              setActiveVideo(videoUrl);
            }}
          />

          <BlogAd placement="before-read-more" />
          <ReadMoreSection post={post} posts={relatedPosts} language={language} />

          {(Array.isArray(post.relatedSystems) ? post.relatedSystems : post.internalLinks).length ? (
            <section className="mt-10 rounded-[1.75rem] border border-[#dce7f9] bg-white p-6">
              <h2 className="font-['Space_Grotesk'] text-2xl font-bold">Related Systems</h2>
              <div className="mt-4 grid gap-3">
                {(Array.isArray(post.relatedSystems) ? post.relatedSystems : post.internalLinks).filter((link) => !link.language || link.language === "all" || link.language === language).map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    onClick={() =>
                      trackBlogLinkClick(
                        link.label,
                        link.url,
                        "related_systems"
                      )
                    }
                    className="rounded-2xl border border-[#dce7f9] px-4 py-3 font-bold text-[#2563eb] hover:bg-[#f8fbff]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
      {activeVideo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-black shadow-2xl">
            <div className="flex justify-end bg-slate-950 p-3">
              <button type="button" onClick={() => setActiveVideo(null)} aria-label="Close video" className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                <X size={18} />
              </button>
            </div>
            <iframe
              src={toVideoEmbed(activeVideo)}
              title="Blog video"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.seo[language].title || post.topic,
        description: post.seo[language].metaDescription,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: `${siteUrl}/blog/${post.slug.canonical}/${language}`,
        author: { "@type": "Person", name: "Ibrahim Tolgar Sasmaz" },
      }) }} />
      {post.faq[language]?.length ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq[language].map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }) }} />
      ) : null}
    </main>
  );
}

function ReadMoreSection({ post, posts, language }: { post: BlogPost; posts: BlogPost[]; language: BlogLanguage }) {
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const hasManualArticleSelection = Array.isArray(post.relatedArticleIds);
  const candidates = hasManualArticleSelection
    ? (post.relatedArticleIds || []).map((id) => posts.find((item) => item.id === id)).filter((item): item is BlogPost => Boolean(item))
    : posts.filter((item) => item.id !== post.id).slice(0, 9);
  const fallbackLinks = hasManualArticleSelection ? [] : post.internalLinks.filter((link) => !link.language || link.language === "all" || link.language === language).slice(0, 6);
  const maxIndex = Math.max(0, candidates.length - visibleCards);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setVisibleCards(3);
      else if (window.innerWidth >= 640) setVisibleCards(2);
      else setVisibleCards(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  if (!candidates.length && !fallbackLinks.length) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563eb]">Read More</p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a]">Related articles</h2>
        </div>
        {candidates.length > visibleCards ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white disabled:opacity-35" aria-label="Previous articles">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => setIndex((current) => Math.min(maxIndex, current + 1))} disabled={index >= maxIndex} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white disabled:opacity-35" aria-label="Next articles">
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
      {candidates.length ? (
        <div className="overflow-hidden">
          <div className="flex gap-4 transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * (100 / visibleCards)}%)` }}>
            {candidates.map((item) => {
              const thumbnail = getThumbnailVisual(item);
              return (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug.canonical}/${language}`}
                  onClick={() =>
                    trackEvent("blog_click", {
                      blog_title: item.seo[language]?.title || item.topic,
                      blog_slug: item.slug.canonical,
                      blog_url: `/blog/${item.slug.canonical}/${language}`,
                      section_name: "related_articles",
                    })
                  }
                  className="shrink-0 overflow-hidden rounded-[1.25rem] border border-[#dce7f9] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#cadcf6]"
                  style={{ flexBasis: `calc(${100 / visibleCards}% - ${(16 * (visibleCards - 1)) / visibleCards}px)` }}
                >
                  {thumbnail?.url ? <img src={thumbnail.url} alt={thumbnail.alt[language] || item.topic} loading="lazy" decoding="async" className="aspect-video w-full bg-white object-cover" /> : null}
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {(item.categories || []).slice(0, 2).map((category) => (
                        <span key={category} className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#2563eb]">{category}</span>
                      ))}
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-lg font-bold leading-tight text-[#0f172a]">{item.seo[language]?.title || item.topic}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {fallbackLinks.map((link) => (
            <a
              key={`${link.label}-${link.url}-read-more`}
              href={link.url}
              onClick={() =>
                trackBlogLinkClick(link.label, link.url, "read_more")
              }
              className="rounded-2xl border border-[#dce7f9] bg-white px-4 py-3 font-bold text-[#2563eb] hover:bg-[#f8fbff]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function BlogAd({ placement }: { placement: "after-article-header" | "before-read-more" }) {
  useEffect(() => {
    if (!adsenseBlogSlot) return;
    try {
      if (!document.querySelector(`script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`)) {
        const script = document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
        document.head.appendChild(script);
      }
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense may be blocked by browser extensions or unavailable in local dev.
    }
  }, []);

  if (!adsenseBlogSlot) return null;

  return (
    <aside className={placement === "after-article-header" ? "mb-10" : "mt-12"}>
      <ins
        className="adsbygoogle block min-h-[120px] overflow-hidden rounded-[1.25rem] border border-[#dce7f9] bg-white"
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={adsenseBlogSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

function VisualMedia({
  visual,
  language,
  onVideo,
}: {
  visual: BlogPost["visuals"][number];
  language: BlogLanguage;
  onVideo: (url: string) => void;
}) {
  const image = visual.url ? (
    <img src={visual.url} alt={visual.alt[language]} loading="lazy" decoding="async" className="max-h-[34rem] w-full bg-white object-contain" />
  ) : (
    <div className="flex min-h-56 items-center justify-center bg-[#eef4ff] px-8 text-center text-sm text-[#5b667b]">{visual.prompt}</div>
  );
  if (!visual.videoUrl) return image;
  return (
    <button
      type="button"
      onClick={() => {
        const videoUrl = visual.videoUrl || "";
        trackEvent("cta_click", {
          cta_text: visual.caption[language] || "Play video",
          cta_type: "video",
          destination_url: videoUrl,
          section_name: "blog_visuals",
        });
        onVideo(videoUrl);
      }}
      className="group relative block w-full text-left"
      aria-label={`Play video: ${visual.caption[language]}`}
    >
      {image}
      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition group-hover:bg-slate-950/34">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/92 text-[#2563eb] shadow-[0_18px_48px_rgba(15,23,42,0.22)]">
          <PlayCircle size={42} />
        </span>
      </span>
    </button>
  );
}

function toVideoEmbed(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  return url;
}
