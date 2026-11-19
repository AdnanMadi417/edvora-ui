import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KnowledgeHubTable from "./KnowledgeHubTable";
import { sampleProgram } from "components/showcase/fixtures/program";

jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

it("preserves off-page selection and keeps business amounts and management actions", async () => {
  const select = jest.fn();
  const user = userEvent.setup();
  render(
    <KnowledgeHubTable
      programs={[{ ...sampleProgram, commission_amount: 4200 }]}
      loading={false}
      isFetching={false}
      error={null}
      refetch={jest.fn()}
      currentPage={1}
      onPageChange={jest.fn()}
      itemsPerPage={20}
      total={50}
      selectedPrograms={{ "off-page": true }}
      selectedCount={1}
      isSelectingAll={false}
      onSelectAll={jest.fn()}
      onSelectProgram={select}
      onRowClick={jest.fn()}
      editHref={(id) => `/admin/knowledge-hub/${id}/edit`}
      onDeleteClick={jest.fn()}
    />
  );
  expect(screen.getByText("MYR 4,200")).toBeInTheDocument();
  await user.click(
    screen.getByRole("checkbox", { name: `Select ${sampleProgram.name}` })
  );
  expect(select).toHaveBeenCalledTimes(1);
  expect(select).toHaveBeenCalledWith(sampleProgram.id);
  // Several actions: they share one menu.
  await user.click(screen.getAllByRole("button", { name: /^More actions for/ })[0]);
  expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
});

it.each([
  ["/admin", false, "active", "Visible"],
  ["/data-entry", true, "inactive", "Hidden"],
] as const)(
  "shows the card's fields only, with visibility on the logo, for %s",
  (basePath, isHidden, tone, label) => {
    render(
      <KnowledgeHubTable
        basePath={basePath}
        programs={[{ ...sampleProgram, is_hidden: isHidden }]}
        loading={false}
        isFetching={false}
        error={null}
        refetch={jest.fn()}
        currentPage={1}
        onPageChange={jest.fn()}
        itemsPerPage={20}
        total={1}
        selectedPrograms={{}}
        onSelectProgram={jest.fn()}
        selectedCount={0}
        isSelectingAll={false}
        onSelectAll={jest.fn()}
        onRowClick={jest.fn()}
        editHref={(id) => `${basePath}/knowledge-hub/${id}/edit`}
      />
    );
    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent?.trim())
    ).toEqual(expect.arrayContaining(["Program", "Level", "Tuition / commission", "English", "Intakes", "Actions"]));
    expect(screen.queryByRole("columnheader", { name: /Requirements|Quick links|Status/ })).toBeNull();
    const row = screen.getByRole("link", {
      name: new RegExp(
        `^${label} ${sampleProgram.name.replace(/[()]/g, "\\$&")}`
      ),
    });
    expect(row).toHaveAttribute("href", `${basePath}/knowledge-hub/${sampleProgram.id}`);
    expect(row).toHaveTextContent(sampleProgram.university.name);
    const status = row.querySelector("[data-entity-status]");
    expect(status).toHaveAttribute("data-entity-status", tone);
    expect(status).toHaveAttribute("title", label);
    expect(screen.getByRole("columnheader", { name: "Actions" })).toHaveClass("text-end");
  }
);
