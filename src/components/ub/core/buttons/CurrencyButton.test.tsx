import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrencyButton from "./CurrencyButton";

function Picker() {
  const [value, setValue] = useState<string | null>(null);
  return <CurrencyButton value={value} options={["MYR", "USD", "USD"]} onChange={setValue} />;
}

it("supports keyboard selection and restores focus to its trigger", async () => {
  const user = userEvent.setup();
  render(<Picker />);
  const trigger = screen.getByRole("button", { name: /Display currency/ });
  trigger.focus();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitemradio", { name: /MYR/ })).toHaveFocus();
  expect(screen.getAllByRole("menuitemradio")).toHaveLength(2);
  await user.keyboard("{End}{Enter}");
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveTextContent("USD");
  await user.click(trigger);
  expect(screen.getByRole("menuitemradio", { name: /USD/ })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
});

it("disables selection when only one currency is available", () => {
  render(<CurrencyButton value="MYR" options={["MYR"]} onChange={jest.fn()} />);
  expect(screen.getByRole("button")).toBeDisabled();
});
