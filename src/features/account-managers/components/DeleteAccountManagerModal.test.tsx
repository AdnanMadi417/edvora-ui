import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteAccountManagerModal from "./DeleteAccountManagerModal";

describe("DeleteAccountManagerModal", () => {
  it("confirms deletion when the manager has no partners", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    render(
      <DeleteAccountManagerModal
        isOpen
        onClose={jest.fn()}
        onConfirm={onConfirm}
        isDeleting={false}
        AccountManager="Sarah Lim"
      />
    );

    expect(screen.getByText("Confirm deletion")).toBeInTheDocument();
    expect(screen.getByText("Sarah Lim")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /Delete Manager/ });
    expect(deleteButton).toBeEnabled();
    await user.click(deleteButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("blocks deletion and offers the transfer path while partners remain", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onTransferPartners = jest.fn();

    render(
      <DeleteAccountManagerModal
        isOpen
        onClose={jest.fn()}
        onConfirm={onConfirm}
        isDeleting={false}
        AccountManager="Sarah Lim"
        blockedPartnersCount={3}
        onTransferPartners={onTransferPartners}
      />
    );

    expect(
      screen.getByText(/still has 3 assigned advisors\. Transfer them before deleting\./)
    ).toBeInTheDocument();
    expect(screen.queryByText("Confirm deletion")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete Manager/ })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Transfer advisors/ }));
    expect(onTransferPartners).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("uses singular copy for exactly one partner", () => {
    render(
      <DeleteAccountManagerModal
        isOpen
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        isDeleting={false}
        blockedPartnersCount={1}
      />
    );

    expect(screen.getByText(/still has 1 assigned advisor\./)).toBeInTheDocument();
  });
});
