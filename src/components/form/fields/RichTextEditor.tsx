"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  Bold,
  List,
  ListOrdered,
  Link2,
  Link2Off,
  Heading1,
  Heading2,
  Pilcrow,
  Check,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  field: string;
  required?: boolean;
  placeholder?: string;
  formData: Record<string, any>;
  errors: Record<string, any>;
  updateFormData: (field: string, value: string) => void;
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={`flex h-7 w-7 items-center justify-center rounded transition ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    }`}
  >
    {children}
  </button>
);

const getNestedValue = (obj: Record<string, any>, path: string): any => {
  if (!path) return undefined;
  return path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const RichTextEditor = ({
  label,
  field,
  required = false,
  placeholder = "Write something...",
  formData,
  errors,
  updateFormData,
}: RichTextEditorProps) => {
  const value = getNestedValue(formData, field) ?? "";
  const error = errors?.[field];

  const [linkPopover, setLinkPopover] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const linkLabelRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2] }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-[120px] px-3 py-2 text-sm text-slate-800 prose prose-sm max-w-none",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      updateFormData(field, html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href ?? "";
    const selection = editor.state.doc.cut(
      editor.state.selection.from,
      editor.state.selection.to
    ).textContent;
    setLinkUrl(existing);
    setLinkLabel(selection || "");
    setLinkPopover(true);
    setTimeout(() => linkLabelRef.current?.focus(), 50);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const chain = editor.chain().focus().extendMarkRange("link");
      if (linkLabel.trim()) {
        chain.insertContent(`<a href="${url}">${linkLabel.trim()}</a>`).run();
      } else {
        chain.setLink({ href: url }).run();
      }
    }
    setLinkPopover(false);
    setLinkLabel("");
    setLinkUrl("");
  }, [editor, linkUrl, linkLabel]);

  const cancelLink = () => {
    setLinkPopover(false);
    setLinkLabel("");
    setLinkUrl("");
  };

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div
        className={`mt-2 overflow-hidden rounded-md border transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${
          error ? "border-red-500" : "border-default"
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor?.chain().focus().setParagraph().run()}
            active={editor?.isActive("paragraph")}
            title="Paragraph"
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1.5 h-4 w-px bg-slate-200" />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1.5 h-4 w-px bg-slate-200" />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>

          <div className="mx-1.5 h-4 w-px bg-slate-200" />

          <ToolbarButton
            onClick={openLinkPopover}
            active={editor?.isActive("link")}
            title="Add link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>

          {editor?.isActive("link") && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove link"
            >
              <Link2Off className="h-3.5 w-3.5" />
            </ToolbarButton>
          )}
        </div>

        {/* Link popover */}
        {linkPopover && (
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col gap-1.5 sm:flex-row">
                <input
                  ref={linkLabelRef}
                  type="text"
                  placeholder="Label (optional)"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-40"
                />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") cancelLink(); }}
                  className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={applyLink}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-700"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={cancelLink}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Editor area */}
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
