import { PlayCircle } from "lucide-react";
import { sanitizeHtml, type BlogLanguage, type BlogPost, type BlogVisual } from "@shared/blog";

export function getInlineVisualIds(content: string) {
  const ids = new Set<string>();
  const pattern = /data-visual-id=["']([^"']+)["']/g;
  let match = pattern.exec(content || "");
  while (match) {
    ids.add(match[1]);
    match = pattern.exec(content || "");
  }
  return ids;
}

export function getHeroVisual(post: BlogPost) {
  return post.visuals.find((visual) => visual.visualType === "hero") || post.visuals[0];
}

export function getBodyVisuals(post: BlogPost, language: BlogLanguage) {
  const inlineVisualIds = getInlineVisualIds(post.content[language] || "");
  return post.visuals.filter(
    (visual) => visual.visualType !== "hero" && visual.visualType !== "thumbnail" && !inlineVisualIds.has(visual.id),
  );
}

export function BlogContentSurface({
  post,
  language,
  onVideo,
}: {
  post: BlogPost;
  language: BlogLanguage;
  onVideo?: (url: string, visual: BlogVisual) => void;
}) {
  const hero = getHeroVisual(post);
  const bodyVisuals = getBodyVisuals(post, language);

  return (
    <>
      {hero ? (
        <figure className="mb-10 overflow-hidden rounded-[1.75rem] border border-[#dce7f9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          {hero.url ? (
            <img src={hero.url} alt={hero.alt[language]} decoding="async" className="max-h-[34rem] w-full bg-white object-contain" />
          ) : (
            <div className="flex min-h-72 items-center justify-center bg-[#eef4ff] px-8 text-center text-[#5b667b]">{hero.prompt}</div>
          )}
          {hero.caption[language] ? <figcaption className="px-5 py-4 text-sm text-[#5b667b]">{hero.caption[language]}</figcaption> : null}
        </figure>
      ) : null}

      <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content[language]) }} />

      {bodyVisuals.length ? (
        <section className="mt-10 grid gap-6">
          {bodyVisuals.map((visual) => (
            <figure key={visual.id} className="overflow-hidden rounded-[1.5rem] border border-[#dce7f9] bg-white">
              <BlogVisualMedia visual={visual} language={language} onVideo={onVideo} />
              {visual.caption[language] ? <figcaption className="px-5 py-4 text-sm text-[#5b667b]">{visual.caption[language]}</figcaption> : null}
            </figure>
          ))}
        </section>
      ) : null}

      {post.faq[language]?.length ? (
        <section className="mt-12 rounded-[1.75rem] border border-[#dce7f9] bg-white p-6">
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold">FAQ</h2>
          <div className="mt-5 grid gap-5">
            {post.faq[language].map((item) => (
              <div key={item.question}>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold">{item.question}</h3>
                <p className="mt-2 leading-7 text-[#5b667b]">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function BlogVisualMedia({
  visual,
  language,
  onVideo,
}: {
  visual: BlogVisual;
  language: BlogLanguage;
  onVideo?: (url: string, visual: BlogVisual) => void;
}) {
  const image = visual.url ? (
    <img src={visual.url} alt={visual.alt[language]} loading="lazy" decoding="async" className="max-h-[34rem] w-full bg-white object-contain" />
  ) : (
    <div className="flex min-h-56 items-center justify-center bg-[#eef4ff] px-8 text-center text-sm text-[#5b667b]">{visual.prompt}</div>
  );

  if (!visual.videoUrl) return image;

  const overlay = (
    <>
      {image}
      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition group-hover:bg-slate-950/35">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-[#2563eb] shadow-[0_18px_48px_rgba(15,23,42,0.22)]">
          <PlayCircle size={42} />
        </span>
      </span>
    </>
  );

  // Admin preview intentionally renders the same visual surface without a dead control
  // when no video handler is supplied. Published pages can pass onVideo to make it interactive.
  if (!onVideo) {
    return (
      <div className="group relative block w-full text-left" aria-label={`Video preview: ${visual.caption[language] || visual.fileName}`}>
        {overlay}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onVideo(visual.videoUrl || "", visual)}
      className="group relative block w-full text-left"
      aria-label={`Play video: ${visual.caption[language] || visual.fileName}`}
    >
      {overlay}
    </button>
  );
}
