import fs from 'node:fs';

function replaceOrFail(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label} anchor not found`);
  return source.replace(before, after);
}

{
  const path = 'client/src/components/admin/RichTextEditor.tsx';
  let source = fs.readFileSync(path, 'utf8');
  source = replaceOrFail(
    source,
    `        class: "blog-article-body max-w-none min-h-[68vh] px-7 py-8 outline-none",`,
    `        class: "blog-article-body min-h-[68vh] outline-none",`,
    'Editor article class',
  );
  source = replaceOrFail(
    source,
    `      <div className="overflow-hidden bg-white">\n        <EditorContent editor={editor} />\n      </div>`,
    `      <div className="overflow-hidden bg-[#f8fbff] px-4 py-8 sm:px-6 lg:px-8">\n        <div className="mx-auto max-w-4xl bg-white">\n          <EditorContent editor={editor} />\n        </div>\n      </div>`,
    'Editor rendering frame',
  );
  fs.writeFileSync(path, source);
}

{
  const path = 'client/src/components/admin/BlogAdmin.tsx';
  let source = fs.readFileSync(path, 'utf8');
  source = replaceOrFail(
    source,
    `import { RichTextEditor } from "@/components/admin/RichTextEditor";`,
    `import { RichTextEditor } from "@/components/admin/RichTextEditor";\nimport { BlogContentSurface } from "@/components/blog/BlogContentSurface";`,
    'BlogAdmin shared renderer import',
  );

  const previewStart = `          <div className="px-6 py-8 sm:px-10">`;
  const previewEnd = `          </div>\n        </article>`;
  const startIndex = source.indexOf(previewStart, source.indexOf('function BlogPreview'));
  if (startIndex < 0) throw new Error('BlogPreview content start not found');
  const endIndex = source.indexOf(previewEnd, startIndex);
  if (endIndex < 0) throw new Error('BlogPreview content end not found');
  const sharedPreview = `          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">\n            <BlogContentSurface post={post} language={language} />\n          </div>\n        </article>`;
  source = source.slice(0, startIndex) + sharedPreview + source.slice(endIndex + previewEnd.length);
  fs.writeFileSync(path, source);
}

{
  const path = 'client/src/pages/BlogArticle.tsx';
  let source = fs.readFileSync(path, 'utf8');
  source = replaceOrFail(
    source,
    `import { fetchPublicBlogPost, fetchPublicBlogPosts } from "@/lib/blogApi";`,
    `import { fetchPublicBlogPost, fetchPublicBlogPosts } from "@/lib/blogApi";\nimport { BlogContentSurface } from "@/components/blog/BlogContentSurface";`,
    'BlogArticle shared renderer import',
  );

  const contentStart = `          {hero ? (`;
  const contentEnd = `          <BlogAd placement="before-read-more" />`;
  const startIndex = source.indexOf(contentStart);
  if (startIndex < 0) throw new Error('Published content start not found');
  const endIndex = source.indexOf(contentEnd, startIndex);
  if (endIndex < 0) throw new Error('Published content end not found');
  const sharedContent = `          <BlogContentSurface\n            post={post}\n            language={language}\n            onVideo={(videoUrl, visual) => {\n              trackEvent("cta_click", {\n                cta_text: visual.caption[language] || "Play video",\n                cta_type: "video",\n                destination_url: videoUrl,\n                section_name: "blog_visuals",\n              });\n              setActiveVideo(videoUrl);\n            }}\n          />\n\n`;
  source = source.slice(0, startIndex) + sharedContent + source.slice(endIndex);
  fs.writeFileSync(path, source);
}

console.log('Editor, Preview and published article now use one shared rendering contract and matching content width.');
