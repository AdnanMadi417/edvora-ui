import { advisorActorName, unibexsVoice } from "./unibexsVoice";

describe("unibexsVoice", () => {
  it.each([
    ["Under Review by Account Manager", "Under Review by Unibexs"],
    ["Correction Requested by Account Manager", "Correction Requested by Unibexs"],
    ["Account Manager is reviewing the uploaded eVAL document.", "Unibexs is reviewing the uploaded eVAL document."],
    ["Payment receipt submitted successfully. Awaiting Account Manager verification.", "Payment receipt submitted successfully. Awaiting Unibexs verification."],
    ["Dispute submitted successfully. Awaiting Admin review.", "Dispute submitted successfully. Awaiting Unibexs review."],
    ["Review the Admin's response and confirm commission receipt.", "Review the Unibexs response and confirm commission receipt."],
    ["Unibexs Operations Team updated the visa case", "Unibexs updated the visa case"],
    ["Waiting Partner to confirm arrival date", "Waiting Advisor to confirm arrival date"],
    ["Upload the EMGS eVAL document.", "Upload the EMGS eVAL document."],
  ])("%s", (input, expected) => {
    expect(unibexsVoice(input)).toBe(expected);
  });

  it("passes empty values through", () => {
    expect(unibexsVoice(null)).toBeNull();
    expect(unibexsVoice("")).toBe("");
  });
});

describe("advisorActorName", () => {
  it("shows staff as Unibexs and keeps the Advisor's own agency", () => {
    expect(advisorActorName("Unibexs Operations Team")).toBe("Unibexs");
    expect(advisorActorName("Priya Nair", "account_manager")).toBe("Unibexs");
    expect(advisorActorName("Priya Nair", "admin")).toBe("Unibexs");
    expect(advisorActorName("EduBridge International", "partner")).toBe("EduBridge International");
    expect(advisorActorName("You")).toBe("You");
    expect(advisorActorName(null)).toBe("Unibexs");
  });
});
