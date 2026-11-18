import { render, screen } from "@testing-library/react";
import RoleOverview from "../components/RoleOverview";
import type { OverviewContext } from "../model/types";
let mockContext: OverviewContext;
jest.mock("../hooks/useRoleOverview", () => ({
  useRoleOverview: () => ({
    context: mockContext,
    plans: [],
    resources: {
      universityCommission: {
        state: "ready",
        data: { total: 0, items: [], universityCommission: [] },
      },
    },
    refresh: jest.fn(),
    waiting: false,
    denied: false,
  }),
}));
jest.mock("../components/OverviewVisual", () => () => null);
it.each(["reviewer", "data_entry", "account_manager"] as const)(
  "does not render commission for %s even if resources contain finance data",
  (role) => {
    mockContext = { role };
    render(<RoleOverview role={role} />);
    expect(
      screen.queryByRole("heading", { name: "Commission by university" })
    ).not.toBeInTheDocument();
  }
);
it("hides university commission and team shortcuts from restricted advisor members", () => {
  mockContext = {
    role: "partner",
    partnerId: "p1",
    canViewCommission: false,
    agencyAdmin: false,
    canCreateApplication: true,
  };
  render(<RoleOverview role="partner" />);
  expect(
    screen.queryByRole("heading", { name: "Commission by university" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /manage your team/i })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "New application" })
  ).toBeInTheDocument();
});

it("gives agency owners a team shortcut alongside their financial overview", () => {
  mockContext = {
    role: "partner",
    partnerId: "p1",
    canViewCommission: true,
    agencyAdmin: true,
    canCreateApplication: true,
  };
  render(<RoleOverview role="partner" />);
  expect(
    screen.getByRole("link", { name: /manage your team/i })
  ).toHaveAttribute("href", "/partner/team-members");
  expect(
    screen.getByRole("heading", { name: "Commission overview" })
  ).toBeInTheDocument();
});

it.each(["admin", "partner"] as const)(
  "does not include the university commission section on %s home",
  (role) => {
    mockContext = {
      role,
      partnerId: "p1",
      canViewCommission: true,
      agencyAdmin: true,
      canCreateApplication: true,
    };
    render(<RoleOverview role={role} />);
    expect(
      screen.queryByRole("heading", { name: "Commission by university" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Commission overview" })
    ).toBeInTheDocument();
  }
);
