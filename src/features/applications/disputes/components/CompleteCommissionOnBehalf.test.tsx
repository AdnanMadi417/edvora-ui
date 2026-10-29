import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompleteCommissionOnBehalf from "./CompleteCommissionOnBehalf";
import { useCompleteCommission } from "../hooks";

const mockShowToast = jest.fn();

jest.mock("../hooks", () => ({ useCompleteCommission: jest.fn() }));
jest.mock("components/ub/feedback/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockedUseCompleteCommission = useCompleteCommission as jest.Mock;

function setup(completeOnBehalf = jest.fn().mockResolvedValue(undefined)) {
  mockedUseCompleteCommission.mockReturnValue({ completeOnBehalf, loading: false, error: null });
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  render(<CompleteCommissionOnBehalf isOpen onClose={onClose} applicationId="app-1" onSuccess={onSuccess} />);
  return { completeOnBehalf, onClose, onSuccess };
}

describe("CompleteCommissionOnBehalf", () => {
  beforeEach(() => {
    mockShowToast.mockReset();
    mockedUseCompleteCommission.mockReset();
  });

  it("cannot be submitted without a reason", () => {
    const { completeOnBehalf } = setup();
    expect(screen.getByRole("button", { name: /Mark Complete/ })).toBeDisabled();
    expect(completeOnBehalf).not.toHaveBeenCalled();
  });

  it("sends the trimmed reason, then closes and refreshes", async () => {
    const { completeOnBehalf, onClose, onSuccess } = setup();
    await userEvent.type(screen.getByRole("textbox"), "  Advisor confirmed by email  ");
    await userEvent.click(screen.getByRole("button", { name: /Mark Complete/ }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(completeOnBehalf).toHaveBeenCalledWith("app-1", { reason: "Advisor confirmed by email" });
    expect(onClose).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith("Application marked complete.", "success");
  });

  it("maps a backend error code to a readable message and stays open", async () => {
    const err = { isAxiosError: true, response: { data: { code: "invalid_status_for_confirm", message: "x" } } };
    const { onClose } = setup(jest.fn().mockRejectedValue(err));
    await userEvent.type(screen.getByRole("textbox"), "reason");
    await userEvent.click(screen.getByRole("button", { name: /Mark Complete/ }));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(expect.stringMatching(/isn't at Commission Paid/), "error")
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
