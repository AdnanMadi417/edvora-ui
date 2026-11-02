import React from "react";
import { render, screen } from "@testing-library/react";
import ApplicationCommission from "./ApplicationCommission";
import { usePartnerProfile } from "features/partners/hooks/usePartnerProfile";

jest.mock("../../../../partners/hooks/usePartnerProfile", () => ({ usePartnerProfile: jest.fn() }));
jest.mock("../popups/DisputeCommission", () => () => null);
jest.mock("../popups/ConfirmReceived", () => () => null);
jest.mock("../../../shared/DocumentActions", () => () => null);
jest.mock("../../../payouts", () => ({ PartnerPayoutSection: () => null }));
jest.mock("../../../disputes", () => ({ DisputeSection: () => null }));

const mockedUsePartnerProfile = usePartnerProfile as jest.Mock;

function renderAt(statusCode: string, agencyRole: "admin" | "member" | null) {
  mockedUsePartnerProfile.mockReturnValue({ partner: { agency_role: agencyRole } });
  render(
    <ApplicationCommission
      application={{ id: "app-1", commissions: [], commission_documents: {} }}
      actions={{ status: "Commission Paid", status_code: statusCode } as any}
    />
  );
}

describe("partner ApplicationCommission", () => {
  beforeEach(() => mockedUsePartnerProfile.mockReset());

  it.each([
    ["independent advisor", null],
    ["agency admin", "admin"],
  ] as const)("shows Confirm Received and Dispute Commission to an %s at Commission Paid", (_, role) => {
    renderAt("COMMISSION_PAID", role);
    expect(screen.getByText("Confirm received")).toBeInTheDocument();
    expect(screen.getByText("Dispute commission")).toBeInTheDocument();
  });

  it.each(["COMMISSION_PAID", "DISPUTE_RESPONSE_RECEIVED"])(
    "hides both buttons from an agency member at %s (backend refuses them)",
    (statusCode) => {
      renderAt(statusCode, "member");
      expect(screen.queryByText("Confirm received")).not.toBeInTheDocument();
      expect(screen.queryByText("Dispute commission")).not.toBeInTheDocument();
    }
  );

  it("hides both buttons before the commission is paid", () => {
    renderAt("COMMISSION_READY", null);
    expect(screen.queryByText("Confirm received")).not.toBeInTheDocument();
  });
});
