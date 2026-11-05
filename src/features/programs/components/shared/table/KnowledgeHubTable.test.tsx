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
  expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
    "href",
    `/admin/knowledge-hub/${sampleProgram.id}/edit`
  );
  await user.click(
    screen.getByRole("checkbox", { name: `Select ${sampleProgram.name}` })
  );
  expect(select).toHaveBeenCalledTimes(1);
  expect(select).toHaveBeenCalledWith(sampleProgram.id);
});
