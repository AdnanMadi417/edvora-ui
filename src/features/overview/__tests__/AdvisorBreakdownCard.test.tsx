import { render, screen } from "@testing-library/react";
import AdvisorBreakdownCard from "../components/AdvisorBreakdownCard";

const stats = { active: 15, inactive: 6, agency: 6, individual: 15, verified: 16, unverified: 5 };

it("splits all advisors one dimension per row, each adding up to the whole", () => {
  render(<AdvisorBreakdownCard href="/admin/advisors" onRetry={jest.fn()} resource={{ state: "ready", data: { total: 5, items: [], advisorStats: stats } }} />);
  expect(screen.getByText("21 advisors, by verification, account status and type.")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Verification" })).toHaveTextContent("Verified16");
  expect(screen.getByRole("link", { name: "Verification, Awaiting review: 5 advisors, 24%" })).toHaveAttribute("href", "/admin/advisors?status=unverified");
  expect(screen.getByRole("link", { name: "Account, Suspended: 6 advisors, 29%" })).toHaveAttribute("href", "/admin/advisors?status=suspended");
  expect(screen.getByRole("link", { name: "Type, Company: 6 advisors, 29%" })).toHaveAttribute("href", "/admin/advisors?status=company");
});

it("says the counts aren't available when the response has none", () => {
  render(<AdvisorBreakdownCard href="/admin/advisors" onRetry={jest.fn()} resource={{ state: "ready", data: { total: 5, items: [] } }} />);
  expect(screen.getByText("Advisor counts aren't available.")).toBeInTheDocument();
});
