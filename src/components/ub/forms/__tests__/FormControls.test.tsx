import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchableDropdown from "../selection/SearchableDropdown";
import MultiSelect from "../selection/MultiSelect";
import ToggleInput from "../choices/ToggleInput";
import InstitutionTypeField from "../choices/InstitutionTypeField";

const options = [
  { value: 1, label: "Public" },
  { value: 2, label: "Private" },
  { value: 3, label: "Unavailable" },
];
function SelectExample({ disabled = false, multiple = false, error = "" }) {
  const [data, setData] = useState<any>({ choice: multiple ? [] : "" });
  const Component = multiple ? MultiSelect : SearchableDropdown;
  return (
    <Component
      label="Institution"
      field="choice"
      options={options}
      disabledOptions={[3]}
      disabled={disabled}
      formData={data}
      errors={{ choice: error }}
      updateFormData={(field, value) => setData({ ...data, [field]: value })}
    />
  );
}

it("searchable legacy selects support keyboard selection and preserve numeric values", async () => {
  const onChange = jest.fn();
  render(
    <SearchableDropdown
      label="Institution"
      field="choice"
      options={options}
      disabledOptions={[1, 3]}
      formData={{ choice: "" }}
      errors={{}}
      updateFormData={onChange}
    />
  );
  const input = screen.getByRole("combobox", { name: "Institution" });
  input.focus();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(onChange).toHaveBeenCalledWith("choice", 2);
  expect(input).toHaveAttribute("aria-expanded", "false");
});

it("connects errors to selects and keeps disabled controls closed", async () => {
  const { rerender } = render(<SelectExample error="Choose an institution" />);
  const input = screen.getByRole("combobox", { name: "Institution" });
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Choose an institution");
  rerender(<SelectExample disabled />);
  expect(input).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Show options" }));
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

it("multi-select supports searching, multiple keyboard choices and Escape focus return", async () => {
  render(<SelectExample multiple />);
  const trigger = screen.getByRole("button", { name: "Institution" });
  await userEvent.click(trigger);
  await userEvent.keyboard("{ArrowDown}{Enter}{ArrowDown}{Enter}{ArrowDown}");
  expect(screen.getByText("2 selected")).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Unavailable" })).toHaveAttribute(
    "aria-disabled",
    "true"
  );
  await userEvent.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveTextContent("Public, Private");
});

it("form toggles share the switch, announce state and respond to Space", async () => {
  function Example() {
    const [data, setData] = useState({ enabled: false });
    return (
      <ToggleInput
        label="Language center"
        field="enabled"
        formData={data}
        errors={{}}
        updateFormData={(_field, enabled) => setData({ enabled })}
        enabledText="Available"
        disabledText="Not available"
      />
    );
  }
  render(<Example />);
  const toggle = screen.getByRole("switch", { name: "Language center" });
  expect(toggle).toHaveAttribute("aria-checked", "false");
  toggle.focus();
  await userEvent.keyboard(" ");
  expect(toggle).toHaveAttribute("aria-checked", "true");
  expect(toggle).toHaveAccessibleDescription("Available");
});

it("institution type is an explicit keyboard-accessible Public/Private choice", async () => {
  function Example() {
    const [value, setValue] = useState(false);
    return <InstitutionTypeField value={value} onChange={setValue} />;
  }
  render(<Example />);
  const privateOption = screen.getByRole("radio", { name: /Private/ });
  expect(privateOption).toHaveAttribute("aria-checked", "true");
  privateOption.focus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(screen.getByRole("radio", { name: /Public/ })).toHaveAttribute(
    "aria-checked",
    "true"
  );
});
