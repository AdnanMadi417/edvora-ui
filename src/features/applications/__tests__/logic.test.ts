import { getDaysLevel, getDaysLabel } from "components/ub/data/badges/DaysTag";
import { formatEventTime, groupTimeline, timelineGroupOf } from "components/ub/data/display/Timeline";
import { getApiStageTagId, getStage } from "config/applicationStages";
import { resolveStage, API_STAGE_MAP, isAdvisorAction, stageCodeOf, statusCodeOf } from "features/applications/stages";
import { commissionStateOf, documentName, documentStateOf, toApplicationView } from "features/applications/model/applicationView";
import { toTimelineEvents } from "features/applications/model/activity";
import { trackerStepsFor } from "features/applications/components/ApplicationTrackerCard";
import { visaSteps } from "features/applications/components/VisaStatusCard";
import { offerStatusOf } from "features/applications/components/OfferCard";
import { buildApplicationAlerts } from "features/applications/components/ApplicationAlerts";
import { sortDocuments } from "features/applications/components/DocumentChecklist";
import { partnerNextAction, type PartnerActionInput } from "features/applications/partner/components/details/partnerNextAction";

describe("DaysTag thresholds", () => {
  it.each([
    [0, "grey"], [3, "grey"], [4, "amber"], [7, "amber"], [8, "orange"], [14, "orange"], [15, "red"],
  ])("in stage: %i days → %s", (days, level) => expect(getDaysLevel("inStage", days)).toBe(level));
  it.each([
    [20, "grey"], [15, "grey"], [14, "amber"], [8, "amber"], [7, "orange"], [1, "orange"], [0, "red"], [-2, "red"],
  ])("deadline: %i days left → %s", (days, level) => expect(getDaysLevel("deadline", days)).toBe(level));
  it("labels", () => {
    expect(getDaysLabel("deadline", 0)).toBe("Due today");
    expect(getDaysLabel("deadline", -2)).toMatch(/Overdue/);
  });
});

describe("stage → tag and hue", () => {
  it("maps every backend stage code to a configured stage", () => {
    Object.values(API_STAGE_MAP).forEach((m) => expect(getStage(m.stageId)).toBeDefined());
  });
  it("uses the status override and flags attention", () => {
    const r = resolveStage({ stageCode: "OFFER_LETTER", statusCode: "SENT_TO_UNIVERSITY" });
    expect(r?.stage?.id).toBe("institution-review");
    expect(r?.stage?.hue).toBe("sky");
    expect(resolveStage({ stageCode: "OFFER_LETTER", statusCode: "WAITING_FOR_PAYMENT" })?.stage?.id).toBe("offer-received");
    expect(resolveStage({ stageCode: "APPLICATION_REVIEW", statusCode: "CORRECTION_REQUESTED" })?.attention).toBe(true);
  });
  it("a closed lifecycle wins", () => {
    expect(resolveStage({ stageCode: "VISA_PROCESSING", statusCode: "EVAL_APPROVED", lifecycle: "cancel" })?.stage?.id).toBe("withdrawn");
  });
  it("unknown codes resolve to null so the backend name is shown", () => {
    expect(resolveStage({ stageCode: "SOMETHING_NEW" })).toBeNull();
  });
  it("tracker steps follow the stage", () => {
    // The backend's Offer Letter stage holds both Submitted and Offer; the status decides.
    const steps = trackerStepsFor(resolveStage({ stageCode: "OFFER_LETTER", statusCode: "SENT_TO_UNIVERSITY" }));
    expect(steps.map((s) => s.state)).toEqual(["complete", "complete", "current", "upcoming", "upcoming", "upcoming", "upcoming"]);
    // Arrival and Commission are steps of their own, not "all done".
    const at = (stageCode: string, statusCode?: string) =>
      trackerStepsFor(resolveStage({ stageCode, statusCode })).find((s) => s.state === "current")?.id;
    expect(at("OFFER_LETTER", "WAITING_FOR_PAYMENT")).toBe("offer");
    expect(at("STUDENT_ARRIVAL_ENROLLMENT")).toBe("arrival");
    expect(at("PARTNER_COMMISSION_INVOICING")).toBe("commission");
    // Paid, but the Advisor still confirms receipt; only Application Complete finishes the tracker.
    expect(at("PARTNER_COMMISSION_INVOICING", "COMMISSION_PAID")).toBe("commission");
    expect(trackerStepsFor(resolveStage({ stageCode: "PARTNER_COMMISSION_INVOICING", statusCode: "APPLICATION_COMPLETE" })).every((s) => s.state === "complete")).toBe(true);
    expect(trackerStepsFor(resolveStage({ stageCode: "APPLICATION_REVIEW", statusCode: "CORRECTION_REQUESTED" }))[1].state).toBe("attention");
  });
});

