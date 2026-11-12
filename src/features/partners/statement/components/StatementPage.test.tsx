import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatementPage from "./StatementPage";
import { rowAction } from "testUtils/rowActions";
const mockUseStatement = jest.fn();
let mockAgency = false;
const rows = Array.from({ length: 20 }, (_, i) => ({
  application_commission_id: `commission-${i}`,
  application_id: `application-${i}`,
  reference: `APP-${i}`,
  student_name: `Student ${i}`,
  partner_id: "partner",
  partner_name: "Team Member",
  university_name: "Example University",
  program_name: "Computer Science",
  commission_amount: i === 0 ? 0 : 1500,
  commission_currency: "MYR",
  waiting_on: "us",
  since_date: "2026-01-01",
  payout_reference: null,
}));
jest.mock("../hooks", () => ({
  useStatement: (params: any) => mockUseStatement(params),
  useStatementCounts: () => ({ us: 38, university: 1, nobody: 1, disputed: 0 }),
}));
jest.mock("features/partners/hooks/profile/usePartnerProfile", () => ({
  usePartnerProfile: () => ({
    partner: {
      type: mockAgency ? "agency" : "individual",
      agency_role: mockAgency ? "admin" : null,
    },
  }),
}));
jest.mock("features/agency-members/hooks/useAgencyMembers", () => ({
  useAgencyMembers: () => ({
    members: [{ partner_id: "member", name: "Team Member" }],
  }),
}));
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => {
  mockAgency = false;
  mockUseStatement.mockReset();
  mockUseStatement.mockReturnValue({
    items: rows,
    total: 40,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
});
it("applies status filters only after confirmation", async () => {
  const user = userEvent.setup();
  render(<StatementPage />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Commission status" }),
    "nobody"
  );
  expect(mockUseStatement).toHaveBeenLastCalledWith(
    expect.objectContaining({ waiting_on: undefined })
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(mockUseStatement).toHaveBeenLastCalledWith(
    expect.objectContaining({ waiting_on: "nobody", page: 1 })
  );
});
it("keeps pagination available when the page search finds no matches", async () => {
  const user = userEvent.setup();
  render(<StatementPage />);
  await user.type(
    screen.getByPlaceholderText(
      "Search this page by application, student, or university..."
    ),
    "not found"
  );
  const next = screen.getByRole("button", { name: "Next page" });
  expect(next).toBeEnabled();
  await user.click(next);
  expect(mockUseStatement).toHaveBeenLastCalledWith(
    expect.objectContaining({ page: 2 })
  );
});
it("previews a zero commission and keeps the application route", async () => {
  const user = userEvent.setup();
  render(<StatementPage />);
  await user.click(
    rowAction("View commission APP-0")
  );
  const drawer = screen.getByRole("dialog", { name: "Commission details" });
  expect(within(drawer).getByText("MYR 0")).toBeInTheDocument();
  expect(
    within(drawer).getByRole("link", { name: "Open application" })
  ).toHaveAttribute("href", "/partner/applications/application-0");
});
it("restricts team-member filters to agency admins", async () => {
  const user = userEvent.setup();
  const view = render(<StatementPage />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  expect(
    screen.queryByText("Team member", { exact: true })
  ).not.toBeInTheDocument();
  view.unmount();
  mockAgency = true;
  render(<StatementPage />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  // The column header also says "Team member"; look for the filter field inside the drawer.
  const drawer = screen.getByRole("dialog", { name: "Filter commissions" });
  expect(within(drawer).getByText("Team member", { exact: true })).toBeInTheDocument();
});
it("stops pagination at the last full page", async () => {
  const user = userEvent.setup();
  render(<StatementPage />);
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
});

it("summarises commissions by status and filters from a tile", async () => {
  const user = userEvent.setup();
  render(<StatementPage />);
  const due = screen.getByRole("button", { name: /Due to you\s*38/ });
  expect(screen.getByRole("button", { name: /Paid\s*1/ })).toBeInTheDocument();
  await user.click(due);
  expect(mockUseStatement).toHaveBeenLastCalledWith(expect.objectContaining({ waiting_on: "us", page: 1 }));
});
