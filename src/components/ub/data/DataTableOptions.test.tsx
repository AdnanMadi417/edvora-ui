import { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DataTable, { type DataTableColumn } from "./DataTable";
import DataTableToolbar from "./DataTableToolbar";

// TableWrapper watches its scroll container; jsdom has no ResizeObserver.
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

type Row = { id: string; name: string; amount: number; paid: boolean };
const ROWS: Row[] = [
  { id: "1", name: "Nur Aisyah", amount: 4200, paid: false },
  { id: "2", name: "Chinedu Okafor", amount: 3000, paid: true },
  { id: "3", name: "Tanvir Hossain", amount: 2500, paid: false },
  { id: "4", name: "Sara Mahmoud", amount: 1800, paid: false },
];
const COLS: DataTableColumn<Row>[] = [
  { key: "name", header: "Student", cell: (r) => r.name },
  { key: "amount", header: "Amount", cell: (r) => `RM${r.amount}`, align: "end" },
];
const label = (r: Row) => r.name;

describe("DataTable options", () => {
  it("shift-click selects a range and skips rows that can't be selected", () => {
    render(<DataTable columns={COLS} rows={ROWS} getRowId={(r) => r.id} getRowLabel={label} caption="Commissions" selectable isRowSelectable={(r) => (r.paid ? "Already paid" : true)} />);
    const paid = screen.getByRole("checkbox", { name: "Select Chinedu Okafor" });
    expect(paid).toBeDisabled();
    expect(paid).toHaveAttribute("title", "Already paid");
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Nur Aisyah" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Sara Mahmoud" }), { shiftKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("3 selected");
    expect(paid).not.toBeChecked();
  });

  it("offers Select all N results once the page is selected, and bulk actions get allMatching", () => {
    function Harness() {
      const [all, setAll] = useState(false);
      return (
        <DataTable
          columns={COLS}
          rows={ROWS}
          getRowId={(r) => r.id}
          caption="Applications"
          selectable
          totalCount={248}
          allMatchingSelected={all}
          onSelectAllMatchingChange={setAll}
          bulkActions={(_ids, _clear, ctx) => <button type="button">{ctx.allMatching ? "Export all" : "Export page"}</button>}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all 248 results" }));
    expect(screen.getByText(/results are selected/)).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Bulk actions" })).getByText("248 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export all" })).toBeInTheDocument();
  });

  it("clears the selection when the reset key changes, and on Esc", () => {
    const { rerender } = render(<DataTable columns={COLS} rows={ROWS} getRowId={(r) => r.id} getRowLabel={label} caption="A" selectable selectionResetKey="stage=1" />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Nur Aisyah" }));
    rerender(<DataTable columns={COLS} rows={ROWS} getRowId={(r) => r.id} getRowLabel={label} caption="A" selectable selectionResetKey="stage=2" />);
    expect(screen.getByRole("status")).toHaveTextContent("Selection cleared because the filters changed");
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Tanvir Hossain" }));
    fireEvent.keyDown(screen.getByRole("checkbox", { name: "Select Tanvir Hossain" }), { key: "Escape" });
    expect(screen.queryByRole("group", { name: "Bulk actions" })).not.toBeInTheDocument();
  });

  it("row links, hidden columns and card layout", () => {
    const { rerender } = render(<DataTable columns={COLS} rows={ROWS} getRowId={(r) => r.id} caption="A" getRowHref={(r) => `/applications/${r.id}`} hiddenColumns={["amount"]} />);
    expect(screen.getByRole("link", { name: "Nur Aisyah" })).toHaveAttribute("href", "/applications/1");
    expect(screen.queryByRole("columnheader", { name: "Amount" })).toBeNull();
    rerender(<DataTable columns={COLS} rows={ROWS} getRowId={(r) => r.id} caption="A" layout="cards" />);
    expect(screen.getByRole("table")).toHaveClass("block");
  });
});

describe("DataTableToolbar", () => {
  it("density is a radio group and the columns menu toggles columns", async () => {
    const user = userEvent.setup();
    const onDensity = jest.fn();
    const onColumns = jest.fn();
    render(
      <DataTableToolbar
        search={{ value: "", onChange: jest.fn(), placeholder: "Search students" }}
        density={{ value: "comfortable", onChange: onDensity }}
        columns={{ options: [{ key: "name", label: "Student", locked: true }, { key: "amount", label: "Amount" }], hidden: [], onChange: onColumns }}
        resultLabel="4 applications"
      />,
    );
    expect(screen.getByRole("searchbox", { name: "Search students" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Compact rows" }));
    expect(onDensity).toHaveBeenCalledWith("compact");
    await user.click(screen.getByRole("button", { name: /Columns/ }));
    expect(screen.getByRole("checkbox", { name: "Student" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Amount" }));
    expect(onColumns).toHaveBeenCalledWith(["amount"]);
    expect(screen.getByText("4 applications")).toBeInTheDocument();
  });
});
