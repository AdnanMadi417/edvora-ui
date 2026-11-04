import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdditionalManagersSection from "./AdditionalManagersSection";
import { useAdditionalManagers } from "features/partners/hooks";
import type { PartnerDetails } from "features/partners/types";

const mockShowToast = jest.fn();

jest.mock("../../hooks", () => ({ useAdditionalManagers: jest.fn() }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockedUseAdditionalManagers = useAdditionalManagers as jest.Mock;

const MANAGERS = [
  { id: "m-a", name: "Sarah Lim", email: "s@x", is_active: true, assigned_partners_count: "1", assigned_partners: [] },
  { id: "m-b", name: "Ahmad Razak", email: "a@x", is_active: true, assigned_partners_count: "0", assigned_partners: [] },
  { id: "m-c", name: "Chen Wei", email: "c@x", is_active: true, assigned_partners_count: "0", assigned_partners: [] },
  { id: "m-d", name: "Dana Inactive", email: "d@x", is_active: false, assigned_partners_count: "0", assigned_partners: [] },
];

function partner(overrides: Partial<PartnerDetails> = {}): PartnerDetails {
  return {
    id: "p1",
    user_id: "u1",
    name: "Acme Agency",
    email: "acme@x",
    type: "agency",
    country: "MY",
    phone: "1",
    is_active: true,
    is_verified: true,
    assigned_manager_id: "m-a",
    assigned_manager_name: "Sarah Lim",
    additional_managers: [{ id: "m-b", name: "Ahmad Razak", email: "a@x" }],
    individual_details: null,
    company_details: null,
    created_at: null,
    updated_at: null,
    last_login: null,
    agency_role: "admin",
    agency_membership: null,
    ...overrides,
  };
}

function setup(p = partner(), hooks: Partial<ReturnType<typeof useAdditionalManagers>> = {}) {
  const addManager = jest.fn().mockResolvedValue({});
  const removeManager = jest.fn().mockResolvedValue({});
  mockedUseAdditionalManagers.mockReturnValue({ addManager, removeManager, loading: false, error: null, ...hooks });
  const onChanged = jest.fn();
  render(<AdditionalManagersSection partner={p} accountManagers={MANAGERS} onChanged={onChanged} />);
  return { addManager, removeManager, onChanged };
}

describe("AdditionalManagersSection", () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    mockedUseAdditionalManagers.mockReset();
  });

  it("shows current chips and offers only active managers that are neither primary nor already added", () => {
    setup();

    expect(screen.getByText("Ahmad Razak")).toBeInTheDocument();
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toContain("Chen Wei");
    expect(options).not.toContain("Sarah Lim"); // primary
    expect(options).not.toContain("Ahmad Razak"); // already added
    expect(options).not.toContain("Dana Inactive");
  });

  it("adds the selected manager and refetches", async () => {
    const user = userEvent.setup();
    const { addManager, onChanged } = setup();

    await user.selectOptions(screen.getByRole("combobox", { name: /Add an account manager/ }), "m-c");
    await user.click(screen.getByRole("button", { name: /Add manager/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(addManager).toHaveBeenCalledWith("p1", "m-c");
    expect(mockShowToast).toHaveBeenCalledWith("Chen Wei now shares access to Acme Agency", "success");
  });

  it("removes a manager from its chip and refetches", async () => {
    const user = userEvent.setup();
    const { removeManager, onChanged } = setup();

    await user.click(screen.getByRole("button", { name: "Remove Ahmad Razak" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(removeManager).toHaveBeenCalledWith("p1", "m-b");
  });

  it("is read-only for agency members, who inherit from their agency", () => {
    setup(partner({ agency_role: "member", type: "individual" }));

    expect(screen.getByText(/Inherited from the agency/)).toBeInTheDocument();
    expect(screen.getByText("Ahmad Razak")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remove Ahmad Razak/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add manager/ })).not.toBeInTheDocument();
  });

  it("shows an empty state when nobody shares the partner", () => {
    setup(partner({ additional_managers: [] }));

    expect(screen.getByText("No additional managers.")).toBeInTheDocument();
  });
});
