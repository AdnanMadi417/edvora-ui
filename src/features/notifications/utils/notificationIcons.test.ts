import { Info } from "lucide-react";
import { getNotificationIconConfig } from "./notificationIcons";
import { WORKFLOW } from "config/workflow.generated";
import type { Notification } from "../types";

const stageChange = (to_status_code: string): Notification =>
  ({ id: "n1", type: "application_stage_changed", title: "", body: "", data: { to_status_code } }) as unknown as Notification;

describe("status-change notification icons", () => {
  it("give every backend status a specific icon, not the generic one", () => {
    const generic = WORKFLOW.flatMap((stage) => stage.statuses)
      .filter((status) => getNotificationIconConfig(stageChange(status.code)).icon === Info)
      .map((status) => status.code);
    expect(generic).toEqual([]);
  });
  it("match the meaning of the status", () => {
    expect(getNotificationIconConfig(stageChange("REJECTED_BY_UNIVERSITY")).iconColor).toContain("danger");
    expect(getNotificationIconConfig(stageChange("CORRECTION_REQUESTED")).iconColor).toContain("attention");
    expect(getNotificationIconConfig(stageChange("EVAL_APPROVED")).iconColor).toContain("success");
    expect(getNotificationIconConfig(stageChange("VISA_DOCUMENTS_UNDER_REVIEW")).iconColor).toContain("warning");
  });
});
