import { WORKFLOW } from "./workflow.generated";
import { STAGE_LABELS, STATUS_LABELS, stageLabel, statusLabel } from "./statusLabels";

it("has a label for every backend stage and status", () => {
  for (const stage of WORKFLOW) {
    expect(STAGE_LABELS[stage.code]).toBeTruthy();
    for (const status of stage.statuses) expect(STATUS_LABELS[status.code]).toBeTruthy();
  }
});

it("resolves backend codes and names to one label", () => {
  expect(statusLabel("UNDER_REVIEW")).toBe("Under review by Unibexs");
  expect(statusLabel("Under Review by Account Manager")).toBe("Under review by Unibexs");
  expect(statusLabel("Waiting Partner to confirm arrival date")).toBe("Arrival date to confirm");
  expect(stageLabel("Student Arrival & Enrollment")).toBe("Arrival and enrollment");
  expect(stageLabel("PARTNER_COMMISSION_INVOICING")).toBe("Commission");
});

it("leaves unknown text unchanged", () => {
  expect(statusLabel("Something new")).toBe("Something new");
  expect(stageLabel(null)).toBe("");
});

it("labels follow the copy rules: no staff roles, no Partner, sentence case", () => {
  for (const label of [...Object.values(STATUS_LABELS), ...Object.values(STAGE_LABELS)]) {
    expect(label).not.toMatch(/account manager|\badmin\b|partner|operations team/i);
    expect(label).not.toMatch(/institution|programme|enrolment/i);
    // Sentence case: only the first word, names (Unibexs, EMGS, eVAL) and e-Visa may start upper case.
    const rest = label.split(/\s+/).slice(1).filter((w) => !/^(Unibexs|EMGS|eVAL|e-Visa|2)$/.test(w.replace(/[,]/g, "")));
    for (const word of rest) expect(word[0]).toBe(word[0].toLowerCase());
  }
});

it("swaps backend names inside sentences", () => {
  const { relabelText } = jest.requireActual("./statusLabels");
  expect(relabelText("Aisha moved the application to Correction Requested by Account Manager")).toBe(
    "Aisha moved the application to Corrections requested by Unibexs",
  );
  expect(relabelText("Now in Student Arrival & Enrollment: Awaiting Arrival")).toBe("Now in Arrival and enrollment: Student travelling");
  expect(relabelText("Upload the passport.")).toBe("Upload the passport.");
});
