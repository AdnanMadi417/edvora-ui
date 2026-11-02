import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationCommission from "./ApplicationCommission";
import { useApplicationActions } from "features/applications/hooks";

jest.mock("../../../hooks", () => ({ useApplicationActions: jest.fn() }));
jest.mock("../../../shared/DocumentActions", () => () => null);
jest.mock("../../../pay-ins", () => ({ UniversityPayInSection: () => null }));
jest.mock("../../../payouts", () => ({ PartnerPayoutSection: () => null }));
jest.mock("../../../disputes", () => ({
  DisputeSection: () => null,
  CompleteCommissionOnBehalf: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>complete-on-behalf-popup</div> : null,
}));

const mockedUseApplicationActions = useApplicationActions as jest.Mock;

function renderAt(statusCode: string) {
  mockedUseApplicationActions.mockReturnValue({ actions: { status_code: statusCode }, refetch: jest.fn() });
  render(<ApplicationCommission application={{ id: "app-1", commissions: [], commission_documents: {} }} />);
}

describe("admin ApplicationCommission", () => {
  beforeEach(() => mockedUseApplicationActions.mockReset());

  it.each(["COMMISSION_PAID", "DISPUTE_RESPONSE_RECEIVED"])(
    "offers Complete on Advisor's Behalf at %s and opens the reason popup",
    async (statusCode) => {
      renderAt(statusCode);
      await userEvent.click(screen.getByText("Complete on Advisor's behalf"));
      expect(screen.getByText("complete-on-behalf-popup")).toBeInTheDocument();
    }
  );

  it.each(["COMMISSION_READY", "DISPUTE_ISSUE_RECEIVED", "APPLICATION_COMPLETE"])(
    "does not offer it at %s",
    (statusCode) => {
      renderAt(statusCode);
      expect(screen.queryByText("Complete on Advisor's behalf")).not.toBeInTheDocument();
    }
  );
});
