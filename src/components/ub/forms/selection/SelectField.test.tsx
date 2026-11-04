import React from "react";
import { render } from "@testing-library/react";
import SelectField from "components/ub/forms/selection/SelectField";
import SelectInput from "components/ub/forms/selection/SelectInput";
import { CURRENCY } from "../../../../constants/lists";
import { normalizeCommissionCurrency } from "../../../../features/programs/utils/commissionCurrency";

const currencyOptions = CURRENCY.map((c) => ({ value: c.value, label: c.label }));

function shown(container: HTMLElement) {
  const select = container.querySelector("select") as HTMLSelectElement;
  const option = select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;
  return { value: select.value, label: option?.text ?? "(none)", disabled: option?.disabled ?? false };
}

function renderField(stored: string) {
  return render(
    <SelectField
      label="Currency"
      field="commission_currency"
      required={false}
      options={currencyOptions}
      formData={{ commission_currency: stored }}
      errors={{}}
      updateFormData={() => {}}
    />
  );
}

describe("SelectField with the CURRENCY options (UBX-395)", () => {
  it.each([
    ["RM", "RM"],
    ["USD", "USD"],
  ])("shows %s when the stored value is the canonical %s", (stored, label) => {
    const { container } = renderField(stored);
    expect(shown(container)).toMatchObject({ value: stored, label, disabled: false });
  });

  it("shows the placeholder when nothing is stored", () => {
    const { container } = renderField("");
    expect(shown(container).label).toBe("Select...");
  });

  it("does not silently fall back to USD for an unmatched legacy value", () => {
    // Before the guard, React picked the first enabled option (USD) here.
    const { container } = renderField("rm");
    expect(shown(container)).toEqual({ value: "rm", label: "rm (not an available option)", disabled: true });
  });

  it.each(["rm", "usd", "RM", "USD", "MYR", ""])(
    "shows the right currency once the stored value %j is normalised, as the program forms do",
    (stored) => {
      const normalized = normalizeCommissionCurrency(stored);
      const { container } = renderField(normalized);
      const expected = stored.toUpperCase() === "USD" ? "USD" : "RM";
      expect(shown(container)).toMatchObject({ value: expected, label: expected, disabled: false });
    }
  );
});

describe("SelectInput guard", () => {
  it("surfaces an unmatched value instead of showing the first option", () => {
    const { container } = render(
      <SelectInput
        field="yearly_fee_currency"
        options={[
          { value: "MYR", label: "MYR" },
          { value: "USD", label: "USD" },
        ]}
        formData={{ yearly_fee_currency: "rm" }}
        updateFormData={() => {}}
      />
    );
    expect(shown(container)).toEqual({ value: "rm", label: "rm (not an available option)", disabled: true });
  });

  it("still selects a matching option normally", () => {
    const { container } = render(
      <SelectInput
        field="yearly_fee_currency"
        options={[
          { value: "MYR", label: "MYR" },
          { value: "USD", label: "USD" },
        ]}
        formData={{ yearly_fee_currency: "USD" }}
        updateFormData={() => {}}
      />
    );
    expect(shown(container)).toMatchObject({ value: "USD", label: "USD", disabled: false });
  });
});
