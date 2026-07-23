import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as BulletListIcon,
  ListOrdered as OrderedListIcon,
  Image as ImageIcon,
  Quote as QuoteIcon,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import { resolveUploadUrl } from "@/utils/resolveUploadUrl";
import { adminBlogApi } from "../api";

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const HEADING_OPTIONS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "1", label: "Title (H1)" },
  { value: "2", label: "Heading (H2)" },
  { value: "3", label: "Subheading (H3)" },
];

const ToolbarButton: React.FC<{ active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode; title: string }> = ({
  active, disabled, onClick, children, title,
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "flex items-center justify-center w-8 h-8 rounded-md text-slate-600 transition-colors",
      "hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed",
      active && "bg-teal-50 text-teal-700",
    )}
  >
    {children}
  </button>
);

async function uploadAndInsert(editor: Editor, file: File) {
  if (!file.type.startsWith("image/")) return;
  try {
    const { url } = await adminBlogApi.uploadImage(file);
    editor.chain().focus().setImage({ src: resolveUploadUrl(url) }).run();
  } catch {
    // upload errors are surfaced by apiCall's thrown message via toast in the form dialog
  }
}

const BlogEditor: React.FC<BlogEditorProps> = ({ content, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Placeholder.configure({ placeholder: "Write your post…" }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none min-h-[280px] px-4 py-3 focus:outline-none text-[14px] text-slate-800 leading-relaxed",
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2",
          "[&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500",
          "[&_img]:my-3 [&_img]:rounded-lg [&_img]:max-w-full",
        ),
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0 && editor) {
          event.preventDefault();
          Array.from(files).forEach((file) => uploadAndInsert(editor, file));
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length > 0 && editor) {
          Array.from(files).forEach((file) => uploadAndInsert(editor, file));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  const currentHeading = editor?.isActive("heading", { level: 1 })
    ? "1"
    : editor?.isActive("heading", { level: 2 })
      ? "2"
      : editor?.isActive("heading", { level: 3 })
        ? "3"
        : "paragraph";

  const handleHeadingChange = useCallback((value: string) => {
    if (!editor) return;
    if (value === "paragraph") editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 }).run();
  }, [editor]);

  const handlePickImage = useCallback(() => fileInputRef.current?.click(), []);
  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) uploadAndInsert(editor, file);
    e.target.value = "";
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <Select value={currentHeading} onValueChange={handleHeadingChange}>
          <SelectTrigger size="sm" className="w-[150px] text-[13px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <BulletListIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <OrderedListIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <QuoteIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={handlePickImage}>
          <ImageIcon size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <UndoIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <RedoIcon size={16} />
        </ToolbarButton>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      </div>

      <EditorContent editor={editor} />
      <p className="px-4 pb-3 text-[11px] text-slate-400">Tip: drag &amp; drop an image anywhere in the text to insert it.</p>
    </div>
  );
};

export default BlogEditor;
