import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MilestoneMoment, { MILESTONE_DEFAULT_ACTION } from "components/ub/brand/MilestoneMoment";

const KEY = "ub-milestone-UBX-2026-0412-placed";

function renderMoment(onClose = jest.fn()) {
  return render(<MilestoneMoment open onClose={onClose} title="Nur Aisyah is placed at Sunway University" storageKey={KEY} />);
}

describe("MilestoneMoment", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens as a labelled dialog with the default Inverse action focused", () => {
    renderMoment();
    const dialog = screen.getByRole("dialog", { name: "Nur Aisyah is placed at Sunway University" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: MILESTONE_DEFAULT_ACTION })).toHaveFocus();
  });

  it("closes on Esc and does not reopen once dismissed (storageKey)", () => {
    const onClose = jest.fn();
    const { unmount } = renderMoment(onClose);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(KEY)).toBe("dismissed");
    unmount();

    renderMoment();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("still opens when storage is unavailable", () => {
    const spy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    renderMoment();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    spy.mockRestore();
  });
});
