import type { Metadata } from "next";
import DummyDashboard from "components/showcase/DummyDashboard";

export const metadata: Metadata = {
  title: "Dummy dashboard",
  description: "Every reusable dashboard and overview component on one page, with sample data.",
  robots: { index: false },
};

export default function DummyDashboardPage() {
  return <DummyDashboard />;
}
