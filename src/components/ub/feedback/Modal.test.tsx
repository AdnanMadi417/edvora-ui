import React, { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal, { ConfirmDialog } from "components/ub/feedback/Modal";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Add note
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add note"
        description="Only your team can see notes."
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save note</button>
          </>
        }
      >
        <input aria-label="Note" />
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("labels the dialog and moves focus into it", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Add note" }));

    const dialog = await screen.findByRole("dialog", { name: "Add note" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Only your team can see notes.");
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  });

  it("closes on Esc and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Add note" });
    await user.click(opener);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it("traps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Add note" }));
    const dialog = await screen.findByRole("dialog");

    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("locks background scroll while open", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Add note" }));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.body.style.overflow).toBe(""));
  });
});

describe("ConfirmDialog", () => {
  it("puts the confirm action last, focuses Cancel, and confirms", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        tone="danger"
        title="Withdraw this application?"
        consequence="The Institution will be notified, and this can't be undone."
        confirmLabel="Withdraw application"
      />,
    );
    const dialog = await screen.findByRole("alertdialog", { name: "Withdraw this application?" });
    const buttons = Array.from(dialog.querySelectorAll("button")).map((b) => b.textContent);
    expect(buttons).toEqual(["Cancel", "Withdraw application"]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Withdraw application" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
