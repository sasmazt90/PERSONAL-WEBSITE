import { useEffect, useRef, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import { Extension } from "@tiptap/core";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { sanitizeHtml, type BlogInternalLink, type BlogLanguage, type BlogVisual } from "@shared/blog";

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element: HTMLElement) => element.style.fontSize || null,
          renderHTML: (attributes: { fontSize?: string }) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export function RichTextEditor({ content, language, visuals, internalLinks, onUploadImage, onChange }: {
  content: string;
  language: BlogLanguage;
  visuals: BlogVisual[];
  internalLinks?: BlogInternalLink[];
  onUploadImage?: (file: File) => Promise<{ url: string; alt?: string }>;
  onChange: (html: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ allowBase64: false, HTMLAttributes: { loading: "lazy", decoding: "async" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: content || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[420px] rounded-b-2xl border-x border-b border-white/10 bg-slate-950/60 p-5 text-slate-100 outline-none focus:border-blue-400 prose-headings:font-['Space_Grotesk'] prose-a:text-blue-300 prose-img:rounded-xl prose-table:border prose-table:border-white/10 prose-th:border prose-th:border-white/10 prose-td:border prose-td:border-white/10 prose-th:p-2 prose-td:p-2",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(sanitizeHtml(currentEditor.getHTML())),
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = content || "<p></p>";
    if (editor.getHTML() !== nextContent) editor.commands.setContent(nextContent, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) return <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">Loading editor...</div>;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (!url.trim()) return void editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const insertExistingImage = () => {
    const available = visuals.filter((visual) => visual.url);
    if (!available.length) {
      window.alert("No uploaded visuals yet. Choose Upload New Image instead.");
      return;
    }
    const choices = available.map((visual, index) => `${index + 1}. ${visual.visualType} — ${visual.fileName}`).join("\n");
    const selected = Number(window.prompt(`Choose an uploaded visual by number:\n${choices}`, "1"));
    const visual = available[selected - 1];
    if (!visual?.url) return;
    editor.chain().focus().setImage({ src: visual.url, alt: visual.alt[language] || visual.fileName }).run();
    if (visual.caption[language]) editor.chain().focus().insertContent(`<p data-block="caption"><em>Figure:</em> ${escapeHtml(visual.caption[language])}</p>`).run();
  };

  const handleImageButton = () => {
    const hasExisting = visuals.some((visual) => visual.url);
    if (hasExisting) {
      const uploadNew = window.confirm("Press OK to upload a new image. Press Cancel to insert an existing uploaded visual.");
      if (!uploadNew) return insertExistingImage();
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    if (!onUploadImage) {
      window.alert("Image upload is not available in this editor context.");
      return;
    }
    try {
      const result = await onUploadImage(file);
      const alt = window.prompt("Alt text", result.alt || file.name.replace(/\.[^.]+$/, "")) || result.alt || "";
      editor.chain().focus().setImage({ src: result.url, alt }).run();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Image upload failed.");
    }
  };

  const insertCaption = () => {
    const caption = window.prompt("Figure caption");
    if (!caption?.trim()) return;
    editor.chain().focus().insertContent(`<p data-block="caption"><em>Figure:</em> ${escapeHtml(caption.trim())}</p>`).run();
  };

  const insertCta = () => {
    const title = window.prompt("CTA title", "Next step")?.trim();
    if (!title) return;
    const body = window.prompt("CTA text", "Explore the related system or case study.")?.trim() || "";
    const url = window.prompt("CTA URL", "https://www.sasmaz.digital")?.trim() || "";
    const label = window.prompt("Button label", "Explore")?.trim() || "Explore";
    editor.chain().focus().insertContent(`<aside data-block="cta" class="blog-cta-block"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>${url ? `<p><a href="${escapeAttribute(url)}">${escapeHtml(label)}</a></p>` : ""}</aside>`).run();
  };

  const insertFaq = () => {
    const question = window.prompt("FAQ question")?.trim();
    if (!question) return;
    const answer = window.prompt("FAQ answer")?.trim();
    if (!answer) return;
    editor.chain().focus().insertContent(`<section data-block="faq-inline"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></section>`).run();
  };

  const insertVisualByType = (type: "kpi" | "framework") => {
    const candidates = visuals.filter((visual) => visual.visualType === type && visual.url);
    if (!candidates.length) {
      editor.chain().focus().insertContent(type === "kpi"
        ? `<aside data-block="kpi-callout" class="blog-kpi-callout"><strong>KPI signal:</strong><p>Add verified KPI context here.</p></aside>`
        : `<figure data-block="framework-placeholder" class="blog-framework-placeholder"><div>Framework visual pending</div><figcaption>Add or upload a framework visual in Visual Manager.</figcaption></figure>`).run();
      return;
    }
    const visual = candidates[0];
    editor.chain().focus().insertContent(`<figure data-block="${type}-visual"><img src="${escapeAttribute(visual.url!)}" alt="${escapeAttribute(visual.alt[language] || visual.fileName)}" loading="lazy" decoding="async">${visual.caption[language] ? `<figcaption>${escapeHtml(visual.caption[language])}</figcaption>` : ""}</figure>`).run();
  };

  const insertInternalLink = () => {
    const links = (internalLinks || []).filter((link) => link.url);
    if (!links.length) return void setLink();
    const choices = links.map((link, index) => `${index + 1}. ${link.label || link.url} — ${link.url}`).join("\n");
    const selected = Number(window.prompt(`Choose an internal link by number:\n${choices}`, "1"));
    const link = links[selected - 1];
    if (!link) return;
    const label = window.prompt("Anchor text", link.label || link.url)?.trim() || link.label || link.url;
    editor.chain().focus().insertContent(`<a href="${escapeAttribute(link.url)}">${escapeHtml(label)}</a>`).run();
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      <input ref={fileInputRef} type="file" className="sr-only" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFileUpload(file); event.currentTarget.value = ""; }} />
      <div className="flex flex-wrap gap-2 rounded-t-2xl border border-white/10 bg-slate-950/50 p-2">
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={15} /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("bold")} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></ToolbarButton>
        <ToolbarButton label="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}><Type size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 1 })} label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton active={editor.isActive("bulletList")} label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></ToolbarButton>
        <ToolbarButton label="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "left" })} label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "center" })} label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "right" })} label="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={15} /></ToolbarButton>
        <ToolbarButton label="Link" onClick={setLink}><LinkIcon size={15} /></ToolbarButton>
        <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Eraser size={15} /></ToolbarButton>
        <ColorPicker label="Text color" value="#60a5fa" onChange={(value) => editor.chain().focus().setColor(value).run()} />
        <ColorPicker label="Highlight" value="#854d0e" onChange={(value) => editor.chain().focus().toggleHighlight({ color: value }).run()} icon={<Highlighter size={15} />} />
        <ToolbarButton label="Font smaller" onClick={() => editor.chain().focus().setFontSize("0.9em").run()}>A-</ToolbarButton>
        <ToolbarButton label="Font larger" onClick={() => editor.chain().focus().setFontSize("1.2em").run()}>A+</ToolbarButton>
        <ToolbarButton label="Upload or insert image" onClick={handleImageButton}><ImagePlus size={15} /></ToolbarButton>
        <ToolbarButton label="Table block" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={15} /></ToolbarButton>
        <ToolbarButton active={editor.isActive("codeBlock")} label="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={15} /></ToolbarButton>
        <ToolbarButton label="Caption block" onClick={insertCaption}>Caption</ToolbarButton>
        <ToolbarButton label="CTA block" onClick={insertCta}>CTA</ToolbarButton>
        <ToolbarButton label="FAQ block" onClick={insertFaq}>FAQ</ToolbarButton>
        <ToolbarButton label="KPI visual / callout" onClick={() => insertVisualByType("kpi")}>KPI</ToolbarButton>
        <ToolbarButton label="Framework visual" onClick={() => insertVisualByType("framework")}>Framework</ToolbarButton>
        <ToolbarButton label="Internal link" onClick={insertInternalLink}>Internal Link</ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ label, active, children, onClick }: { label: string; active?: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold transition ${active ? "border-blue-400/50 bg-blue-500 text-white" : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"}`}>{children}</button>;
}

function ColorPicker({ label, value, icon, onChange }: { label: string; value: string; icon?: ReactNode; onChange: (value: string) => void }) {
  return <label className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-semibold text-slate-200 hover:bg-white/15" title={label}>{icon || <Type size={15} />}<input type="color" aria-label={label} defaultValue={value} onChange={(event) => onChange(event.target.value)} className="h-5 w-5 border-0 bg-transparent p-0" /></label>;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttribute(value: string) { return escapeHtml(value); }
