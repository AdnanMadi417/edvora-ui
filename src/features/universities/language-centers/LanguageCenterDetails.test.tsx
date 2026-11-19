import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageCenterDetails from "./LanguageCenterDetails";
import { languageCentersApi } from "./api";
import { emptyConfiguration, emptyCourse } from "./configuration";
import { saveCentreConfiguration } from "./hooks/useCentreConfiguration";
const mockPush = jest.fn();
const mockUniversity = {
  id: "uni-1",
  name: "Test University",
  is_active: true,
  is_hidden: false,
  is_public: false,
  country: "Malaysia",
};
const center = {
  id: "lc-1",
  university_id: "uni-1",
  name: "English Centre",
  location: "Kuala Lumpur",
  description: "English language preparation",
  email: "",
  phone: "",
  is_active: true,
};
jest.mock("./api", () => ({
  languageCentersApi: { list: jest.fn(), update: jest.fn(), remove: jest.fn() },
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/language-centers/lc-1",
}));
jest.mock("features/universities/hooks/institutions/useUniversities", () => ({
  useUniversities: () => ({
    universities: [mockUniversity],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockUniversity.is_hidden = false;
  mockUniversity.is_active = true;
  (languageCentersApi.list as jest.Mock).mockResolvedValue({
    data: { items: [center] },
  });
});
it.each(["/admin", "/data-entry", "/partner"])(
  "loads a centre directly and displays saved courses at %s",
  async (basePath) => {
    const course = {
      ...emptyCourse(),
      name: "Academic English",
      language: "English",
    };
    course.fees = [
      {
        id: "fee",
        amount: "1500",
        currency: "MYR",
        basis: "course",
        levelId: "",
      },
    ];
    saveCentreConfiguration("uni-1", {
      ...emptyConfiguration(),
      enabled: true,
      name: "English Centre",
      courses: [course],
    });
    render(
      <LanguageCenterDetails
        id="lc-1"
        basePath={basePath}
        readOnly={basePath === "/partner"}
        allowDelete={basePath === "/admin"}
      />
    );
    await waitFor(() =>
      expect(screen.getByText("MYR 1,500 / course")).toBeVisible()
    );
    expect(
      screen.getByRole("link", { name: "Test University" })
    ).toHaveAttribute("href", `${basePath}/universities/uni-1`);
    // The breadcrumb is the way back (no separate button).
    expect(
      screen.getByRole("link", { name: "Language Centres" })
    ).toHaveAttribute("href", `${basePath}/language-centers`);
    expect(screen.queryByRole("link", { name: "Back to language centres" })).not.toBeInTheDocument();
    if (basePath === "/partner")
      expect(
        screen.queryByRole("button", { name: "Actions" })
      ).not.toBeInTheDocument();
  }
);
it("allows data entry to edit without offering deletion", async () => {
  const user = userEvent.setup();
  (languageCentersApi.update as jest.Mock).mockResolvedValue({
    data: { ...center, name: "Updated Centre" },
  });
  render(
    <LanguageCenterDetails
      id="lc-1"
      basePath="/data-entry"
      allowDelete={false}
    />
  );
  await user.click(await screen.findByRole("button", { name: "Actions" }));
  expect(
    screen.queryByRole("menuitem", { name: "Delete" })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("menuitem", { name: "Edit centre" }));
  const name = screen.getByRole("textbox", { name: "Center name" });
  await user.clear(name);
  await user.type(name, "Updated Centre");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );
  expect(languageCentersApi.update).toHaveBeenCalledWith(
    "lc-1",
    expect.objectContaining({ name: "Updated Centre" })
  );
});
it("requires confirmation before deleting and returns to the directory", async () => {
  const user = userEvent.setup();
  (languageCentersApi.remove as jest.Mock).mockResolvedValue({});
  render(<LanguageCenterDetails id="lc-1" />);
  await user.click(await screen.findByRole("button", { name: "Actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Delete" }));
  expect(languageCentersApi.remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Delete centre" }));
  await waitFor(() =>
    expect(mockPush).toHaveBeenCalledWith("/admin/language-centers")
  );
});
it("retries a failed direct load and shows an unavailable state for unknown centres", async () => {
  const user = userEvent.setup();
  (languageCentersApi.list as jest.Mock)
    .mockRejectedValueOnce(new Error("Load failed"))
    .mockResolvedValueOnce({ data: { items: [] } });
  render(<LanguageCenterDetails id="missing" />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Load failed");
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { name: "Language centre unavailable" });
});
it.each(["hidden", "inactive university", "inactive centre"])(
  "prevents advisor access to %s details",
  async (reason) => {
    mockUniversity.is_hidden = reason === "hidden";
    mockUniversity.is_active = reason !== "inactive university";
    (languageCentersApi.list as jest.Mock).mockResolvedValue({
      data: { items: [{ ...center, is_active: reason !== "inactive centre" }] },
    });
    render(
      <LanguageCenterDetails
        id="lc-1"
        basePath="/partner"
        readOnly
        allowDelete={false}
      />
    );
    await screen.findByRole("heading", { name: "Language centre unavailable" });
    expect(screen.queryByText(center.description)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Actions" })
    ).not.toBeInTheDocument();
  }
);

it("loads independent centre details without university actions", async () => {
  (languageCentersApi.list as jest.Mock).mockResolvedValue({
    data: {
      items: [{ ...center, university_id: "", centre_type: "independent" }],
    },
  });
  render(<LanguageCenterDetails id="lc-1" basePath="/partner" readOnly />);
  await screen.findByRole("heading", { name: "English Centre" });
  expect(
    screen.queryByRole("link", { name: "View university" })
  ).not.toBeInTheDocument();
  expect(screen.queryByText("University unavailable")).not.toBeInTheDocument();
});
