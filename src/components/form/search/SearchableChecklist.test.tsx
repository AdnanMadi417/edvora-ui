import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchableChecklist, { type SearchableChecklistItem } from "./SearchableChecklist";

const ITEMS: SearchableChecklistItem[] = [
  { id: "p1", label: "Acme Agency", sublabel: "ops@acme.com", badge: "Company", hint: "Includes team members" },
  { id: "p2", label: "John Doe", sublabel: "john@doe.com" },
  { id: "p3", label: "Jane Roe", sublabel: "jane@roe.io" },
];

/** Thin controlled host so the component is exercised the way callers use it. */
function Host({ initial = [] as string[], onChange = jest.fn() }: { initial?: string[]; onChange?: jest.Mock }) {
  const [selected, setSelected] = useState(() => new Set(initial));
  return (
    <SearchableChecklist
      items={ITEMS}
      selected={selected}
      onChange={(next) => {
        onChange(next);
        setSelected(next);
      }}
      itemNoun="advisors"
      label="advisors to transfer"
    />
  );
}

const checkbox = (name: string) => screen.getByRole("checkbox", { name });
const searchBox = () => screen.getByRole("searchbox", { name: "Search advisors to transfer" });

describe("SearchableChecklist", () => {
  it("labels every checkbox with the row label only, and shows sublabel, badge and hint", () => {
    render(<Host />);

    expect(checkbox("Acme Agency")).toBeInTheDocument();
    expect(checkbox("John Doe")).toBeInTheDocument();
    expect(screen.getByText("ops@acme.com")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Includes team members")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "advisors to transfer" })).toBeInTheDocument();
    expect(screen.getByText("0 of 3 selected")).toBeInTheDocument();
  });

  it("filters case-insensitively on label or sublabel and reports no matches", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.type(searchBox(), "ACME");
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(checkbox("Acme Agency")).toBeInTheDocument();

    await user.clear(searchBox());
    await user.type(searchBox(), "roe.io");
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(checkbox("Jane Roe")).toBeInTheDocument();

    await user.clear(searchBox());
    await user.type(searchBox(), "nobody");
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.getByText(/No advisors match/)).toBeInTheDocument();
  });

  it("toggles ticks and keeps them across search changes without firing onChange", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Host onChange={onChange} />);

    await user.click(checkbox("John Doe"));
    expect(onChange).toHaveBeenLastCalledWith(new Set(["p2"]));

    await user.type(searchBox(), "acme");
    await user.clear(searchBox());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(checkbox("John Doe")).toBeChecked();
    expect(screen.getByText("1 of 3 selected")).toBeInTheDocument();

    await user.click(checkbox("John Doe"));
    expect(onChange).toHaveBeenLastCalledWith(new Set());
  });

  it("Select all shown ticks only the visible rows; Clear unticks everything", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Host initial={["p3"]} onChange={onChange} />);

    await user.type(searchBox(), "j");
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Select all shown" }));
    expect(onChange).toHaveBeenLastCalledWith(new Set(["p3", "p2"]));
    expect(screen.getByRole("button", { name: "Select all shown" })).toBeDisabled();

    await user.clear(searchBox());
    expect(checkbox("Acme Agency")).not.toBeChecked();
    expect(screen.getByText("2 of 3 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith(new Set());
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });

  it("is keyboard operable: tab into the search box, then through the checkboxes", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.tab();
    expect(searchBox()).toHaveFocus();
    // "Select all shown" is next; "Clear" is disabled with nothing ticked and is skipped.
    await user.tab();
    await user.tab();
    expect(checkbox("Acme Agency")).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox("Acme Agency")).toBeChecked();
  });

  it("says so when there is nothing to choose from", () => {
    render(<SearchableChecklist items={[]} selected={new Set()} onChange={jest.fn()} itemNoun="advisors" />);
    expect(screen.getByText("No advisors to choose from.")).toBeInTheDocument();
  });
});
