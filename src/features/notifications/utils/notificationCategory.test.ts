import { getNotificationCategory } from "./notificationCategory";
import type { Notification } from "../types";

const stageChange = (to_status_name: string, to_status_code = "x"): Notification =>
  ({ id: "n1", type: "application_stage_changed", title: "", body: "", data: { to_status_name, to_status_code } }) as unknown as Notification;

describe("getNotificationCategory for Advisors", () => {
  it("flags status changes that are the Advisor's move", () => {
    for (const name of ["Correction Requested by Account Manager", "Institution Requested Corrections", "Waiting Advisor to confirm arrival date", "Waiting for Payment"]) {
      expect(getNotificationCategory(stageChange(name), { forAdvisor: true })).toBe("action_required");
    }
  });
  it("treats staff-side and finished statuses as information", () => {
    for (const name of ["New Application", "Under Review by Account Manager", "Payment Submitted", "Application Complete"]) {
      expect(getNotificationCategory(stageChange(name), { forAdvisor: true })).toBe("info");
    }
  });
  it("keeps messages as actions", () => {
    expect(getNotificationCategory({ type: "application_message_received" } as Notification, { forAdvisor: true })).toBe("action_required");
  });
});

describe("getNotificationCategory for staff", () => {
  it("flags status changes that are staff's move, from the backend workflow", () => {
    for (const code of ["NEW", "PAYMENT_SUBMITTED", "EVAL_UNDER_REVIEW", "COMMISSION_READY"]) {
      expect(getNotificationCategory(stageChange("", code))).toBe("action_required");
    }
  });
  it("treats the Advisor's move and finished applications as information", () => {
    for (const code of ["CORRECTION_REQUESTED", "WAITING_FOR_PAYMENT", "APPLICATION_COMPLETE"]) {
      expect(getNotificationCategory(stageChange("", code))).toBe("info");
    }
  });
});
