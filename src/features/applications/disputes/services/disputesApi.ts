import api from "lib/useApi";
import type {
  RaiseDisputePayload,
  ResolveNoIssuePayload,
  ResolveCorrectionPayload,
  CompleteCommissionPayload,
} from "../types";

export const disputesApi = {
  raise: (applicationId: string, payload: RaiseDisputePayload) =>
    api.post(`/partner/applications/${applicationId}/dispute`, payload),
  claim: (disputeId: string) => api.patch(`/admin/disputes/${disputeId}/claim`),
  resolveNoIssue: (disputeId: string, payload: ResolveNoIssuePayload) =>
    api.post(`/admin/disputes/${disputeId}/resolve-no-issue`, payload),
  resolveCorrection: (disputeId: string, payload: ResolveCorrectionPayload) =>
    api.post(`/admin/disputes/${disputeId}/resolve-correction`, payload),
  confirmReceived: (applicationId: string) =>
    api.post(`/partner/applications/${applicationId}/confirm-received`),
  completeOnBehalf: (applicationId: string, payload: CompleteCommissionPayload) =>
    api.post(`/admin/applications/${applicationId}/complete-commission`, payload),
};
