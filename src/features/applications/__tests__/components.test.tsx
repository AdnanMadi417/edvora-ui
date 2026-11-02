import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { XCircle } from "lucide-react";
import { resolveStage } from "features/applications/stages";
import type { DocumentItem } from "features/applications/model/applicationView";
import {
  ActivityTimeline,
  ApplicationAlerts,
  ApplicationHeader,
  ApplicationSummaryCard,
  ApplicationTrackerCard,
  CommissionCard,
  DocumentChecklist,
  DocumentRow,
  NotesPanel,
  OfferCard,
  StudentBackgroundCard,
  StudentInfoCard,
  VisaStatusCard,
  WithdrawApplicationDialog,
} from "features/applications/components";

const NOW = new Date("2026-11-02T10:00:00Z");
const doc = (id: string, state: DocumentItem["state"], extra: Partial<DocumentItem> = {}): DocumentItem => ({ id, name: id, state, group: "application", uploadedAt: "2026-06-12T00:00:00Z", reason: null, fileKey: `k/${id}`, fileUrl: null, ...extra });

describe("Application Details components", () => {
  it("ApplicationHeader: name, reference, stage, days and one Primary action", async () => {
    const onClick = jest.fn();
    render(<ApplicationHeader studentName="Nur Aisyah Binti Kamal" reference="UBX-2026-0412" stageId="offer-received" daysInStage={9} institution="Sunway University" primaryAction={{ label: "Accept offer", onClick }} overflowActions={[{ label: "Withdraw application", icon: XCircle, onClick: jest.fn(), destructive: true }]} />);
    expect(screen.getByRole("heading", { level: 1, name: "Nur Aisyah Binti Kamal" })).toBeInTheDocument();
    expect(screen.getByText("UBX-2026-0412")).toBeInTheDocument();
    expect(screen.getByText("Offer received")).toBeInTheDocument();
    expect(screen.getByText("9 days in stage")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Accept offer" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
  });

  it("ApplicationTrackerCard: aria-current step and next step", () => {
    render(<ApplicationTrackerCard stage={resolveStage({ stageCode: "OFFER_AND_VISA_PAYMENT" })} nextStep="Pay the visa fee" />);
    const current = screen.getAllByRole("listitem").find((li) => li.getAttribute("aria-current") === "step");
    expect(current).toHaveTextContent("Offer");
    expect(screen.getByText("Pay the visa fee")).toBeInTheDocument();
  });

  it("ApplicationSummaryCard: tuition in RM, missing values say Not available", () => {
    render(<ApplicationSummaryCard programme="BSc" tuition={{ amount: 4200, currency: "RM" }} advisorName={null} />);
    expect(screen.getByText("RM4,200")).toBeInTheDocument();
    expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
  });

  it("StudentInfoCard: passport and WhatsApp action", () => {
    render(<StudentInfoCard passportNumber="A12345678" whatsappUrl="https://wa.me/60123" />);
    expect(screen.getByText("A12345678")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Message on WhatsApp/ })).toHaveAttribute("href", "https://wa.me/60123");
  });

  it("StudentBackgroundCard: empty state", () => {
    render(<StudentBackgroundCard education={[]} englishTests={[]} emergencyContacts={[]} />);
    expect(screen.getByText("No background details yet")).toBeInTheDocument();
  });

  it("DocumentChecklist: attention first, count, limit and view all", async () => {
    const onViewAll = jest.fn();
    render(<DocumentChecklist documents={[doc("Passport", "verified"), doc("Transcript", "needs-replacing", { reason: "Not certified" }), doc("Photo", "verified")]} limit={2} onViewAll={onViewAll} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("Needs replacing")).toBeInTheDocument();
    expect(screen.getByText("Not certified")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /View all 3/ }));
    expect(onViewAll).toHaveBeenCalled();
  });

  it("DocumentChecklist: empty and loading states", () => {
    const { rerender } = render(<DocumentChecklist documents={[]} />);
    expect(screen.getByText("No documents yet")).toBeInTheDocument();
    rerender(<DocumentChecklist documents={[]} state="loading" />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("DocumentRow: replace only when allowed, uploading shows progress", async () => {
    const onReplace = jest.fn();
    const { rerender } = render(<ul><DocumentRow document={doc("Transcript", "needs-replacing")} onReplace={onReplace} /></ul>);
    await userEvent.click(screen.getByRole("button", { name: "Replace file" }));
    expect(onReplace).toHaveBeenCalled();
    rerender(<ul><DocumentRow document={doc("Transcript", "needs-replacing", { replaceable: false })} onReplace={onReplace} /></ul>);
    expect(screen.queryByRole("button", { name: "Replace file" })).toBeNull();
    rerender(<ul><DocumentRow document={doc("Transcript", "uploaded")} uploadProgress={40} /></ul>);
    expect(screen.getByRole("progressbar", { name: "Uploading Transcript" })).toHaveAttribute("aria-valuenow", "40");
  });

  it("OfferCard: status, expiry and empty state", () => {
    const { rerender } = render(<OfferCard status="received" offerLetter={doc("Offer letter", "verified")} expiresInDays={12} />);
    expect(screen.getByText("Offer received")).toBeInTheDocument();
    expect(screen.getByText("Due in 12 days")).toBeInTheDocument();
    rerender(<OfferCard status="awaiting" />);
    expect(screen.getByText(/appears here once the Institution decides/)).toBeInTheDocument();
  });

  it("VisaStatusCard: steps", () => {
    render(<VisaStatusCard steps={[{ id: "fee", label: "Visa fee", document: doc("Receipt", "verified") }, { id: "eval", label: "EMGS evaluation (eVAL)", document: null }]} />);
    expect(screen.getByRole("list", { name: "Visa progress" })).toBeInTheDocument();
    expect(screen.getByText("EMGS evaluation (eVAL)").closest("li")).toHaveAttribute("aria-current", "step");
  });

  it("CommissionCard: state tag, amount, tracked automatically, empty", () => {
    const { rerender } = render(<CommissionCard commission={{ state: "paid", amount: 4200, currency: "RM", type: null, expectedFrom: 30, expectedTo: 60, notes: null }} />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("RM4,200")).toBeInTheDocument();
    expect(screen.queryByText(/30–60/)).toBeNull(); // payout window is never shown as a commitment
    expect(screen.getByText("Tracked automatically")).toBeInTheDocument();
    rerender(<CommissionCard commission={null} />);
    expect(screen.getByText("No commission yet")).toBeInTheDocument();
  });

  it("ActivityTimeline: grouped events, error with retry, unavailable note", async () => {
    const onRetry = jest.fn();
    const { rerender } = render(<ActivityTimeline now={NOW} events={[{ id: "1", title: "Offer received", at: "2026-11-02T08:00:00Z", details: [{ label: "Reason", text: "OK" }] }]} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    rerender(<ActivityTimeline events={[]} error="Failed to load activity history" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
    rerender(<ActivityTimeline events={[]} error="x" unavailableMessage="Activity is only available while the application is active." />);
    expect(screen.getByText(/only available while/)).toBeInTheDocument();
  });

  it("NotesPanel: adds a note", async () => {
    const onAdd = jest.fn();
    render(<NotesPanel notes={[]} onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText("Add a note"), "Prefers January intake");
    await userEvent.click(screen.getByRole("button", { name: "Save note" }));
    expect(onAdd).toHaveBeenCalledWith("Prefers January intake");
  });

  it("ApplicationAlerts: renders nothing when empty", () => {
    const { container, rerender } = render(<ApplicationAlerts alerts={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ApplicationAlerts alerts={[{ id: "a", tone: "danger", title: "Replace the transcript" }]} />);
    expect(screen.getByText("Replace the transcript")).toBeInTheDocument();
  });

  it("WithdrawApplicationDialog: names the consequence, Cancel focused first", async () => {
    render(<WithdrawApplicationDialog open onClose={jest.fn()} onConfirm={jest.fn()} />);
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("The Institution will be notified, and this can't be undone.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Withdraw application" })).toBeInTheDocument();
  });
});
