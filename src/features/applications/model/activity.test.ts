import { describe as describeEntry } from "./activity";
import type { ApplicationTimelineItem } from "features/applications/shared/applicationTypes";

const item = (over: Partial<ApplicationTimelineItem>): ApplicationTimelineItem => ({
  id: "t1", application_id: "app_1", entry_type: "status_transition", actor_id: null, actor_name: "Priya Nair",
  from_stage: null, from_status: null, to_stage: null, to_status: null, reason_text: null, notes: null, detail: null,
  required_document_types: null, requested_document_types: null, uploaded_document_types: null, created_at: "2026-10-01T00:00:00Z",
  ...over,
});

it("names an upload by its document type, keeping acronyms in capitals", () => {
  expect(describeEntry(item({ entry_type: "document_upload", detail: { document_type_code: "EMGS_EVALUATION_DOCUMENT" } })).title)
    .toBe("Priya Nair uploaded EMGS Evaluation Document");
  expect(describeEntry(item({ entry_type: "document_upload", detail: { document_type_code: "X" }, uploaded_document_types: [{ id: "d1", type: "Offer Letter", code: "X" }] })).title)
    .toBe("Priya Nair uploaded Offer Letter");
});

it("formats a visa payment like the rest of the app", () => {
  expect(describeEntry(item({ entry_type: "visa_payment_created", detail: { amount: 2450, currency: "MYR" } })).title).toBe("Visa payment recorded: RM2,450");
  expect(describeEntry(item({ entry_type: "visa_payment_created", detail: { amount: "3000", currency: "usd" } })).title).toBe("Visa payment recorded: USD 3,000");
  expect(describeEntry(item({ entry_type: "visa_payment_created", detail: {} })).title).toBe("Visa payment recorded");
});
