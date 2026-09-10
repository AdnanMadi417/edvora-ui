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
jest.mock("../../../components/context/ToastContext", () => ({
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
    { id: "p1", name: "Acme Agency" },
    { id: "p2", name: "John Doe" },
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

function apiError(status: number, code: string, details?: unknown) {
  return new AxiosError("Request failed", String(status), undefined, undefined, {
    status,
    statusText: "",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: { code, message: "backend message", details: details ?? null },
  });
}

function setup(overrides: { transfer?: jest.Mock; managers?: unknown[] } = {}) {
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
    <TransferPartnersModal isOpen onClose={onClose} sourceManager={SOURCE} onTransferred={onTransferred} />
  );
  return { transfer, onClose, onTransferred };
}

describe("TransferPartnersModal", () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    mockedUseAccountManagers.mockReset();
    mockedUseTransferPartners.mockReset();
  });

  it("explains the move, previews the partners, and excludes the source from the target list", async () => {
    const user = userEvent.setup();
    setup();

    expect(screen.getByText("Transfer Partners")).toBeInTheDocument();
    expect(screen.getByText(/Move all 2 partners from/)).toBeInTheDocument();
    expect(screen.getByText(/Sarah will no longer see these partners/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Show partners \(2\)/ }));
    expect(screen.getByText("Acme Agency")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toContain("Ahmad Razak");
    expect(options).not.toContain("Sarah Lim");
  });

  it("keeps the confirm button disabled until a target is chosen", async () => {
    const user = userEvent.setup();
    setup();

    const confirm = screen.getByRole("button", { name: /Transfer 2 partners/ });
    expect(confirm).toBeDisabled();

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    expect(confirm).toBeEnabled();
  });

  it("transfers, toasts the moved count, notifies the caller and closes", async () => {
    const user = userEvent.setup();
    const result = {
      source_manager_id: "manager-a",
      target_manager_id: "manager-b",
      moved_partners_count: 2,
      moved_agency_members_count: 3,
      moved_partner_ids: ["p1", "p2"],
    };
    const { transfer, onClose, onTransferred } = setup({ transfer: jest.fn().mockResolvedValue(result) });

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 partners/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(transfer).toHaveBeenCalledWith("manager-a", { target_manager_id: "manager-b", mode: "move" });
    expect(mockShowToast).toHaveBeenCalledWith("2 partners transferred to Ahmad Razak", "success");
    expect(onTransferred).toHaveBeenCalledWith(result);
  });

  it("maps a known backend code to admin-facing copy and stays open", async () => {
    const user = userEvent.setup();
    const { onClose } = setup({
      transfer: jest.fn().mockRejectedValue(apiError(409, "target_manager_inactive")),
    });

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Transfer 2 partners/ }));

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
    await user.click(screen.getByRole("button", { name: /Transfer 2 partners/ }));

    expect(await screen.findByText("backend message")).toBeInTheDocument();
  });

  it("tells the admin when there is no other active manager to choose", () => {
    setup({ managers: [SOURCE] });

    expect(
      screen.getByText("There is no other active account manager to transfer to.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Transfer 2 partners/ })).toBeDisabled();
  });

  it("renders nothing when closed", () => {
    mockedUseAccountManagers.mockReturnValue({ accountManagers: [], loading: false, error: null });
    mockedUseTransferPartners.mockReturnValue({ transferPartners: jest.fn(), loading: false, error: null });

    render(<TransferPartnersModal isOpen={false} onClose={jest.fn()} sourceManager={SOURCE} />);

    expect(screen.queryByText("Transfer Partners")).not.toBeInTheDocument();
  });
});
