import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequirementSelector from "./RequirementSelector";

const fields = [
  { id: "phone", label: "Student phone" },
  { id: "education", label: "Previous education" },
];
function Example({ disabled = false }) {
  const [value, setValue] = useState<Record<string, boolean>>({});
  return (
    <RequirementSelector
      fields={fields}
      value={value}
      onChange={(id, required) =>
        setValue((previous) => ({ ...previous, [id]: required }))
      }
      disabled={disabled}
    />
  );
}

it("keeps selected requirements when searching and supports keyboard toggling", async () => {
  render(<Example />);
  const phone = screen.getByRole("switch", { name: "Student phone" });
  phone.focus();
  await userEvent.keyboard(" ");
  expect(phone).toHaveAttribute("aria-checked", "true");
  const search = screen.getByRole("textbox", {
    name: /Search application fields/,
  });
  await userEvent.type(search, "education");
  expect(
    screen.queryByRole("switch", { name: "Student phone" })
  ).not.toBeInTheDocument();
  await userEvent.clear(search);
  expect(screen.getByRole("switch", { name: "Student phone" })).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await userEvent.type(search, "not a field");
  expect(screen.getByText("No matching fields")).toBeInTheDocument();
});

it("disables searching and requirement changes while saving", () => {
  render(<Example disabled />);
  expect(screen.getByRole("textbox")).toBeDisabled();
  for (const toggle of screen.getAllByRole("switch"))
    expect(toggle).toBeDisabled();
});
