import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContextMenu from "components/ub/navigation/menus/ContextMenu";

const setup = (onSelect = jest.fn()) => {
  render(
    <>
      <ContextMenu
        label="Application actions"
        items={[
          { label: "Edit application", onSelect },
          { label: "Duplicate", onSelect },
          { label: "Message the Institution", disabled: true, onSelect },
          { type: "separator" },
          { label: "Withdraw application", tone: "danger", onSelect },
        ]}
        trigger={<button type="button">More actions</button>}
      />
      <button type="button">Outside</button>
    </>,
  );
  return { user: userEvent.setup(), trigger: screen.getByRole("button", { name: "More actions" }), onSelect };
};

describe("ContextMenu", () => {
  it("opens on click and focuses the first item", async () => {
    const { user, trigger } = setup();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Application actions" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit application" })).toHaveFocus());
  });

  it("moves with arrow keys, skips disabled items, wraps, and supports Home/End", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit application" })).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Withdraw application" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit application" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Withdraw application" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Edit application" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Withdraw application" })).toHaveFocus();
  });

  it("focuses the last item when opened with ArrowUp and supports typeahead", async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Withdraw application" })).toHaveFocus());
    await user.keyboard("d");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("closes on Esc and returns focus to the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit application" })).toHaveFocus());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("selects with Enter, ignores disabled items and closes on outside click", async () => {
    const { user, trigger, onSelect } = setup();
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit application" })).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Message the Institution" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
