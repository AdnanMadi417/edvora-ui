import React from "react";
import { render, screen, within } from "@testing-library/react";
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
  expect(
    screen.getByRole("menuitem", { name: "Delete program" })
  ).toHaveTextContent(/^Delete$/);
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
  const sheet = screen.getByRole("dialog", { name: "Program A actions" });
  expect(
    within(sheet).getByRole("button", { name: "Edit program" })
  ).toHaveTextContent(/^Edit$/);
  expect(
    within(sheet).getByRole("button", { name: "Delete program" })
  ).toHaveTextContent(/^Delete$/);
  await user.click(within(sheet).getByRole("button", { name: "Edit program" }));
  expect(edit).toHaveBeenCalledTimes(1);
});

it("omits long row names while preserving distinct operational actions", async () => {
  const user = userEvent.setup();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
  const rowName = "Asia Pacific University Language Center";
  render(
    <TableActions label={rowName}>
      <TableAction label={`View ${rowName}`} />
      <TableAction label={`Edit ${rowName}`} />
      <TableAction label={`Delete ${rowName}`} danger />
      <TableAction label="Assign payment method" />
    </TableActions>
  );
  await user.click(
    screen.getByRole("button", { name: `More actions for ${rowName}` })
  );
  expect(
    screen.getByRole("menuitem", { name: `View ${rowName}` })
  ).toHaveTextContent(/^View$/);
  expect(
    screen.getByRole("menuitem", { name: `Edit ${rowName}` })
  ).toHaveTextContent(/^Edit$/);
  expect(
    screen.getByRole("menuitem", { name: `Delete ${rowName}` })
  ).toHaveTextContent(/^Delete$/);
  expect(
    screen.getByRole("menuitem", { name: "Assign payment method" })
  ).toHaveTextContent("Assign payment method");
});
