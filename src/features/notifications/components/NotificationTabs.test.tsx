import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationTabs, { type UnreadCategoryFilter } from "./NotificationTabs";
import type { ReadStatus } from "../types";

function Harness() {
  const [read, setRead] = useState<ReadStatus>("unread");
  const [category, setCategory] = useState<UnreadCategoryFilter>("action_required");
  return <NotificationTabs readStatus={read} onReadStatusChange={setRead} unreadCount={8} category={category} onCategoryChange={setCategory} categoryCounts={{ all: 8, action_required: 5, info: 3 }} showCategories>
    <p>{read === "all" ? "All messages" : `${category} messages`}</p>
  </NotificationTabs>;
}

it("separates read status from category selection and keeps each active panel associated", async () => {
  render(<Harness />);
  const user = userEvent.setup();
  const categories = screen.getByRole("tablist", { name: "Unread notification category" });
  const info = within(categories).getByRole("tab", { name: /System info/ });
  await user.click(info);
  expect(screen.getByText("info messages")).toBeInTheDocument();
  const panel = document.getElementById(info.getAttribute("aria-controls")!);
  expect(panel).toHaveAttribute("aria-labelledby", info.id);
  expect(within(panel!).getByText("info messages")).toBeInTheDocument();
  const primary = screen.getByRole("tablist", { name: "Notification read status" });
  await user.click(within(primary).getByRole("tab", { name: "All" }));
  expect(screen.queryByRole("tablist", { name: "Unread notification category" })).not.toBeInTheDocument();
  expect(screen.getByText("All messages")).toBeInTheDocument();
  await user.click(within(primary).getByRole("tab", { name: /Unread/ }));
  expect(screen.getByText("info messages")).toBeInTheDocument();
});

it("keeps panel IDs unique when notification views share a page", () => {
  render(<><Harness /><Harness /></>);
  const ids = Array.from(document.querySelectorAll('[role="tabpanel"]')).map((panel) => panel.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it("lets the mobile category picker filter the same content and synchronizes desktop selection", async () => {
  render(<Harness />);
  const user = userEvent.setup();
  const picker = screen.getByRole("combobox", { name: "Unread notification category" });
  expect(picker).toHaveValue("action_required");
  await user.selectOptions(picker, "info");
  expect(screen.getByText("info messages")).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: /System info/ })).toHaveAttribute("aria-selected", "true");
  const panel = document.getElementById(picker.getAttribute("aria-controls")!);
  expect(within(panel!).getByText("info messages")).toBeInTheDocument();
});
