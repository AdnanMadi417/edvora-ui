import { render, screen } from "@testing-library/react";
import NotificationItem, { groupNotifications } from "./NotificationItem";

describe("NotificationItem", () => {
  it("shows the event, the next step and an unread hint", () => {
    render(<NotificationItem title="Offer received for Nur Aisyah Binti Kamal" nextStep="Next step: upload the signed offer letter." unread onClick={() => undefined} />);
    expect(screen.getByRole("button")).toHaveTextContent("Offer received for Nur Aisyah Binti Kamal (unread)");
    expect(screen.getByText("Next step: upload the signed offer letter.")).toBeInTheDocument();
  });
});

describe("groupNotifications", () => {
  it("buckets into Today, This week and Earlier and drops empty groups", () => {
    const now = new Date(2026, 9, 31, 12, 0);
    const items = [
      { id: 1, at: new Date(2026, 9, 31, 9, 0) },
      { id: 2, at: new Date(2026, 9, 27, 9, 0) },
      { id: 3, at: new Date(2026, 8, 1) },
    ];
    expect(groupNotifications(items, (i) => i.at, now).map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ["Today", [1]],
      ["This week", [2]],
      ["Earlier", [3]],
    ]);
    expect(groupNotifications([items[0]], (i) => i.at, now).map((g) => g.label)).toEqual(["Today"]);
  });
});
