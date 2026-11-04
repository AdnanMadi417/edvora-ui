import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Check } from "lucide-react";
import RadioCardGroup from "./RadioCardGroup";

it("skips disabled statuses with arrow keys and preserves their explanations", async () => {
  const changed = jest.fn();
  function Harness() {
    const [value, setValue] = useState("");
    return <RadioCardGroup ariaLabel="New status" layout="vertical" value={value} onChange={(next) => { setValue(next); changed(next); }} options={[
      { value: "current", label: "Current", hint: "Unavailable", disabled: true, icon: Check },
      { value: "review", label: "Review", hint: "Next: review documents", description: "Keep the original description", icon: Check },
      { value: "previous", label: "Previous", hint: "Unavailable", disabled: true, icon: Check },
      { value: "approved", label: "Approved", hint: "Next: offer", icon: Check },
    ]} />;
  }
  render(<Harness />);
  const user = userEvent.setup();
  await user.tab();
  expect(screen.getByRole("radio", { name: /Review/ })).toHaveFocus();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("radio", { name: /Approved/ })).toHaveFocus();
  expect(changed).toHaveBeenLastCalledWith("approved");
  await user.keyboard("{Home}");
  expect(screen.getByRole("radio", { name: /Review/ })).toHaveFocus();
  expect(screen.getByRole("radio", { name: /Current/ })).toBeDisabled();
  expect(screen.getByText("Keep the original description")).toBeInTheDocument();
});
