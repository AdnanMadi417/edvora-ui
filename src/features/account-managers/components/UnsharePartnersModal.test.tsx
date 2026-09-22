import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnsharePartnersModal from "./UnsharePartnersModal";
import { useAccountManagers } from "../hooks/useAccountManagers";
import { useUnsharePartners } from "../hooks/useUnsharePartners";

const mockShowToast = jest.fn();

jest.mock("../hooks/useAccountManagers", () => ({ useAccountManagers: jest.fn() }));
jest.mock("../hooks/useUnsharePartners", () => ({ useUnsharePartners: jest.fn() }));
jest.mock("../../../components/context/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockedUseAccountManagers = useAccountManagers as jest.Mock;
const mockedUseUnsharePartners = useUnsharePartners as jest.Mock;

const SOURCE = { id: "manager-a", name: "Sarah Lim" };
const MANAGERS = [
  { id: "manager-a", name: "Sarah Lim", email: "s@x", is_active: true, assigned_partners_count: "2", assigned_partners: [] },
  { id: "manager-b", name: "Ahmad Razak", email: "a@x", is_active: true, assigned_partners_count: "1", assigned_partners: [] },
  { id: "manager-c", name: "Chen Wei", email: "c@x", is_active: false, assigned_partners_count: "0", assigned_partners: [] },
];

function setup(unshare = jest.fn()) {
  mockedUseAccountManagers.mockReturnValue({ accountManagers: MANAGERS, loading: false, error: null });
  mockedUseUnsharePartners.mockReturnValue({ unsharePartners: unshare, loading: false, error: null });
  const onClose = jest.fn();
  const onUnshared = jest.fn();
  render(<UnsharePartnersModal isOpen onClose={onClose} sourceManager={SOURCE} onUnshared={onUnshared} />);
  return { unshare, onClose, onUnshared };
}

describe("UnsharePartnersModal", () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    mockedUseAccountManagers.mockReset();
    mockedUseUnsharePartners.mockReset();
  });

  it("lists every other manager, inactive ones marked, and never the source", () => {
    setup();

    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toContain("Ahmad Razak");
    expect(options).toContain("Chen Wei (inactive)");
    expect(options).not.toContain("Sarah Lim");
    expect(screen.getByRole("button", { name: /Remove shared access/ })).toBeDisabled();
  });

  it("removes access, toasts the count, notifies and closes", async () => {
    const user = userEvent.setup();
    const result = {
      source_manager_id: "manager-a",
      target_manager_id: "manager-b",
      unshared_partners_count: 3,
      unshared_agency_members_count: 2,
      unshared_partner_ids: ["p1", "p2", "p3"],
    };
    const { unshare, onClose, onUnshared } = setup(jest.fn().mockResolvedValue(result));

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Remove shared access/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(unshare).toHaveBeenCalledWith("manager-a", { target_manager_id: "manager-b" });
    expect(mockShowToast).toHaveBeenCalledWith(
      "Shared access removed: Ahmad Razak no longer sees 3 partners of Sarah Lim",
      "success"
    );
    expect(onUnshared).toHaveBeenCalledWith(result);
  });

  it("says so when the manager had no shared access", async () => {
    const user = userEvent.setup();
    setup(
      jest.fn().mockResolvedValue({
        source_manager_id: "manager-a",
        target_manager_id: "manager-b",
        unshared_partners_count: 0,
        unshared_agency_members_count: 0,
        unshared_partner_ids: [],
      })
    );

    await user.selectOptions(screen.getByRole("combobox"), "manager-b");
    await user.click(screen.getByRole("button", { name: /Remove shared access/ }));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Ahmad Razak had no shared access to Sarah Lim's partners", "success")
    );
  });
});
