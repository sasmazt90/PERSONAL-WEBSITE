import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import type { BlogLanguage, BlogPost } from "@shared/blog";
import { blogLanguages } from "@shared/blog";
import { trackEvent } from "@/lib/analytics";
import { fetchPublicBlogPosts } from "@/lib/blogApi";

const languageLabels: Record<BlogLanguage, string> = { en: "EN", de: "DE", tr: "TR" };
const adsenseClient = "ca-pub-4185131193797685";
const adsenseBlogSlot = import.meta.env.VITE_ADSENSE_BLOG_SLOT || "";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function getBlogThumbnail(post: BlogPost) {
  return post.visuals.find((visual) => visual.visualType === "thumbnail") || post.visuals.find((visual) => visual.visualType === "hero") || post.visuals[0];
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [language, setLanguage] = useState<BlogLanguage>("en");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicBlogPosts()
      .then((collection) => setPosts(collection.posts))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Failed to load blog."));
  }, []);

  const filteredPosts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return posts;
    return posts.filter((post) =>
      [post.topic, post.slug.canonical, post.seo[language].title, post.seo[language].metaDescription, ...(post.categories || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [posts, query, language]);

  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#0f172a]">
      <section className="border-b border-[#dce7f9] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold text-[#2563eb]">SASMAZ Digital</Link>
          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-['Space_Grotesk'] text-5xl font-bold tracking-tight sm:text-6xl">Blog</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5b667b]">
                Operator-level notes on AI marketing, digital growth systems, performance marketing, e-commerce optimization, and real execution logic.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 rounded-2xl border border-[#dce7f9] bg-[#f8fbff] px-4 py-3">
                <Search size={17} className="text-[#7a8699]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" className="w-64 bg-transparent text-sm outline-none" />
              </label>
              <div className="flex rounded-2xl border border-[#dce7f9] bg-[#f8fbff] p-1">
                {blogLanguages.map((item) => (
                  <button key={item} type="button" onClick={() => setLanguage(item)} className={`rounded-xl px-3 py-2 text-sm font-bold ${language === item ? "bg-[#2563eb] text-white" : "text-[#5b667b]"}`}>
                    {languageLabels[item]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post, index) => {
            const thumbnail = getBlogThumbnail(post);
            return (
              <Fragment key={post.id}>
                <article className="overflow-hidden rounded-[1.25rem] border border-[#dce7f9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#cadcf6] hover:shadow-[0_22px_46px_rgba(15,23,42,0.09)]">
                  {thumbnail?.url ? (
                    <img src={thumbnail.url} alt={thumbnail.alt[language]} loading="lazy" decoding="async" className="aspect-video w-full bg-white object-cover" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-[#eef4ff] px-6 text-center text-sm text-[#5b667b]">{thumbnail?.prompt || "Blog visual"}</div>
                  )}
                  <div className="p-6 pt-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {(post.categories || []).slice(0, 2).map((category) => (
                        <span key={category} className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2563eb]">{category}</span>
                      ))}
                    </div>
                    <h2 className="font-['Space_Grotesk'] text-2xl font-bold leading-tight">{post.seo[language].title || post.topic}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5b667b]">{post.seo[language].metaDescription}</p>
                    <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#7a8699]">{post.publishedAt ? new Intl.DateTimeFormat(language).format(new Date(post.publishedAt)) : ""}</span>
                      <Link
                        href={`/blog/${post.slug.canonical}/${language}`}
                        onClick={() =>
                          trackEvent("blog_click", {
                            blog_title: post.seo[language].title || post.topic,
                            blog_slug: post.slug.canonical,
                            blog_url: `/blog/${post.slug.canonical}/${language}`,
                            section_name: "blog_listing",
                          })
                        }
                        className="font-bold text-[#2563eb]"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </article>
                {(index + 1) % 6 === 0 && index + 1 < filteredPosts.length ? <BlogListAd /> : null}
              </Fragment>
            );
          })}
        </div>
        {!filteredPosts.length ? <div className="rounded-3xl border border-dashed border-[#dce7f9] bg-white p-10 text-center text-[#5b667b]">No published articles yet.</div> : null}
      </section>
    </main>
  );
}

function BlogListAd() {
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
      // AdSense can be blocked by local browser settings or extensions.
    }
  }, []);

  if (!adsenseBlogSlot) return null;

  return (
    <aside className="md:col-span-2 xl:col-span-3">
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
