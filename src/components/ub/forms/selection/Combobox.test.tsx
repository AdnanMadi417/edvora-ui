import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox, type ComboboxOption } from "components/ub/forms/selection/Combobox";

const INSTITUTIONS: ComboboxOption[] = [
  { value: "sunway", label: "Sunway University", description: "Bandar Sunway, Malaysia" },
  { value: "taylors", label: "Taylor's University", description: "Subang Jaya, Malaysia" },
  { value: "ucsi", label: "UCSI University", description: "Kuala Lumpur, Malaysia", disabled: true },
  { value: "apu", label: "Asia Pacific University", description: "Kuala Lumpur, Malaysia" },
];

function Harness({ onChange = () => {} }: { onChange?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox
      label="Institution"
      options={INSTITUTIONS}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("Combobox", () => {
  it("opens with ArrowDown, moves with arrows (skipping disabled) and selects with Enter", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: /^Institution/ });

    await user.click(input);
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(4);
    // First option is active; two downs skip the disabled UCSI option.
    await user.keyboard("{ArrowDown}{ArrowDown}");
    const active = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(active!)).toHaveTextContent("Asia Pacific University");

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("apu");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Asia Pacific University");
  });

  it("filters as you type and shows an empty state that says how to fix it", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: /^Institution/ });

    await user.type(input, "subang");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("taylors");

    await user.clear(input);
    await user.type(input, "monash");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/No results for "monash". Check the spelling/)).toBeInTheDocument();
  });
});

describe("server-side combobox search", () => {
  it("forwards the query and keeps server results without applying a second local filter", async () => {
    const user = userEvent.setup();
    const changed = jest.fn();
    const selected = jest.fn();
    const props = { label: "Advisor", options: [{ value: "1", label: "Global Pathways", description: "advisor@example.com" }], value: null, onChange: selected, serverResults: true, onSearchChange: changed };
    const { rerender } = render(<Combobox {...props} searchValue="" resultsVisible={false} />);
    const input = screen.getByRole("combobox", { name: /^Advisor/ });
    await user.type(input, "x");
    expect(changed).toHaveBeenLastCalledWith("x");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    rerender(<Combobox {...props} searchValue="remote query" resultsVisible loading />);
    expect(screen.getByText("Searching...")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(selected).not.toHaveBeenCalled();
    rerender(<Combobox {...props} searchValue="remote query" resultsVisible />);
    await user.click(screen.getByRole("option", { name: /Global Pathways/ }));
    expect(selected).toHaveBeenCalledWith("1", props.options[0]);
  });
});
