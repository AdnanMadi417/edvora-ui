import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FinanceQueuePage from "./FinanceQueuePage";
const mockQueue = jest.fn();
const mockPayIn = jest.fn();
const mockBatch = jest.fn();
const make = (
  id: string,
  partner = "advisor-a",
  currency = "MYR",
  waiting = "us"
) => ({
  application_commission_id: id,
  application_id: `app-${id}`,
  reference: id,
  student_name: `Student ${id}`,
  partner_id: partner,
  partner_name: partner,
  university_name: "University",
  program_name: "Program",
  commission_amount: 1000,
  commission_currency: currency,
  received_amount: 1000,
  received_currency: currency,
  paid_amount: null,
  paid_currency: null,
  waiting_on: waiting,
  days_waiting: 5,
  typical_days_from: 1,
  typical_days_to: 10,
  last_fact_type: null,
  last_fact_date: null,
  last_fact_reference: null,
});
const rows = [
  make("A"),
  make("B"),
  make("C", "advisor-b"),
  make("D", "advisor-a", "USD"),
  make("E", "advisor-a", "MYR", "university"),
  make("F", "advisor-a", "MYR", "nobody"),
];
jest.mock("../../hooks", () => ({
  useCommissionQueue: (params: any) => mockQueue(params),
}));
jest.mock("features/partners/hooks/management/usePartners", () => ({
  usePartners: () => ({ partners: [], loading: false }),
}));
jest.mock("features/applications/pay-ins", () => ({
  RecordPayIn: ({ isOpen, row }: any) => {
    if (isOpen) mockPayIn(row);
    return isOpen ? (
      <div role="dialog" aria-label="Record pay-in">
        Pay-in form
      </div>
    ) : null;
  },
}));
jest.mock("./BatchPayout", () => ({
  __esModule: true,
  default: (props: any) => {
    if (props.isOpen) mockBatch(props);
    return props.isOpen ? (
      <div role="dialog" aria-label="Batch payout">
        Batch form
      </div>
    ) : null;
  },
}));
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => {
  jest.clearAllMocks();
  mockQueue.mockReturnValue({
    items: rows,
    total: rows.length,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
});
it("locks payout selection to one advisor and currency", async () => {
  const user = userEvent.setup();
  render(<FinanceQueuePage />);
  await user.click(
    screen.getByRole("checkbox", { name: "Select A, Student A" })
  );
  expect(
    screen.getByRole("checkbox", { name: "Select B, Student B" })
  ).toBeEnabled();
  for (const id of ["C", "D", "E", "F"])
    expect(
      screen.getByRole("checkbox", { name: `Select ${id}, Student ${id}` })
    ).toBeDisabled();
  await user.click(
    screen.getByRole("checkbox", { name: "Select B, Student B" })
  );
  await user.click(screen.getByRole("button", { name: "Pay Selected (2)" }));
  expect(mockBatch).toHaveBeenLastCalledWith(
    expect.objectContaining({
      partnerId: "advisor-a",
      currency: "MYR",
      lines: [
        expect.objectContaining({ application_id: "app-A" }),
        expect.objectContaining({ application_id: "app-B" }),
      ],
    })
  );
});
it("keeps select-all within one advisor and currency", async () => {
  const user = userEvent.setup();
  render(<FinanceQueuePage />);
  await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
  expect(
    screen.getByRole("checkbox", { name: "Select A, Student A" })
  ).toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Select B, Student B" })
  ).toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Select C, Student C" })
  ).not.toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Select D, Student D" })
  ).not.toBeChecked();
});
it("normalizes settled visibility when applying settled status", async () => {
  const user = userEvent.setup();
  render(<FinanceQueuePage />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.click(screen.getByRole("checkbox", { name: "Hide settled" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Payment status" }),
    "nobody"
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(mockQueue).toHaveBeenLastCalledWith(
    expect.objectContaining({
      waiting_on: "nobody",
      hide_settled: false,
      page: 1,
    })
  );
});
it("opens the existing pay-in form only from its row action", async () => {
  const user = userEvent.setup();
  render(<FinanceQueuePage />);
  expect(mockPayIn).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "More actions for E, Student E" }));
  await user.click(screen.getByRole("menuitem", { name: "Record pay-in" }));
  expect(mockPayIn).toHaveBeenCalledWith({
    application_id: "app-E",
    reference: "E",
    student_name: "Student E",
  });
});
it("shows commission amounts and application navigation in the preview", async () => {
  const user = userEvent.setup();
  render(<FinanceQueuePage />);
  await user.click(screen.getByRole("button", { name: "More actions for A, Student A" }));
  await user.click(screen.getByRole("menuitem", { name: "View commission A" }));
  const drawer = screen.getByRole("dialog", { name: "Commission details" });
  expect(
    within(drawer).getByRole("link", { name: "Open application" })
  ).toHaveAttribute("href", "/admin/applications/app-A");
  expect(within(drawer).getAllByText("MYR 1,000").length).toBeGreaterThan(0);
});
it("removes a selection when a refreshed commission is no longer payable", async () => {
  const user = userEvent.setup();
  const view = render(<FinanceQueuePage />);
  await user.click(
    screen.getByRole("checkbox", { name: "Select A, Student A" })
  );
  expect(
    screen.getByRole("button", { name: "Pay Selected (1)" })
  ).toBeInTheDocument();
  mockQueue.mockReturnValue({
    items: rows.map((row) =>
      row.application_commission_id === "A"
        ? { ...row, waiting_on: "nobody" }
        : row
    ),
    total: rows.length,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  view.rerender(<FinanceQueuePage />);
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "Pay Selected (1)" })
    ).not.toBeInTheDocument()
  );
});
