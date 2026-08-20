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

const RichTextDisplay = ({ html, className = "" }: RichTextDisplayProps) => {
  if (!html) return null;

  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });

  return (
    <div
      className={`prose prose-sm max-w-none text-slate-700
        prose-headings:font-semibold prose-headings:text-slate-900
        prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-ul:list-disc prose-ul:pl-4
        prose-ol:list-decimal prose-ol:pl-4
        prose-strong:font-semibold prose-strong:text-slate-900
        ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichTextDisplay;
