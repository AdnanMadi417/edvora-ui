import { describe as describeEntry, toTimelineEvents } from "./activity";
import type { ApplicationTimelineItem } from "features/applications/shared/applicationTypes";

const item = (over: Partial<ApplicationTimelineItem>): ApplicationTimelineItem => ({
  id: "t1", application_id: "app_1", entry_type: "status_transition", actor_id: null, actor_name: "Priya Nair",
  from_stage: null, from_status: null, to_stage: null, to_status: null, reason_text: null, notes: null, detail: null,
  required_document_types: null, requested_document_types: null, uploaded_document_types: null, created_at: "2026-10-01T00:00:00Z",
  ...over,
});

it("names an upload by its document type, keeping acronyms in capitals", () => {
  expect(describeEntry(item({ entry_type: "document_upload", detail: { document_type_code: "EMGS_EVALUATION_DOCUMENT" } })).title)
    .toBe("Uploaded EMGS Evaluation Document");
  expect(describeEntry(item({ entry_type: "document_upload", detail: { document_type_code: "X" }, uploaded_document_types: [{ id: "d1", type: "Offer Letter", code: "X" }] })).title)
    .toBe("Uploaded Offer Letter");
});

it("formats a visa payment like the rest of the app", () => {
  expect(describeEntry(item({ entry_type: "visa_payment_created", detail: { amount: 2450, currency: "MYR" } })).title).toBe("Visa payment recorded: RM2,450");
  expect(describeEntry(item({ entry_type: "visa_payment_created", detail: { amount: "3000", currency: "usd" } })).title).toBe("Visa payment recorded: USD 3,000");
  expect(describeEntry(item({ entry_type: "visa_payment_created", detail: {} })).title).toBe("Visa payment recorded");
});

it("keeps bulk document names in readable details instead of a long headline", () => {
  const refs = [{ id: "passport", type: "Passport", code: "PASSPORT" }, { id: "transcript", type: "Academic transcript", code: "TRANSCRIPT" }];
  const event = describeEntry(item({ entry_type: "document_upload", uploaded_document_types: refs, requested_document_types: refs }));
  expect(event.title).toBe("Uploaded 2 documents");
  expect(event.details).toEqual([{ label: "Uploaded documents", text: "Passport, Academic transcript", items: ["Passport", "Academic transcript"] }]);
});

it("keeps the actor separate and preserves correction reasons and notes", () => {
  const [event] = toTimelineEvents([item({ to_status: "Correction requested", reason_text: "The passport scan is blurred.\nPlease upload a clear copy.", notes: "Keep every page visible." })]);
  expect(event.title).toBe("Status changed to Corrections requested by Unibexs");
  expect(event.actor).toBe("Priya Nair");
  expect(event.details).toContainEqual({ label: "Reason", text: "The passport scan is blurred.\nPlease upload a clear copy." });
  expect(event.details).toContainEqual({ label: "Notes", text: "Keep every page visible." });
  expect(toTimelineEvents([item({ actor_name: "Unibexs Operations Team" })], { forAdvisor: true })[0].actor).toBe("Unibexs");
});
