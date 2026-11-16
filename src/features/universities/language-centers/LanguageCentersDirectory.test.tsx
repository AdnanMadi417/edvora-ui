import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageCentersDirectory from "./LanguageCentersDirectory";
import { languageCentersApi } from "./api";
import { selectOption } from "testUtils/selectOption";
import { rowAction, queryRowAction } from "testUtils/rowActions";

jest.mock("./api", () => ({
  languageCentersApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("features/universities/hooks/institutions/useUniversities", () => ({
  useUniversities: () => ({
    universities: [
      {
        id: "uni-1",
        name: "Test University",
        is_active: true,
        country: "Malaysia",
        is_public: false,
        university_type_id: "private",
        university_type_name: "Private Institution",
        intake_months: [1, 5],
      },
      {
        id: "uni-2",
        name: "Other University",
        is_active: true,
        country: "Singapore",
        is_public: true,
        university_type_id: "public",
        university_type_name: "Public Institution",
        intake_months: [],
      },
    ],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));
const center = {
  id: "lc-1",
  name: "English Center",
  university_id: "uni-1",
  location: "Kuala Lumpur",
  email: "",
  phone: "",
  description: "",
  is_active: true,
};
beforeEach(() => {
  jest.clearAllMocks();
  (languageCentersApi.list as jest.Mock).mockResolvedValue({
    data: {
      items: [
        center,
        {
          ...center,
          id: "lc-2",
          name: "Other Center",
          university_id: "uni-2",
          is_active: false,
        },
      ],
    },
  });
});
it("filters by linked university and status and links to the university profile", async () => {
  const user = userEvent.setup();
  render(<LanguageCentersDirectory />);
  expect(
    await screen.findByRole("button", { name: "English Center" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Filter by university" })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "University filters" }));
  await selectOption(
    user,
    screen.getByRole("combobox", { name: "Filter by university" }),
    "uni-1"
  );
  expect(
    screen.getByRole("button", { name: "Other Center" })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "Other Center" })
    ).not.toBeInTheDocument()
  );
  expect(screen.getByRole("link", { name: "Test University" })).toHaveAttribute(
    "href",
    "/admin/universities/uni-1"
  );
  await user.click(
    screen.getByRole("button", { name: "University filters (1)" })
  );
  await selectOption(
    user,
    screen.getByRole("combobox", { name: "Filter by status" }),
    "inactive"
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(screen.getByText("No language centers found")).toBeInTheDocument();
});
it("validates university selection, creates a center and keeps failed edits open", async () => {
  const user = userEvent.setup();
  (languageCentersApi.create as jest.Mock).mockResolvedValue({
    data: { ...center, id: "new", name: "New Center" },
  });
  render(<LanguageCentersDirectory />);
  await screen.findByRole("button", { name: "English Center" });
  await user.click(
    screen.getByRole("button", { name: "Create language center" })
  );
  await user.type(
    screen.getByRole("textbox", { name: "Center name" }),
    "New Center"
  );
  await user.type(
    screen.getByRole("textbox", { name: "Location" }),
    "Kuala Lumpur"
  );
  await user.click(screen.getByRole("button", { name: "Create center" }));
  expect(languageCentersApi.create).not.toHaveBeenCalled();
  expect(screen.getAllByText("Choose a university.").length).toBeGreaterThan(0);
  await selectOption(
    user,
    screen.getByRole("combobox", { name: "University" }),
    "uni-1"
  );
  await user.click(screen.getByRole("button", { name: "Create center" }));
  expect(
    await screen.findByRole("button", { name: "New Center" })
  ).toBeInTheDocument();
  expect(languageCentersApi.create).toHaveBeenCalledWith(
    expect.objectContaining({ university_id: "uni-1", name: "New Center" })
  );
  (languageCentersApi.update as jest.Mock).mockRejectedValue(
    new Error("Save failed")
  );
  await user.click(rowAction("Edit New Center"));
  await user.type(
    screen.getByRole("textbox", { name: "Center name" }),
    " updated"
  );
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Save failed")
  );
  expect(screen.getByRole("textbox", { name: "Center name" })).toHaveValue(
    "New Center updated"
  );
});
it("requires confirmation to delete and hides deletion for data entry", async () => {
  const user = userEvent.setup();
  (languageCentersApi.remove as jest.Mock).mockResolvedValue({});
  const { unmount } = render(<LanguageCentersDirectory />);
  await screen.findByRole("button", { name: "English Center" });
  await user.click(rowAction("Delete English Center"));
  expect(languageCentersApi.remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Delete center" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "English Center" })
    ).not.toBeInTheDocument()
  );
  expect(languageCentersApi.remove).toHaveBeenCalledWith("lc-1");
  unmount();
  render(
    <LanguageCentersDirectory basePath="/data-entry" allowDelete={false} />
  );
  await screen.findByRole("button", { name: "English Center" });
  expect(queryRowAction("Delete English Center")).toBeNull();
});
it("shows a retry action for a failed directory load", async () => {
  (languageCentersApi.list as jest.Mock).mockRejectedValueOnce(
    new Error("Load failed")
  );
  const user = userEvent.setup();
  render(<LanguageCentersDirectory />);
  await screen.findByText("Load failed");
  await user.click(screen.getByRole("button", { name: /retry|try again/i }));
  expect(
    await screen.findByRole("button", { name: "English Center" })
  ).toBeInTheDocument();
});

it("lets advisors browse active centers and view details without management actions", async () => {
  const user = userEvent.setup();
  (languageCentersApi.list as jest.Mock).mockResolvedValue({
    data: {
      items: [
        center,
        {
          ...center,
          id: "inactive",
          name: "Inactive Center",
          is_active: false,
        },
        {
          ...center,
          id: "unavailable",
          name: "Unavailable University Center",
          university_id: "missing",
        },
      ],
    },
  });
  render(<LanguageCentersDirectory basePath="/partner" readOnly />);
  await screen.findByRole("button", { name: "English Center" });
  expect(
    screen.queryByRole("button", { name: "Create language center" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Inactive Center" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Unavailable University Center" })
  ).not.toBeInTheDocument();
  expect(queryRowAction("Edit English Center")).toBeNull();
  expect(queryRowAction("Delete English Center")).toBeNull();
  expect(screen.getByRole("link", { name: "Test University" })).toHaveAttribute(
    "href",
    "/partner/universities/uni-1"
  );
  await user.click(screen.getByRole("button", { name: "English Center" }));
  expect(await screen.findByText("Contact email")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Edit center" })
  ).not.toBeInTheDocument();
  expect(languageCentersApi.create).not.toHaveBeenCalled();
  expect(languageCentersApi.update).not.toHaveBeenCalled();
  expect(languageCentersApi.remove).not.toHaveBeenCalled();
});

it("scopes the university tab to its university and preselects it on creation", async () => {
  const user = userEvent.setup();
  render(<LanguageCentersDirectory fixedUniversityId="uni-1" />);
  await screen.findByRole("button", { name: "English Center" });
  expect(
    screen.queryByRole("button", { name: "Other Center" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Filter by university" })
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Create language center" })
  );
  expect(screen.getByRole("combobox", { name: "University" })).toHaveValue(
    "uni-1"
  );
});

it("filters public/private institutions and clears the filter", async () => {
  const user = userEvent.setup();
  render(<LanguageCentersDirectory />);
  await screen.findByRole("button", { name: "English Center" });
  await user.click(screen.getByRole("button", { name: "University filters" }));
  await selectOption(
    user,
    screen.getByRole("combobox", { name: /^Institution type/ }),
    "private"
  );
  expect(
    screen.getByRole("button", { name: "Other Center" })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "Other Center" })
    ).not.toBeInTheDocument()
  );
  expect(
    screen.getByRole("button", { name: "University filters (1)" })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "University filters (1)" })
  );
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(
    await screen.findByRole("button", { name: "Other Center" })
  ).toBeInTheDocument();
});
it("includes linked university information in center details", async () => {
  const user = userEvent.setup();
  render(<LanguageCentersDirectory />);
  await user.click(
    await screen.findByRole("button", { name: "English Center" })
  );
  const details = screen.getByRole("dialog");
  expect(within(details).getByLabelText("Test University logo")).toBeVisible();
  expect(
    within(details).getByRole("link", { name: "Test University" })
  ).toHaveAttribute("href", "/admin/universities/uni-1");
  expect(within(details).getByText("Private")).toBeVisible();
  expect(
    within(details).queryByText("University country")
  ).not.toBeInTheDocument();
});
