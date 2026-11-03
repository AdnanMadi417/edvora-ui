import type { Metadata } from "next";
import AdvisorProfilePattern from "components/showcase/AdvisorProfilePattern";

export const metadata: Metadata = {
  title: "Advisor profile pattern",
  description: "The Advisor profile editor and public page built from the shared components, with mock data.",
  robots: { index: false },
};

export default function AdvisorProfilePatternPage() {
  return <AdvisorProfilePattern />;
}