describe("document status", () => {
  it.each([
    ["1", "uploaded"], ["pending", "uploaded"], ["2", "verified"], ["approved", "verified"], ["3", "needs-replacing"], ["rejected", "needs-replacing"], [undefined, "uploaded"],
  ])("%s → %s", (status, state) => expect(documentStateOf(status).state).toBe(state));
  it("humanizes raw document codes", () => {
    expect(documentName("commission_invoice")).toBe("Commission invoice");
    expect(documentName("Passport")).toBe("Passport");
    expect(documentName(null)).toBe("Document");
  });
  it("in-review label for pending", () => expect(documentStateOf("1").stateLabel).toBe("In review"));
  it("sorts needing attention first", () => {
    const docs = [
      { id: "a", state: "verified" }, { id: "b", state: "needs-replacing" }, { id: "c", state: "uploaded" },
    ].map((d) => ({ ...d, name: d.id, group: "application", uploadedAt: null, reason: null, fileKey: null, fileUrl: null })) as any;
    expect(sortDocuments(docs).map((d) => d.id)).toEqual(["b", "c", "a"]);
  });
});

describe("commission, offer and visa", () => {
  it("commission states", () => {
    expect(commissionStateOf("pending")).toBe("expected");
    expect(commissionStateOf("approved")).toBe("invoiced");
    expect(commissionStateOf("released")).toBe("invoiced");
    expect(commissionStateOf("paid")).toBe("paid");
    expect(commissionStateOf("paid", true)).toBe("disputed");
  });
  it("offer status", () => {
    expect(offerStatusOf("REJECTED_BY_UNIVERSITY", false)).toBe("declined");
    expect(offerStatusOf("WAITING_FOR_PAYMENT", true)).toBe("received");
    expect(offerStatusOf("SENT_TO_UNIVERSITY", false)).toBe("awaiting");
  });
  it("visa steps", () => {
    const d = (state: any) => ({ id: state, name: state, state, group: "visa", uploadedAt: null, reason: null, fileKey: null, fileUrl: null }) as any;
    expect(visaSteps([{ id: "a", label: "A", document: d("verified") }, { id: "b", label: "B", document: null }, { id: "c", label: "C", document: null }]).map((s) => s.state)).toEqual(["complete", "current", "upcoming"]);
    expect(visaSteps([{ id: "a", label: "A", document: d("needs-replacing") }])[0].state).toBe("attention");
    // No offer yet: nothing is current.
    expect(visaSteps([{ id: "a", label: "A", document: null }, { id: "b", label: "B", document: null }], false).map((s) => s.state)).toEqual(["upcoming", "upcoming"]);
  });
});

describe("timeline", () => {
  const now = new Date("2026-11-02T10:00:00");
  it("groups by recency", () => {
    expect(timelineGroupOf("2026-11-02T08:00:00", now)).toBe("today");
    expect(timelineGroupOf("2026-10-30T08:00:00", now)).toBe("week");
    expect(timelineGroupOf("2026-10-01T08:00:00", now)).toBe("earlier");
    expect(groupTimeline([{ at: "2026-10-01T08:00:00" }, { at: "2026-11-02T09:00:00" }], now).map((g) => g.key)).toEqual(["today", "earlier"]);
  });
  it("relative under 7 days, then a date", () => {
    expect(formatEventTime("2026-11-02T08:00:00", now)).toBe("2 hours ago");
    expect(formatEventTime("2026-06-12T08:00:00", now)).toBe("12 Jun 2026");
  });
  it("describes API items", () => {
    const [e] = toTimelineEvents([
      { id: "1", application_id: "a", entry_type: "status_transition", actor_name: "Farid", from_status: "New", to_status: "Submitted", reason_text: "OK", created_at: "2026-11-01T00:00:00Z" } as any,
    ]);
    expect(e.title).toBe("Farid moved from New to Submitted");
    expect(e.details).toContainEqual({ label: "Reason", text: "OK" });
  });
});

describe("toApplicationView", () => {
  const detail: any = {
    id: "app_001",
    lifecycle_status: "active",
    status_code: "CORRECTION_REQUESTED",
    intake_date: "2027-01-01",
    created_at: "2026-06-14",
    updated_at: "2026-11-01",
    partner: { id: "p", name: "Farid Hakimi" },
    program: { name: "BSc", tuition_fee: 31000, currency: "myr", university: { name: "Sunway University" } },
    student: { name: "Nur Aisyah Binti Kamal", passport_number: "A123", gender: false },
    stage: { code: "APPLICATION_REVIEW", name: "Application Submission", statuses: [{ code: "CORRECTION_REQUESTED", name: "Correction Requested", next_actions: [{ actor: "2", name: "Upload the requested documents" }, { actor: "3", name: "Wait" }] }] },
    documents: [{ id: "d1", document_type: "Academic Transcript", status: "3", approve_notes: "Not certified", file_key: "k" }],
    commissions: [{ id: "c", status: "pending", amount: 4200, currency: "rm", commission_type: null, notes: null, expected_commission_from: 30, expected_commission_to: 60, created_at: "" }],
    offer_letter_document: null,
    dispute: null,
  };
  const view = toApplicationView(detail, "2");
  it("maps people, money and stage", () => {
    expect(view.student.gender).toBe("Female");
    expect(view.tuition).toEqual({ amount: 31000, currency: "MYR" });
    expect(view.advisorName).toBe("Farid Hakimi");
    expect(view.nextStep).toBe("Upload the requested documents");
    expect(view.stage.resolved?.attention).toBe(true);
    expect(view.reference).toBeNull();
    expect(view.commission?.state).toBe("expected");
  });
  it("uses the viewer's next action", () => expect(toApplicationView(detail, "3").nextStep).toBe("Wait"));
  it("raises a correction alert, not a duplicate replace alert", () => {
    const alerts = buildApplicationAlerts(view, "Upload a certified copy");
    expect(alerts.map((a) => a.id)).toEqual(["action-needed"]);
    expect(buildApplicationAlerts(view, null).map((a) => a.id)).toEqual(["replace-documents"]);
  });
});

