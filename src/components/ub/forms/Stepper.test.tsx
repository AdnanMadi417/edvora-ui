import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Stepper, clampStep } from "components/ub/forms/Stepper";

function Harness({ initial = 4200, onChange }: { initial?: number; onChange: (v: number) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <Stepper
      label="Tuition deposit"
      prefix="RM"
      value={value}
      min={0}
      max={5000}
      step={100}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("Stepper", () => {
  it("clamps and snaps values", () => {
    expect(clampStep(7200, 0, 5000, 100)).toBe(5000);
    expect(clampStep(-50, 0, 5000, 100)).toBe(0);
    expect(clampStep(4249, 0, 5000, 100)).toBe(4200);
    expect(clampStep(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
  });

  it("steps with the keyboard and buttons, never past min or max", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: /^Tuition deposit/ });
    expect(input).toHaveValue("4,200");

    fireEvent.keyDown(input, { key: "PageUp" });
    expect(onChange).toHaveBeenLastCalledWith(5000);
    expect(input).toHaveAttribute("aria-valuenow", "5000");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledTimes(1); // already at max

    fireEvent.keyDown(input, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it("clamps typed values on blur", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: /^Tuition deposit/ });
    fireEvent.change(input, { target: { value: "9,999" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(5000);
    expect(input).toHaveValue("5,000");
  });
});
