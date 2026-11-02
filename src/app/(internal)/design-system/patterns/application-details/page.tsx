import type { Metadata } from "next";
import ApplicationDetailsPattern from "components/showcase/ApplicationDetailsPattern";

export const metadata: Metadata = {
  title: "Application Details pattern",
  description: "The full Application Details page built from the shared components, with mock data.",
  robots: { index: false },
};

export default function ApplicationDetailsPatternPage() {
  return <ApplicationDetailsPattern />;
}
