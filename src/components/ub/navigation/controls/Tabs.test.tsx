import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tabs, { tabPanelProps, type TabItem, type TabsVariant } from "./Tabs";

type K = "a" | "b" | "c" | "d";
const TABS: TabItem<K>[] = [
  { key: "a", label: "Overview" },
  { key: "b", label: "Documents", count: 120 },
  { key: "c", label: "Offer", disabled: true },
  { key: "d", label: "Activity" },
];

function Harness({ variant }: { variant?: TabsVariant }) {
  const [active, setActive] = useState<K>("a");
  return (
    <>
      <Tabs<K> tabs={TABS} active={active} onChange={setActive} variant={variant} idPrefix="t" aria-label="Profile" />
      <div {...tabPanelProps("t", active)}>panel {active}</div>
    </>
  );
}

describe("Tabs", () => {
  it("roves focus with arrows, skipping disabled tabs, and wraps", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Activity/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
  });

  it("uses Up/Down when vertical", async () => {
    const user = userEvent.setup();
    render(<Harness variant="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: /Documents/ })).toHaveAttribute("aria-selected", "true");
  });

  it("caps counts and links tabs to panels", () => {
    render(<Harness variant="pills" />);
    expect(screen.getByText("99+")).toBeInTheDocument();
    const tab = screen.getByRole("tab", { name: "Overview" });
    expect(tab).toHaveAttribute("aria-controls", "t-panel-a");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tab.id);
    expect(screen.getByRole("tab", { name: "Offer" })).toBeDisabled();
  });
});
