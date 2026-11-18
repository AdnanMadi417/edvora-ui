import { selectOption } from "testUtils/selectOption";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatementPage from "./StatementPage";
import { rowAction } from "testUtils/rowActions";
const mockUseStatement = jest.fn();
const mockUseExpected = jest.fn();
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
  useExpectedCommissions: (params: any) => mockUseExpected(params),
}));
const expectedApp = (i: number, over: Record<string, unknown> = {}) => ({
  id: `expected-${i}`,
  updated_at: "2026-01-01",
  program_name: "Data Science",
  university_name: "Sunway University",
  student_name: `Expected Student ${i}`,
  student_email: "",
  stage: "Visa Processing",
  status: "Visa Approved",
  next_action: "",
  lifecycle_status: "active",
  new_notifications_count: 0,
  partner_id: "partner",
  partner_name: "Team Member",
  ...over,
});
const expectedRows = [
  { application: expectedApp(1), status: "ready", expected: { amount: 3000, currency: "RM" } },
  { application: expectedApp(2), status: "ready", expected: { amount: 1500, currency: "RM" } },
  { application: expectedApp(3), status: "ready", expected: { amount: 3000, currency: "USD" } },
  { application: expectedApp(4), status: "failed", expected: null },
  { application: expectedApp(5), status: "loading", expected: null },
];
jest.mock("features/partners/hooks/profile/usePartnerProfile", () => ({
  usePartnerProfile: () => ({
    partner: {
      id: "partner",
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
  mockUseExpected.mockReset();
  mockUseExpected.mockReturnValue({
    rows: expectedRows,
    totals: [
      { currency: "RM", amount: 4500, count: 2 },
      { currency: "USD", amount: 3000, count: 1 },
    ],
    loading: false,
    error: null,
    pending: 1,
    failed: 1,
    retry: jest.fn(),
  });
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
  await selectOption(user,
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
  expect(within(drawer).getByText("RM0")).toBeInTheDocument();
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
  const due = screen.getByRole("button", { name: /Due to you:?\s*38/ });
  expect(screen.getByRole("button", { name: /Paid:?\s*1/ })).toBeInTheDocument();
  await user.click(due);
  expect(mockUseStatement).toHaveBeenLastCalledWith(expect.objectContaining({ waiting_on: "us", page: 1 }));
});

it("totals expected commission per currency, never mixed", () => {
  render(<StatementPage />);
  const summary = screen.getByRole("region", { name: "Expected commission" });
  expect(within(summary).getByText("RM4,500")).toBeInTheDocument();
  expect(within(summary).getByText("USD 3,000")).toBeInTheDocument();
  expect(within(summary).queryByText("RM7,500")).not.toBeInTheDocument();
  expect(within(summary).getByText(/Adding up 3 of 5 applications/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Expected:?\s*5/ })).toBeInTheDocument();
});

it("lists expected rows from the Expected tile", async () => {
  const user = userEvent.setup();
  render(<StatementPage />);
  expect(screen.queryByText("Expected Student 1")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Expected:?\s*5/ }));
  const table = screen.getByRole("table", { name: "Expected commission" });
  expect(within(table).getAllByText("Expected Student 1").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("RM3,000").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("USD 3,000").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("Couldn't load").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("Now at Visa Processing").length).toBeGreaterThan(0);
  await waitFor(() => expect(screen.queryByText("APP-1")).not.toBeInTheDocument());
  // The statement isn't asked for an "expected" state it doesn't know.
  expect(mockUseStatement).toHaveBeenLastCalledWith(expect.objectContaining({ waiting_on: undefined }));
});

it("offers Expected in the status filter and scopes it to the chosen team member", async () => {
  const user = userEvent.setup();
  mockAgency = true;
  render(<StatementPage />);
  expect(mockUseExpected).toHaveBeenLastCalledWith(
    expect.objectContaining({ partnerId: "partner", includeMembers: true, memberPartnerId: undefined })
  );
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await selectOption(user, screen.getByRole("combobox", { name: "Commission status" }), "expected");
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(screen.getByRole("table", { name: "Expected commission" })).toBeInTheDocument();
});

it("keeps members to their own expected commission", () => {
  render(<StatementPage />);
  expect(mockUseExpected).toHaveBeenLastCalledWith(
    expect.objectContaining({ includeMembers: false, memberPartnerId: undefined })
  );
});
