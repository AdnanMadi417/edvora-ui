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
  useRouter: () => ({ push: jest.fn() }),
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
    await screen.findByRole("link", { name: /English Center/ })
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
    screen.getByRole("link", { name: /Other Center/ })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("link", { name: /Other Center/ })
    ).not.toBeInTheDocument()
  );
  expect(screen.getByRole("link", { name: /English Center/ })).toHaveAttribute(
    "href",
    "/admin/language-centers/lc-1"
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
  await screen.findByRole("link", { name: /English Center/ });
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
    await screen.findByRole("link", { name: /New Center/ })
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
  await screen.findByRole("link", { name: /English Center/ });
  await user.click(rowAction("Delete English Center"));
  expect(languageCentersApi.remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Delete center" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("link", { name: /English Center/ })
    ).not.toBeInTheDocument()
  );
  expect(languageCentersApi.remove).toHaveBeenCalledWith("lc-1");
  unmount();
  render(
    <LanguageCentersDirectory basePath="/data-entry" allowDelete={false} />
  );
  await screen.findByRole("link", { name: /English Center/ });
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
    await screen.findByRole("link", { name: /English Center/ })
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
  await screen.findByRole("link", { name: /English Center/ });
  expect(screen.getByRole("article", { name: "English Center" })).toBeVisible();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Create language center" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Inactive Center/ })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Unavailable University Center/ })
  ).not.toBeInTheDocument();
  expect(queryRowAction("Edit English Center")).toBeNull();
  expect(queryRowAction("Delete English Center")).toBeNull();
  expect(screen.getByRole("link", { name: /English Center/ })).toHaveAttribute(
    "href",
    "/partner/language-centers/lc-1"
  );
  expect(screen.getByRole("link", { name: /English Center/ })).toHaveAttribute(
    "href",
    "/partner/language-centers/lc-1"
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
  await screen.findByRole("link", { name: /English Center/ });
  expect(
    screen.queryByRole("link", { name: /Other Center/ })
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
  await screen.findByRole("link", { name: /English Center/ });
  await user.click(screen.getByRole("button", { name: "University filters" }));
  await selectOption(
    user,
    screen.getByRole("combobox", { name: /^University type/ }),
    "private"
  );
  expect(
    screen.getByRole("link", { name: /Other Center/ })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("link", { name: /Other Center/ })
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
    await screen.findByRole("link", { name: /Other Center/ })
  ).toBeInTheDocument();
});
it("opens the detail page from row space and keeps row actions separate", async () => {
  const user = userEvent.setup();
  render(<LanguageCentersDirectory />);
  const link = await screen.findByRole("link", { name: /English Center/ });
  expect(link).toHaveAttribute("href", "/admin/language-centers/lc-1");
  expect(within(link).getByLabelText("Test University logo")).toBeVisible();
  expect(link.querySelector("a, button")).toBeNull();
  const navigate = jest.fn((event: Event) => event.preventDefault());
  link.addEventListener("click", navigate);
  await user.click(within(link.closest("tr")!).getByText("Kuala Lumpur"));
  expect(navigate).toHaveBeenCalledTimes(1);
  navigate.mockClear();
  await user.click(rowAction("Edit English Center"));
  expect(navigate).not.toHaveBeenCalled();
  expect(
    screen.getByRole("dialog", { name: "Edit language center" })
  ).toBeInTheDocument();
});

it("keeps search and filters working in the advisor card layout", async () => {
  const user = userEvent.setup();
  render(<LanguageCentersDirectory basePath="/partner" readOnly />);
  await screen.findByRole("article", { name: "English Center" });
  const search = screen.getByRole("searchbox");
  await user.type(search, "Missing centre");
  expect(screen.getByText("No language centers found")).toBeVisible();
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  await user.clear(search);
  await user.click(screen.getByRole("button", { name: "University filters" }));
  await selectOption(
    user,
    screen.getByRole("combobox", { name: /^University type/ }),
    "public"
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(screen.getByText("No language centers found")).toBeVisible();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
it("retries failed advisor card loads and paginates cards", async () => {
  const user = userEvent.setup();
  (languageCentersApi.list as jest.Mock)
    .mockRejectedValueOnce(new Error("Card load failed"))
    .mockResolvedValueOnce({
      data: {
        items: Array.from({ length: 11 }, (_, i) => ({
          ...center,
          id: `card-${i}`,
          name: `Language Centre ${i + 1}`,
        })),
      },
    });
  render(<LanguageCentersDirectory basePath="/partner" readOnly />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Card load failed"
  );
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("article", { name: "Language Centre 1" });
  expect(screen.getAllByRole("article")).toHaveLength(10);
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(
    screen.getByRole("article", { name: "Language Centre 11" })
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: /Language Centre 11/ })
  ).toHaveAttribute("href", "/partner/language-centers/card-10");
});

it("shows independent language centres as advisor cards without a university requirement", async () => {
  (languageCentersApi.list as jest.Mock).mockResolvedValue({
    data: {
      items: [
        {
          ...center,
          id: "independent",
          university_id: "",
          centre_type: "independent",
          name: "Independent Academy",
        },
      ],
    },
  });
  render(<LanguageCentersDirectory basePath="/partner" readOnly />);
  expect(
    await screen.findByRole("article", { name: "Independent Academy" })
  ).toBeVisible();
  expect(screen.getByText("Independent language centre")).toBeInTheDocument();
  expect(screen.queryByText("University unavailable")).not.toBeInTheDocument();
});
