import type { Metadata } from "next";
import Gallery from "components/showcase/Gallery";

export const metadata: Metadata = {
  title: "Unibexs UI template 2026",
  description: "Live gallery of every UI component in the Unibexs portal, with the design system tokens.",
  robots: { index: false },
};

export default function UiTemplatePage() {
  return <Gallery />;
}
