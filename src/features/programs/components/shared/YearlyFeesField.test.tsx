import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YearlyFeesField from "./YearlyFeesField";

function Example({ errors = {} }: { errors?: Record<string, string> }) {
  const [data, setData] = useState<any>({
    yearly_fee_currency: "MYR",
    yearly_fees: [],
  });
  return (
    <YearlyFeesField
      formData={data}
      errors={errors}
      updateFormData={(field, value) =>
        setData((previous) => ({ ...previous, [field]: value }))
      }
    />
  );
}

it("adds consecutive years, totals entered fees and allows removing every optional entry", async () => {
  render(<Example />);
  await userEvent.click(screen.getByRole("button", { name: "Add year" }));
  const first = screen.getByRole("group", { name: "Tuition entry 1" });
  expect(
    within(first).getByRole("spinbutton", { name: "Study year" })
  ).toHaveValue(1);
  await userEvent.type(
    within(first).getByRole("spinbutton", { name: /Tuition/ }),
    "1000"
  );
  await userEvent.click(screen.getByRole("button", { name: "Add year" }));
  const second = screen.getByRole("group", { name: "Tuition entry 2" });
  expect(
    within(second).getByRole("spinbutton", { name: "Study year" })
  ).toHaveValue(2);
  await userEvent.type(
    within(second).getByRole("spinbutton", { name: /Tuition/ }),
    "2000"
  );
  expect(screen.getByText("RM3,000")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Remove year 1" }));
  expect(screen.getByRole("spinbutton", { name: /Tuition/ })).toHaveValue(2000);
  await userEvent.click(screen.getByRole("button", { name: "Remove year 2" }));
  expect(screen.getByText(/No yearly fees added/)).toBeInTheDocument();
});

it("connects indexed validation messages to the correct fee entry", async () => {
  render(
    <Example errors={{ "yearly_fees[0].fee": "Fee must be greater than 0" }} />
  );
  await userEvent.click(screen.getByRole("button", { name: "Add year" }));
  const input = screen.getByRole("spinbutton", { name: /Tuition/ });
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Fee must be greater than 0");
});
