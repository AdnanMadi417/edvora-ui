"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { useEffect, useCallback, useId, useRef, useState } from "react";
import {
  buttonBase,
  buttonVariants,
  fieldControl,
  fieldWrapper,
  focusRing,
  iconButtonSizes,
} from "components/ub/recipes";
import { FieldError, FieldLabel } from "components/ub/forms/layout/FieldChrome";
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

// 32px toolbar buttons; active formats use the selected fill + link colour.
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
    onKeyDown={(e) => {
      // onMouseDown keeps the editor selection for pointer users; keyboard users activate here.
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    title={title}
    aria-label={title}
    aria-pressed={active ?? undefined}
    className={`grid h-8 w-8 place-items-center rounded-ub-md transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none ${focusRing} ${
      active
        ? "bg-ub-selected text-ub-text-link"
        : "text-ub-icon-default hover:bg-ub-action-secondary-hover hover:text-ub-text-primary"
    }`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div aria-hidden="true" className="mx-1 h-5 w-px bg-ub-border" />;

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
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
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
          "outline-none min-h-[120px] px-3 py-2.5 text-ub-body-md text-ub-text-primary prose prose-sm max-w-none dark:prose-invert " +
          "prose-headings:text-ub-text-primary prose-p:text-ub-text-primary prose-strong:text-ub-text-primary prose-li:text-ub-text-primary " +
          "prose-a:text-ub-text-link prose-li:marker:text-ub-text-tertiary",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelId,
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

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    if (error) {
      dom.setAttribute("aria-invalid", "true");
      dom.setAttribute("aria-describedby", errorId);
    } else {
      dom.removeAttribute("aria-invalid");
      dom.removeAttribute("aria-describedby");
    }
  }, [editor, error, errorId]);

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

  const linkInput = `${fieldControl} h-8 text-ub-body-sm`;

  return (
    <div className={fieldWrapper} data-field={field}>
      <FieldLabel as="span" id={labelId} required={required}>{label}</FieldLabel>

      <div
        className={`overflow-hidden rounded-ub-md border bg-ub-surface transition-[border-color,box-shadow] duration-ub-fast ease-ub-standard focus-within:ring-1 ${
          error
            ? "border-ub-danger-500 focus-within:border-ub-danger-500 focus-within:ring-ub-danger-500"
            : "border-ub-border-control hover:border-ub-border-control-hover focus-within:border-ub-border-focus focus-within:ring-ub-border-focus"
        }`}
      >
        {/* Toolbar */}
        <div role="group" aria-label={`${label} formatting`} className="flex flex-wrap items-center gap-0.5 border-b border-ub-border bg-ub-surface-subtle px-2 py-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().setParagraph().run()}
            active={editor?.isActive("paragraph")}
            title="Paragraph"
          >
            <Pilcrow aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold"
          >
            <Bold aria-hidden="true" strokeWidth={2} className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet list"
          >
            <List aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={openLinkPopover}
            active={editor?.isActive("link")}
            title="Add link"
          >
            <Link2 aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
          </ToolbarButton>

          {editor?.isActive("link") && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove link"
            >
              <Link2Off aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />
            </ToolbarButton>
          )}
        </div>

        {/* Link popover */}
        {linkPopover && (
          <div className="flex flex-col gap-2 border-b border-ub-border bg-ub-surface-subtle px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col gap-1.5 sm:flex-row">
                <input
                  ref={linkLabelRef}
                  type="text"
                  aria-label="Link text"
                  placeholder="Label (optional)"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className={`${linkInput} sm:w-40`}
                />
                <input
                  type="url"
                  aria-label="Link address"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") cancelLink(); }}
                  className={`${linkInput} flex-1`}
                />
              </div>
              <button
                type="button"
                onClick={applyLink}
                aria-label="Apply link"
                title="Apply link"
                className={`${buttonBase} ${buttonVariants.primary} ${iconButtonSizes.sm}`}
              >
                <Check aria-hidden="true" strokeWidth={2} className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={cancelLink}
                aria-label="Cancel link"
                title="Cancel"
                className={`${buttonBase} ${buttonVariants.secondary} ${iconButtonSizes.sm}`}
              >
                <X aria-hidden="true" strokeWidth={2} className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Editor area */}
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
};

export default RichTextEditor;
