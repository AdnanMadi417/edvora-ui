import type { Metadata } from "next";
import Gallery from "components/showcase/Gallery";

// Guideline page (brief §7): every token and component rendered from code.
// The brief gates this route to staff; in UI-only mode there is no auth, so
// it is open. /ui-unibexs-template-2026 renders the same gallery.
export const metadata: Metadata = {
  title: "Unibexs design system",
  description: "Living style guide: tokens and components rendered from code.",
  robots: { index: false },
};

export default function DesignSystemPage() {
  return <Gallery />;
}
