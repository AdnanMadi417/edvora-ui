import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import TransferPartnersModal from "./TransferPartnersModal";
import { useAccountManagers } from "../hooks/useAccountManagers";
import { useTransferPartners } from "../hooks/useTransferPartners";

const mockShowToast = jest.fn();

jest.mock("../hooks/useAccountManagers", () => ({ useAccountManagers: jest.fn() }));
jest.mock("../hooks/useTransferPartners", () => ({ useTransferPartners: jest.fn() }));
// jest.mock paths are not rewritten by the tsconfig baseUrl the way imports
// are, so this one has to be relative to resolve to the same module.
jest.mock("components/ub/feedback/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockedUseAccountManagers = useAccountManagers as jest.Mock;
const mockedUseTransferPartners = useTransferPartners as jest.Mock;

const SOURCE = {
  id: "manager-a",
  name: "Sarah Lim",
  email: "sarah@example.com",
  is_active: true,
  assigned_partners_count: "2",
  assigned_partners: [
    { id: "p1", name: "Acme Agency", email: "ops@acme.com", type: "agency" as const },
    { id: "p2", name: "John Doe", email: "john@doe.com", type: "individual" as const },
  ],
};

const TARGET = {
  id: "manager-b",
  name: "Ahmad Razak",
  email: "ahmad@example.com",
  is_active: true,
  assigned_partners_count: "1",
  assigned_partners: [{ id: "p9", name: "B Own" }],
};

const MOVE_RESULT = {
  mode: "move" as const,
  source_manager_id: "manager-a",
  target_manager_id: "manager-b",
  moved_partners_count: 2,
  moved_agency_members_count: 3,
  moved_partner_ids: ["p1", "p2"],
  shared_partners_count: 0,
  shared_agency_members_count: 0,
  already_shared_count: 0,
  shared_partner_ids: [],
};

function apiError(status: number, code: string, details?: unknown) {
  return new AxiosError("Request failed", String(status), undefined, undefined, {
    status,
    statusText: "",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: { code, message: "backend message", details: details ?? null },
  });
}

function setup(overrides: { transfer?: jest.Mock; managers?: unknown[]; allowShare?: boolean } = {}) {
  const transfer = overrides.transfer ?? jest.fn();
  mockedUseAccountManagers.mockReturnValue({
    accountManagers: overrides.managers ?? [SOURCE, TARGET],
    loading: false,
    error: null,
  });
  mockedUseTransferPartners.mockReturnValue({ transferPartners: transfer, loading: false, error: null });

  const onClose = jest.fn();
  const onTransferred = jest.fn();
  render(
    <TransferPartnersModal
      isOpen
      onClose={onClose}
      sourceManager={SOURCE}
      onTransferred={onTransferred}
      allowShare={overrides.allowShare}
    />
  );
  return { transfer, onClose, onTransferred };
}

describe("TransferPartnersModal", () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    mockedUseAccountManagers.mockReset();
    mockedUseTransferPartners.mockReset();
  });

  it("defaults to Transfer, explains the move, previews the advisors, and excludes the source", async () => {
    const user = userEvent.setup();
    setup();

    expect(screen.getByText("Transfer or Share Advisors")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Transfer/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Move all 2 advisors from/)).toBeInTheDocument();
    expect(screen.getByText(/Sarah will no longer see these advisors/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Show advisors \(2\)/ }));
    expect(screen.getByText("Acme Agency")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toContain("Ahmad Razak");
    expect(options).not.toContain("Sarah Lim");
  });

  it("keeps the confirm button disabled until a target is chosen", async () => {
    const user = userEvent.setup();
    setup();

    const confirm = screen.getByRole("button", { name: /Transfer 2 advisors/ });
    expect(confirm).toBeDisabled();

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    expect(confirm).toBeEnabled();
  });

  it("transfers, toasts the moved count, notifies the caller and closes", async () => {
    const user = userEvent.setup();
    const { transfer, onClose, onTransferred } = setup({ transfer: jest.fn().mockResolvedValue(MOVE_RESULT) });

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 advisors/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(transfer).toHaveBeenCalledWith("manager-a", { target_manager_id: "manager-b", mode: "move" });
    expect(mockShowToast).toHaveBeenCalledWith("2 advisors transferred to Ahmad Razak", "success");
    expect(onTransferred).toHaveBeenCalledWith(MOVE_RESULT);
  });

  it("switching to Share changes the copy, the confirm label, and sends mode=copy", async () => {
    const user = userEvent.setup();
    const shareResult = { ...MOVE_RESULT, mode: "copy" as const, moved_partners_count: 0, shared_partners_count: 2, shared_partner_ids: ["p1", "p2"] };
    const { transfer } = setup({ transfer: jest.fn().mockResolvedValue(shareResult) });

    await user.click(screen.getByRole("radio", { name: /Share/ }));

    expect(screen.getByText(/Share all 2 advisors of/)).toBeInTheDocument();
    expect(screen.getByText(/Sarah keeps these advisors/)).toBeInTheDocument();
    expect(screen.getByText(/not shared automatically/)).toBeInTheDocument();
    expect(screen.getByText("Share with account manager")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Share 2 advisors/ }));

    await waitFor(() =>
      expect(transfer).toHaveBeenCalledWith("manager-a", { target_manager_id: "manager-b", mode: "copy" })
    );
    expect(mockShowToast).toHaveBeenCalledWith("2 advisors shared with Ahmad Razak", "success");
  });

  it("mentions advisors the target already had when sharing", async () => {
    const user = userEvent.setup();
    const shareResult = { ...MOVE_RESULT, mode: "copy" as const, moved_partners_count: 0, shared_partners_count: 1, already_shared_count: 1 };
    setup({ transfer: jest.fn().mockResolvedValue(shareResult) });

    await user.click(screen.getByRole("radio", { name: /Share/ }));
    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Share 2 advisors/ }));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("1 advisor shared with Ahmad Razak (1 already had access)", "success")
    );
  });

  it("hides the Share option when allowShare is false", () => {
    setup({ allowShare: false });

    expect(screen.getByText("Transfer Advisors")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Transfer 2 advisors/ })).toBeInTheDocument();
  });

  it("maps a known backend code to admin-facing copy and stays open", async () => {
    const user = userEvent.setup();
    const { onClose } = setup({
      transfer: jest.fn().mockRejectedValue(apiError(409, "target_manager_inactive")),
    });

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 advisors/ }));

    expect(
      await screen.findByText("The selected account manager is inactive. Choose an active one.")
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("falls back to the backend message for unknown codes", async () => {
    const user = userEvent.setup();
    setup({ transfer: jest.fn().mockRejectedValue(apiError(500, "something_else")) });

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 advisors/ }));

    expect(await screen.findByText("backend message")).toBeInTheDocument();
  });

  it("tells the admin when there is no other active manager to choose", () => {
    setup({ managers: [SOURCE] });

    expect(
      screen.getByText("There is no other active account manager to transfer to.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Transfer 2 advisors/ })).toBeDisabled();
  });

  it("starts in All advisors mode and the move payload carries no partner_ids", async () => {
    const user = userEvent.setup();
    const { transfer } = setup({ transfer: jest.fn().mockResolvedValue(MOVE_RESULT) });

    expect(screen.getByRole("radio", { name: /All advisors/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 advisors/ }));

    await waitFor(() => expect(transfer).toHaveBeenCalledTimes(1));
    expect(transfer.mock.calls[0][1]).not.toHaveProperty("partner_ids");
  });

  it("in Selected mode, sends exactly the ticked ids and counts them in the label and toast", async () => {
    const user = userEvent.setup();
    const oneMoved = { ...MOVE_RESULT, moved_partners_count: 1, moved_partner_ids: ["p2"] };
    const { transfer, onClose } = setup({ transfer: jest.fn().mockResolvedValue(oneMoved) });

    await user.click(screen.getByRole("radio", { name: /Selected advisors/ }));
    expect(screen.getByText(/Move only the advisors you tick below/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show advisors/ })).not.toBeInTheDocument();

    const confirm = screen.getByRole("button", { name: /Transfer 0 advisors/ });
    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    expect(confirm).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "John Doe" }));
    expect(screen.getByRole("button", { name: /Transfer 1 advisor$/ })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: /Transfer 1 advisor$/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(transfer).toHaveBeenCalledWith("manager-a", {
      target_manager_id: "manager-b",
      mode: "move",
      partner_ids: ["p2"],
    });
    expect(mockShowToast).toHaveBeenCalledWith("1 advisor transferred to Ahmad Razak", "success");
  });

  it("Share in Selected mode sends mode=copy with the ticked ids", async () => {
    const user = userEvent.setup();
    const shared = { ...MOVE_RESULT, mode: "copy" as const, moved_partners_count: 0, shared_partners_count: 1, shared_partner_ids: ["p1"] };
    const { transfer } = setup({ transfer: jest.fn().mockResolvedValue(shared) });

    await user.click(screen.getByRole("radio", { name: /Share/ }));
    await user.click(screen.getByRole("radio", { name: /Selected advisors/ }));
    expect(screen.getByText(/Share only the advisors you tick below/)).toBeInTheDocument();
    expect(screen.getByText(/not shared automatically/)).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Acme Agency" }));
    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Share 1 advisor$/ }));

    await waitFor(() =>
      expect(transfer).toHaveBeenCalledWith("manager-a", { target_manager_id: "manager-b", mode: "copy", partner_ids: ["p1"] })
    );
    expect(mockShowToast).toHaveBeenCalledWith("1 advisor shared with Ahmad Razak", "success");
  });

  it("filters the list by name or email and keeps ticks across searches", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("radio", { name: /Selected advisors/ }));
    await user.click(screen.getByRole("checkbox", { name: "John Doe" }));

    const search = screen.getByRole("searchbox", { name: "Search advisors to transfer" });
    await user.type(search, "ops@acme");
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "Acme Agency" })).not.toBeChecked();

    await user.clear(search);
    await user.type(search, "JOHN");
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "John Doe" })).toBeChecked();

    await user.clear(search);
    expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Transfer 1 advisor$/ })).toBeInTheDocument();
  });

  it("marks agencies as a company and says their team members come along", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("radio", { name: /Selected advisors/ }));
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Includes the agency's team members")).toBeInTheDocument();
    expect(screen.getByText("ops@acme.com")).toBeInTheDocument();
    expect(screen.getByText("john@doe.com")).toBeInTheDocument();
  });

  it("unticks the advisors the backend rejected as no longer assigned and stays open", async () => {
    const user = userEvent.setup();
    const { onClose } = setup({
      transfer: jest.fn().mockRejectedValue(apiError(422, "partner_not_assigned_to_source", { partner_ids: ["p2"] })),
    });

    await user.click(screen.getByRole("radio", { name: /Selected advisors/ }));
    await user.click(screen.getByRole("checkbox", { name: "Acme Agency" }));
    await user.click(screen.getByRole("checkbox", { name: "John Doe" }));
    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 advisors/ }));

    expect(await screen.findByText(/changed while you were on this screen/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "John Doe" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Acme Agency" })).toBeChecked();
    expect(screen.getByRole("button", { name: /Transfer 1 advisor$/ })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("offers no scope choice from the blocked-delete flow", () => {
    setup({ allowShare: false });

    expect(screen.queryByRole("radio", { name: /Selected advisors/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show advisors \(2\)/ })).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    mockedUseAccountManagers.mockReturnValue({ accountManagers: [], loading: false, error: null });
    mockedUseTransferPartners.mockReturnValue({ transferPartners: jest.fn(), loading: false, error: null });

    render(<TransferPartnersModal isOpen={false} onClose={jest.fn()} sourceManager={SOURCE} />);

    expect(screen.queryByText("Transfer or Share Advisors")).not.toBeInTheDocument();
  });
});