describe("partner next action", () => {
  const base: PartnerActionInput = { statusCode: null, readOnly: false, hasActions: true, hasRequiredDocs: false, hasDocumentTypes: false, hasOfferLetter: false, isRejectedForm: false };
  it.each<[Partial<PartnerActionInput>, string | null]>([
    [{ statusCode: "WAITING_FOR_PAYMENT" }, "visa-payment"],
    [{ statusCode: "CORRECTION_REQUESTED", hasRequiredDocs: true }, "required-docs"],
    [{ statusCode: "ARRIVAL_EXTRA_DOCS_UPLOAD", hasRequiredDocs: true }, "arrival-form"],
    [{ statusCode: "PROGRAM_CHANGE_SUGGESTED" }, "program-decision"],
    [{ statusCode: "APPLICATION_FORM_REJECTED", isRejectedForm: true }, "reupload-form"],
    [{ statusCode: "EVAL_PARTNER_UPLOAD" }, "emgs"],
    [{ statusCode: "AWAITING_ARRIVAL" }, "payment-proof"],
    [{ statusCode: "SENT_TO_UNIVERSITY" }, null],
    [{ statusCode: "WAITING_FOR_PAYMENT", readOnly: true }, null],
  ])("%o → %s", (input, key) => expect(partnerNextAction({ ...base, ...input })).toBe(key));
});

describe("isAdvisorAction", () => {
  it("follows the backend's allowed_actor, by name or code", () => {
    expect(isAdvisorAction("Correction Requested by Account Manager")).toBe(true);
    expect(isAdvisorAction("CORRECTION_REQUESTED")).toBe(true);
    expect(isAdvisorAction("Waiting Partner to confirm arrival date")).toBe(true);
    expect(isAdvisorAction("E-visa re-upload required")).toBe(true);
    // The UI's wording of a backend name matches too.
    expect(isAdvisorAction("Institution Requested Corrections")).toBe(true);
    expect(isAdvisorAction("Waiting Advisor to confirm arrival date")).toBe(true);
    // Statuses the old hand-written list missed.
    expect(isAdvisorAction("Signed Offer Letter Rejected")).toBe(true);
    expect(isAdvisorAction("Awaiting Arrival")).toBe(true);
    expect(isAdvisorAction("Commission Paid")).toBe(true);
    expect(isAdvisorAction("DISPUTE_RESPONSE_RECEIVED")).toBe(true);
  });
  it("leaves staff-side and finished statuses alone", () => {
    expect(isAdvisorAction("Eval under review")).toBe(false);
    expect(isAdvisorAction("Sent to University")).toBe(false);
    expect(isAdvisorAction("Application Complete")).toBe(false);
    // The account manager's turn in the backend, though the old list flagged them.
    expect(isAdvisorAction("Commission Ready")).toBe(false);
    expect(isAdvisorAction("Extra arrival documents required")).toBe(false);
    expect(isAdvisorAction("")).toBe(false);
    expect(isAdvisorAction(null)).toBe(false);
  });
});

describe("codes from names (the detail response sends names only)", () => {
  it("finds stage and status codes from the backend's names", () => {
    expect(stageCodeOf({ name: "Student Arrival & Enrollment" })).toBe("STUDENT_ARRIVAL_ENROLLMENT");
    expect(stageCodeOf({ name: "Offer Letter" })).toBe("OFFER_LETTER");
    expect(stageCodeOf({ code: "VISA_PROCESSING", name: "anything" })).toBe("VISA_PROCESSING");
    expect(statusCodeOf({ name: "Waiting for Payment" })).toBe("WAITING_FOR_PAYMENT");
    expect(statusCodeOf({ name: "Correction Requested by Account Manager" })).toBe("CORRECTION_REQUESTED");
    expect(statusCodeOf({ name: "Not a real status" })).toBeUndefined();
  });
  it("places the tracker from names alone", () => {
    const resolved = resolveStage({
      stageCode: stageCodeOf({ name: "Offer Letter" }),
      statusCode: statusCodeOf({ name: "Waiting for Payment" }),
    });
    expect(resolved?.stepId).toBe("offer");
    expect(getApiStageTagId({ id: "x", name: "Student Arrival & Enrollment" })).toBe("arrival-logistics");
  });
});
