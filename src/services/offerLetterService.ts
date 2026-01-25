import api from "lib/useApi";

export type OfferLetterDecision = "accept" | "reject";

interface OfferLetterDecisionPayload {
  decision: OfferLetterDecision;
  reason?: string;
  notes?: string;
}

export const submitOfferLetterDecision = async (
  applicationId: string,
  payload: OfferLetterDecisionPayload
) => {
  const res = await api.post(
    `/applications/${applicationId}/offer-letter/decision`,
    payload
  );

  return res.data;
};
