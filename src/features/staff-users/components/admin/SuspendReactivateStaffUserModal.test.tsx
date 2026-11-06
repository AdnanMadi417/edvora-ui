import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuspendReactivateStaffUserModal from "./SuspendReactivateStaffUserModal";

describe("Staff access confirmation", () => {
  it.each([true, false])("requires confirmation before changing active=%s", async (isActive) => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    render(<SuspendReactivateStaffUserModal isOpen onClose={jest.fn()} onConfirm={onConfirm} isSubmitting={false} staffUserName="Jordan Lee" isActive={isActive} />);
    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: `${isActive ? "Suspend" : "Reactivate"} Account` }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("prevents confirmation and dismissing while a request is pending", async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<SuspendReactivateStaffUserModal isOpen onClose={onClose} onConfirm={onConfirm} isSubmitting staffUserName="Jordan Lee" isActive />);
    expect(screen.getByRole("button", { name: /Suspend Account/ })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
