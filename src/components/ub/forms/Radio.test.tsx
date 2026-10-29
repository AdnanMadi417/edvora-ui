import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "components/ub/forms/Radio";

const OPTIONS = [
  { value: "sep", label: "September 2026" },
  { value: "jan", label: "January 2027", disabled: true },
  { value: "may", label: "May 2027" },
];

function Harness({ onChange }: { onChange: (v: string) => void }) {
  const [value, setValue] = useState<string | null>("sep");
  return (
    <RadioGroup
      legend="Intake"
      required
      options={OPTIONS}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("RadioGroup", () => {
  it("is one tab stop and moves selection with arrow keys, skipping disabled options", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Intake" })).toBeInTheDocument();
    const [sep, jan, may] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(sep).toHaveAttribute("tabindex", "0");
    expect(jan).toHaveAttribute("tabindex", "-1");
    expect(may).toHaveAttribute("tabindex", "-1");

    sep.focus();
    fireEvent.keyDown(sep, { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("may");
    expect(may).toHaveFocus();
    expect(may).toBeChecked();
    expect(may).toHaveAttribute("tabindex", "0");

    // Wraps around from the last option to the first.
    fireEvent.keyDown(may, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("sep");
    expect(sep).toHaveFocus();

    fireEvent.keyDown(sep, { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith("may");
    fireEvent.keyDown(may, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith("sep");
  });
});
