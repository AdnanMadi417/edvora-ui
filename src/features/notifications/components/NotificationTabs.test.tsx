import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationTabs, { type NotificationView } from "./NotificationTabs";

function Harness() {
  const [view, setView] = useState<NotificationView>("action_required");
  return (
    <NotificationTabs view={view} onViewChange={setView} counts={{ action_required: 5, info: 3 }}>
      <p>{view} messages</p>
    </NotificationTabs>
  );
}

it("shows one row of tabs and keeps the active panel associated", async () => {
  render(<Harness />);
  const user = userEvent.setup();
  const tabs = screen.getByRole("tablist", { name: "Notifications" });
  expect(within(tabs).getAllByRole("tab").map((t) => t.textContent)).toEqual([
    expect.stringContaining("Action needed"),
    expect.stringContaining("Updates"),
    "All",
  ]);
  const updates = within(tabs).getByRole("tab", { name: /Updates/ });
  await user.click(updates);
  const panel = document.getElementById(updates.getAttribute("aria-controls")!);
  expect(panel).toHaveAttribute("aria-labelledby", updates.id);
  expect(within(panel!).getByText("info messages")).toBeInTheDocument();
  await user.click(within(tabs).getByRole("tab", { name: "All" }));
  expect(screen.getByText("all messages")).toBeInTheDocument();
});

it("keeps panel IDs unique when notification views share a page", () => {
  render(<><Harness /><Harness /></>);
  const ids = Array.from(document.querySelectorAll('[role="tabpanel"]')).map((panel) => panel.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it("supports keyboard tab selection", async () => {
  render(<Harness />);
  const user = userEvent.setup();
  screen.getByRole("tab", { name: /Action needed/ }).focus();
  await user.keyboard("{ArrowRight}");
  const updates = screen.getByRole("tab", { name: /Updates/ });
  expect(updates).toHaveFocus();
  expect(updates).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText("info messages")).toBeInTheDocument();
});
