import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TableActions, { TableAction, TableRowActionLabel } from "./TableActions";

function setup(mobile = false) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: mobile,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
  const edit = jest.fn();
  const remove = jest.fn();
  render(
    <TableRowActionLabel.Provider value="Program A">
      <TableActions>
        <TableAction label="Edit program" primary onSelect={edit} />
        <TableAction label="Delete program" danger onSelect={remove} />
        <TableAction label="Copy program" disabled onSelect={jest.fn()} />
      </TableActions>
    </TableRowActionLabel.Provider>
  );
  return { edit, remove };
}
it("shows labelled secondary actions in a desktop menu and respects disabled states", async () => {
  const user = userEvent.setup();
  const { remove } = setup();
  await user.click(
    screen.getByRole("button", { name: "More actions for Program A" })
  );
  expect(screen.getByRole("menuitem", { name: "Copy program" })).toBeDisabled();
  expect(remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("menuitem", { name: "Delete program" }));
  expect(remove).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
it("includes edit in the mobile action sheet", async () => {
  const user = userEvent.setup();
  const { edit } = setup(true);
  await user.click(
    screen.getByRole("button", { name: "More actions for Program A" })
  );
  expect(
    screen.getByRole("dialog", { name: "Program A actions" })
  ).toBeInTheDocument();
  await user.click(
    screen.getAllByRole("button", { name: "Edit program" }).slice(-1)[0]
  );
  expect(edit).toHaveBeenCalledTimes(1);
});
