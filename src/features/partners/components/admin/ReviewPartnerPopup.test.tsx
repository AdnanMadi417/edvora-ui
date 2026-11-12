import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewPartnerPopup from "./ReviewPartnerPopup";

const reviewPartner = jest.fn().mockResolvedValue(undefined);
const assignManager = jest.fn().mockResolvedValue(undefined);
jest.mock("features/partners/hooks", () => ({
  useReviewPartner: () => ({ reviewPartner, loading: false }),
  useAssignPartnerManager: () => ({ assignManager, loading: false }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));

const flush = () => act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
const renderPopup = (currentManagerId?: string) =>
  render(<ReviewPartnerPopup isOpen onClose={jest.fn()} partnerId="ptn_002" partnerName="Global pathways education" managerOptions={[{ value: "am_001", label: "Farid Hakimi" }]} currentManagerId={currentManagerId} />);

describe("ReviewPartnerPopup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("asks for a decision first", async () => {
    const user = userEvent.setup();
    renderPopup();
    await flush();
    await user.click(screen.getByRole("button", { name: "Submit decision" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Choose approve or reject.");
    expect(reviewPartner).not.toHaveBeenCalled();
  });

  it("rejecting needs a reason, then submits it", async () => {
    const user = userEvent.setup();
    renderPopup();
    await flush();
    await user.click(screen.getByRole("radio", { name: /Reject/ }));
    await user.click(screen.getByRole("button", { name: "Reject Advisor" }));
    expect(within(await screen.findByRole("alert")).getByText(/why the registration is rejected/)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Reason for rejection/), "Documents are incomplete");
    await user.click(screen.getByRole("button", { name: "Reject Advisor" }));
    expect(reviewPartner).toHaveBeenCalledWith("ptn_002", "rejected", "Documents are incomplete");
  });

  it("approving needs an account manager", async () => {
    const user = userEvent.setup();
    renderPopup();
    await flush();
    await user.click(screen.getByRole("radio", { name: /Approve/ }));
    await user.click(screen.getByRole("button", { name: "Approve Advisor" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Assign an account manager before approving.");
    expect(reviewPartner).not.toHaveBeenCalled();
  });

  it("approves with the existing manager", async () => {
    const user = userEvent.setup();
    renderPopup("am_001");
    await flush();
    await user.click(screen.getByRole("radio", { name: /Approve/ }));
    await user.click(screen.getByRole("button", { name: "Approve Advisor" }));
    expect(assignManager).not.toHaveBeenCalled();
    expect(reviewPartner).toHaveBeenCalledWith("ptn_002", "approved", undefined);
  });
});
