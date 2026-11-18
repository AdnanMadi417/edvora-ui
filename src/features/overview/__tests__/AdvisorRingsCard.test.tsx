import { render, screen } from "@testing-library/react";
import AdvisorRingsCard from "../components/AdvisorRingsCard";

it("shows how many advisors there are, and links each group to the filtered list", () => {
  render(
    <AdvisorRingsCard
      href="/admin/advisors"
      onRetry={jest.fn()}
      resource={{ state: "ready", data: { total: 5, items: [], advisorStats: { active: 15, inactive: 6, agency: 6, individual: 15 } } }}
    />
  );
  expect(screen.getByRole("heading", { name: "Advisors" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /Active 15 of 21/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Suspended: 6, 29% of advisors" })).toHaveAttribute("href", "/admin/advisors?status=inactive");
  expect(screen.getByRole("link", { name: "Company: 6, 29% of advisors" })).toHaveAttribute("href", "/admin/advisors?status=agency");
});

it("says the counts aren't available when the response has none", () => {
  render(<AdvisorRingsCard href="/admin/advisors" onRetry={jest.fn()} resource={{ state: "ready", data: { total: 5, items: [] } }} />);
  expect(screen.getByText("Advisor counts aren't available.")).toBeInTheDocument();
});
