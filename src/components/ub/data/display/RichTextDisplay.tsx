import DOMPurify from "isomorphic-dompurify";

interface RichTextDisplayProps {
  html: string;
  className?: string;
}

// Matches exactly what RichTextEditor.tsx's TipTap config can produce
// (StarterKit with heading disabled + a separate Heading[1,2] extension,
// plus the Link extension) — nothing else is ever authored by that editor.
const ALLOWED_TAGS = [
  "p", "h1", "h2",
  "strong", "b", "em", "i", "s", "strike", "code",
  "ul", "ol", "li",
  "blockquote", "pre", "hr", "br",
  "a",
];
const ALLOWED_ATTR = ["href", "target", "rel"];

// Typography plugin colours mapped to Unibexs semantic tokens, so authored
// content follows data-ub-theme into dark mode without prose-invert.
const PROSE_TOKENS = [
  "[--tw-prose-body:var(--ub-text-secondary)]",
  "[--tw-prose-headings:var(--ub-text-primary)]",
  "[--tw-prose-links:var(--ub-text-link)]",
  "[--tw-prose-bold:var(--ub-text-primary)]",
  "[--tw-prose-counters:var(--ub-text-tertiary)]",
  "[--tw-prose-bullets:var(--ub-text-tertiary)]",
  "[--tw-prose-hr:var(--ub-border-default)]",
  "[--tw-prose-quotes:var(--ub-text-primary)]",
  "[--tw-prose-quote-borders:var(--ub-border-default)]",
  "[--tw-prose-code:var(--ub-text-primary)]",
  "[--tw-prose-pre-code:var(--ub-text-primary)]",
  "[--tw-prose-pre-bg:var(--ub-bg-surface-subtle)]",
].join(" ");

const RichTextDisplay = ({ html, className = "" }: RichTextDisplayProps) => {
  if (!html) return null;

  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });

  return (
    <div
      className={`${PROSE_TOKENS} prose prose-sm max-w-ub-reading
        prose-headings:font-semibold
        prose-p:leading-relaxed
        prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-ub-action-primary-hover
        prose-ul:list-disc prose-ul:ps-4
        prose-ol:list-decimal prose-ol:ps-4
        prose-li:ps-0
        prose-strong:font-semibold
        ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichTextDisplay;
