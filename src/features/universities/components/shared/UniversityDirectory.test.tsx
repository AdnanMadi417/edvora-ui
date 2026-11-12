import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityDirectory from "./UniversityDirectory";
import { useUniversities } from "features/universities/hooks";
import { sampleUniversities } from "components/showcase/fixtures/universities";
import { rowAction, queryRowAction } from "testUtils/rowActions";

jest.mock("features/universities/hooks", () => ({
  useUniversities: jest.fn(),
  useDeleteUniversity: () => ({
    deleteUniversity: jest.fn(),
    isDeleting: false,
  }),
  useSetUniversityHidden: () => ({ setUniversityHidden: jest.fn() }),
}));
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
beforeEach(() => {
  (useUniversities as jest.Mock).mockReturnValue({
    universities: [
      ...sampleUniversities,
      {
        ...sampleUniversities[0],
        id: "hidden",
        name: "Hidden institution",
        is_hidden: true,
      },
    ],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
});

it("excludes hidden institutions and management controls from partners", async () => {
  render(<UniversityDirectory role="partner" />);
  expect(useUniversities).toHaveBeenCalledWith(
    expect.objectContaining({ isHidden: false, includeInactive: false })
  );
  expect(screen.queryByText("Hidden institution")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Create university" })
  ).not.toBeInTheDocument();
  expect(
    queryRowAction("Delete university")
  ).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Filters" }));
  expect(
    screen.queryByRole("combobox", { name: "Visibility" })
  ).not.toBeInTheDocument();
});

it("keeps editing and visibility actions for data-entry without deletion", () => {
  render(<UniversityDirectory role="data-entry" />);
  expect(
    screen.getByRole("link", { name: "Create university" })
  ).toHaveAttribute("href", "/data-entry/universities/create");
  expect(screen.getAllByRole("link", { name: "Edit university" })).toHaveLength(
    3
  );
  expect(
    rowAction("Unhide university")
  ).toBeInTheDocument();
  expect(
    queryRowAction("Delete university")
  ).not.toBeInTheDocument();
});
