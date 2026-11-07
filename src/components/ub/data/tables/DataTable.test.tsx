import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import DataTable, { type DataTableColumn } from "components/ub/data/tables/DataTable";

// TableWrapper watches its scroll container; jsdom has no ResizeObserver.
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

type Row = { id: string; student: string; amount: number };
const ROWS: Row[] = [
  { id: "a", student: "Nur Aisyah Binti Kamal", amount: 4200 },
  { id: "b", student: "Chinedu Okafor", amount: 3100 },
  { id: "c", student: "Tanvir Hossain", amount: 5600 },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "student", header: "Student", cell: (r) => r.student, sortable: true },
  { key: "amount", header: "Commission", cell: (r) => `RM${r.amount.toLocaleString("en-MY")}`, align: "end", sortable: true },
];

const bodyNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((tr) => within(tr).getAllByRole("cell")[1].textContent?.replace(/^Student/, ""));

function setup(props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  return render(
    <DataTable<Row>
      caption="Applications"
      columns={COLUMNS}
      rows={ROWS}
      getRowId={(r) => r.id}
      selectable
      getRowLabel={(r) => r.student}
      bulkActions={(ids) => <button type="button">Export {ids.length}</button>}
      {...props}
    />,
  );
}

describe("DataTable selection", () => {
  it("select-all selects every row and shows the bulk bar", () => {
    setup();
    expect(screen.queryByRole("group", { name: "Bulk actions" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(screen.getByRole("status")).toHaveTextContent("3 selected");
    expect(screen.getByRole("group", { name: "Bulk actions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export 3" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(screen.queryByRole("group", { name: "Bulk actions" })).not.toBeInTheDocument();
  });

  it("header checkbox is indeterminate when some rows are selected", () => {
    setup();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Chinedu Okafor" }));
    const all = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(all).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByRole("status")).toHaveTextContent("1 selected");
    fireEvent.click(screen.getByRole("button", { name: /clear selection/i }));
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("reports selection changes in controlled mode", () => {
    const onSelectionChange = jest.fn();
    setup({ selectedIds: [], onSelectionChange });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Tanvir Hossain" }));
    expect(onSelectionChange).toHaveBeenCalledWith(["c"]);
  });
});

describe("DataTable sorting", () => {
  it("cycles asc → desc → unsorted and sets aria-sort", () => {
    setup();
    const header = screen.getByRole("columnheader", { name: /student/i });
    expect(header).toHaveAttribute("aria-sort", "none");

    fireEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(bodyNames()).toEqual(["Chinedu Okafor", "Nur Aisyah Binti Kamal", "Tanvir Hossain"]);

    fireEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(bodyNames()).toEqual(["Tanvir Hossain", "Nur Aisyah Binti Kamal", "Chinedu Okafor"]);

    fireEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(bodyNames()).toEqual(["Nur Aisyah Binti Kamal", "Chinedu Okafor", "Tanvir Hossain"]);
  });

  it("sorts numbers numerically", () => {
    setup({ defaultSort: { key: "amount", direction: "desc" } });
    expect(bodyNames()).toEqual(["Tanvir Hossain", "Nur Aisyah Binti Kamal", "Chinedu Okafor"]);
  });
});

describe("DataTable states", () => {
  it("renders empty and error states", () => {
    const onRetry = jest.fn();
    const { rerender } = setup({ rows: [], empty: { title: "No applications yet", description: "Add your first student to start tracking every step." } });
    expect(screen.getByText("No applications yet")).toBeInTheDocument();
    rerender(<DataTable<Row> caption="Applications" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} error="We couldn't load applications." onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load applications.");
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("Details row navigation", () => {
  it("opens the row link from another column and preserves modifier keys", () => {
    render(<DataTable caption="Linked rows" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} getRowHref={(r) => `/details/${r.id}`} />);
    const link = screen.getByRole("link", { name: ROWS[0].student });
    const clicked = jest.fn((event: Event) => event.preventDefault());
    link.addEventListener("click", clicked);
    fireEvent.click(screen.getByText("RM4,200"), { ctrlKey: true });
    expect(clicked).toHaveBeenCalledTimes(1);
    expect((clicked.mock.calls[0][0] as MouseEvent).ctrlKey).toBe(true);
  });

  it("keeps buttons and checkboxes independent of navigation", () => {
    const action = jest.fn();
    render(<DataTable caption="Linked rows" columns={[...COLUMNS, { key: "action", header: "Actions", cell: () => <button onClick={action}>Edit</button> }]} rows={ROWS} getRowId={(r) => r.id} getRowHref={(r) => `/details/${r.id}`} selectable />);
    const clicked = jest.fn((event: Event) => event.preventDefault());
    screen.getByRole("link", { name: ROWS[0].student }).addEventListener("click", clicked);
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(clicked).not.toHaveBeenCalled();
  });
});

describe("Mobile table layout", () => {
  it("defaults to an accessible scrolling table like Applications", () => {
    render(<DataTable caption="Staff users" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} />);
    expect(screen.getByRole("region", { name: "Staff users: scroll to see all columns and rows" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("table")).toHaveClass("min-w-[1000px]");
  });

  it("keeps stacked presentation available explicitly", () => {
    render(<DataTable caption="Staff users" mobileLayout="stacked" columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).not.toHaveClass("min-w-[1000px]");
  });
});
