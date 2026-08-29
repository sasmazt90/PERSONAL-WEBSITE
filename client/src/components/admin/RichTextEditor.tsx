import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { Extension, Node, mergeAttributes } from "@tiptap/core";
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
  Upload,
  X,
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

const CtaButton = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      label: { default: "Learn more" },
      href: { default: "https://www.sasmaz.digital" },
    };
  },
  parseHTML() {
    return [{
      tag: "div[data-cta-wrap]",
      getAttrs: (element) => {
        const anchor = (element as HTMLElement).querySelector("a[data-cta-button]");
        return {
          label: anchor?.textContent || "Learn more",
          href: anchor?.getAttribute("href") || "https://www.sasmaz.digital",
        };
      },
    }];
  },
  renderHTML({ HTMLAttributes }) {
    const label = String(HTMLAttributes.label || "Learn more");
    const href = String(HTMLAttributes.href || "https://www.sasmaz.digital");
    return [
      "div",
      mergeAttributes({
        "data-cta-wrap": "true",
        style: "margin:28px 0;display:flex;justify-content:flex-start;",
      }),
      [
        "a",
        {
          "data-cta-button": "true",
          href,
          rel: "noopener noreferrer",
          style: "display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;background:#2563eb;color:#fff;padding:12px 20px;font-weight:700;text-decoration:none;",
        },
        label,
      ],
    ];
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

export function RichTextEditor({
  content,
  language,
  visuals,
  internalLinks,
  onUploadImage,
  onChange,
}: {
  content: string;
  language: BlogLanguage;
  visuals: BlogVisual[];
  internalLinks?: BlogInternalLink[];
  onUploadImage?: (file: File) => Promise<{ url: string; alt?: string }>;
  onChange: (html: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, setToolbarVersion] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ allowBase64: false, HTMLAttributes: { loading: "lazy", decoding: "async" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CtaButton,
    ],
    content: content || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[68vh] px-7 py-8 text-[17px] leading-8 text-slate-100 outline-none prose-headings:font-['Space_Grotesk'] prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-a:text-blue-300 prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-blockquote:border-l-blue-400 prose-blockquote:text-slate-300 prose-table:border prose-table:border-white/10 prose-th:border prose-th:border-white/10 prose-td:border prose-td:border-white/10 prose-th:p-2 prose-td:p-2",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(sanitizeHtml(currentEditor.getHTML())),
    onSelectionUpdate: () => setToolbarVersion((value) => value + 1),
    onTransaction: () => setToolbarVersion((value) => value + 1),
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = content || "<p></p>";
    if (editor.getHTML() !== nextContent) editor.commands.setContent(nextContent, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) {
    return <div className="min-h-[420px] rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">Loading editor...</div>;
  }

  const uploadedVisuals = visuals.filter((visual) => visual.url);

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const insertVisual = (visual: BlogVisual) => {
    if (!visual.url) return;
    editor.chain().focus().setImage({ src: visual.url, alt: visual.alt[language] || visual.fileName }).run();
    setMediaOpen(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!onUploadImage) {
      window.alert("Image upload is not available in this editor context.");
      return;
    }
    setUploading(true);
    try {
      const result = await onUploadImage(file);
      editor.chain().focus().setImage({ src: result.url, alt: result.alt || file.name.replace(/\.[^.]+$/, "") }).run();
      setMediaOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const insertCaption = () => {
    const caption = window.prompt("Caption text")?.trim();
    if (!caption) return;
    editor.chain().focus().insertContent(`<p><em>Figure:</em> ${escapeHtml(caption)}</p>`).run();
  };

  const insertCta = () => {
    const href = window.prompt("CTA destination URL", "https://www.sasmaz.digital")?.trim();
    if (!href) return;
    const label = window.prompt("Button text", "Learn more")?.trim() || "Learn more";
    editor.chain().focus().insertContent({ type: "ctaButton", attrs: { href, label } }).run();
  };

  const insertFaq = () => {
    const question = window.prompt("FAQ question")?.trim();
    if (!question) return;
    const answer = window.prompt("FAQ answer")?.trim();
    if (!answer) return;
    editor.chain().focus().insertContent(`<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).run();
  };

  const insertVisualByType = (type: "kpi" | "framework") => {
    const candidates = uploadedVisuals.filter((visual) => visual.visualType === type);
    if (!candidates.length) {
      window.alert(`Upload a ${type.toUpperCase()} visual first, then click ${type === "kpi" ? "KPI" : "Framework"} again.`);
      setMediaOpen(true);
      return;
    }
    insertVisual(candidates[0]);
  };

  const insertInternalLink = () => {
    const links = (internalLinks || []).filter((link) => link.url);
    if (!links.length) {
      setLink();
      return;
    }
    const choices = links.map((link, index) => `${index + 1}. ${link.label || link.url}`).join("\n");
    const selected = Number(window.prompt(`Choose an internal link:\n${choices}`, "1"));
    const link = links[selected - 1];
    if (!link) return;
    const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ");
    const label = selectedText.trim() || link.label || link.url;
    if (selectedText.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: link.url }).run();
    } else {
      editor.chain().focus().insertContent(`<a href="${escapeAttribute(link.url)}">${escapeHtml(label)}</a>`).run();
    }
  };

  return (
    <div className="relative overflow-visible rounded-3xl border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/10">
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept=".png,.jpg,.jpeg,.webp,.svg"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFileUpload(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="sticky top-[92px] z-30 border-b border-white/10 bg-slate-950/95 p-2.5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={15} /></ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={15} /></ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton active={editor.isActive("bold")} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("italic")} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("underline")} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("strike")} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton active={editor.isActive("paragraph")} label="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}><Type size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("heading", { level: 1 })} label="H1" onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}>H1</ToolbarButton>
          <ToolbarButton active={editor.isActive("heading", { level: 2 })} label="H2" onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}>H2</ToolbarButton>
          <ToolbarButton active={editor.isActive("heading", { level: 3 })} label="H3" onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}>H3</ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton active={editor.isActive("bulletList")} label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("orderedList")} label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("blockquote")} label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></ToolbarButton>
          <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15} /></ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton active={editor.isActive({ textAlign: "left" })} label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive({ textAlign: "center" })} label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive({ textAlign: "right" })} label="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={15} /></ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton active={editor.isActive("link")} label="Link" onClick={setLink}><LinkIcon size={15} /></ToolbarButton>
          <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Eraser size={15} /></ToolbarButton>
          <ColorPicker label="Text color" value="#60a5fa" onChange={(value) => editor.chain().focus().setColor(value).run()} />
          <ColorPicker label="Highlight" value="#854d0e" onChange={(value) => editor.chain().focus().toggleHighlight({ color: value }).run()} icon={<Highlighter size={15} />} />
          <ToolbarButton label="Smaller text" onClick={() => editor.chain().focus().setFontSize("0.9em").run()}>A-</ToolbarButton>
          <ToolbarButton label="Larger text" onClick={() => editor.chain().focus().setFontSize("1.2em").run()}>A+</ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton active={mediaOpen} label="Media library" onClick={() => setMediaOpen((value) => !value)}><ImagePlus size={15} /></ToolbarButton>
          <ToolbarButton label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={15} /></ToolbarButton>
          <ToolbarButton active={editor.isActive("codeBlock")} label="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={15} /></ToolbarButton>
          <ToolbarButton label="Caption" onClick={insertCaption}>Caption</ToolbarButton>
          <ToolbarButton label="CTA button" onClick={insertCta}>CTA</ToolbarButton>
          <ToolbarButton label="FAQ" onClick={insertFaq}>FAQ</ToolbarButton>
          <ToolbarButton label="KPI visual" onClick={() => insertVisualByType("kpi")}>KPI</ToolbarButton>
          <ToolbarButton label="Framework visual" onClick={() => insertVisualByType("framework")}>Framework</ToolbarButton>
          <ToolbarButton label="Internal link" onClick={insertInternalLink}>Internal Link</ToolbarButton>
        </div>

        {mediaOpen ? (
          <div className="mt-2 rounded-2xl border border-white/10 bg-[#111827] p-3 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Media library</div>
                <div className="text-xs text-slate-400">Click any uploaded image to insert it at the cursor.</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50">
                  <Upload size={14} /> {uploading ? "Uploading…" : "Upload image"}
                </button>
                <button type="button" onClick={() => setMediaOpen(false)} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label="Close media library"><X size={14} /></button>
              </div>
            </div>
            {uploadedVisuals.length ? (
              <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
                {uploadedVisuals.map((visual) => (
                  <button key={visual.id} type="button" onClick={() => insertVisual(visual)} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-left hover:border-blue-400/60 hover:bg-white/[0.07]">
                    <img src={visual.url} alt={visual.alt[language] || visual.fileName} className="aspect-video w-full object-cover" />
                    <div className="px-2 py-2">
                      <div className="truncate text-xs font-bold text-slate-200">{visual.fileName}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">{visual.visualType}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-sm font-semibold text-slate-400 hover:border-blue-400/50 hover:text-slate-200">
                <Upload size={16} /> Upload the first image
              </button>
            )}
          </div>
        ) : null}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ label, active, children, onClick }: { label: string; active?: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition ${active ? "border-blue-400/60 bg-blue-500 text-white" : "border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/12"}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-6 w-px bg-white/10" aria-hidden="true" />;
}

function ColorPicker({ label, value, icon, onChange }: { label: string; value: string; icon?: ReactNode; onChange: (value: string) => void }) {
  return (
    <label className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 text-xs font-semibold text-slate-200 hover:bg-white/12" title={label}>
      {icon || <Type size={15} />}
      <input type="color" aria-label={label} defaultValue={value} onChange={(event) => onChange(event.target.value)} className="h-4 w-4 border-0 bg-transparent p-0" />
    </label>
  );
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
