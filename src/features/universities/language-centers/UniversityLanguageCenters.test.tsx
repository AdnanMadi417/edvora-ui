import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityLanguageCenters from "./UniversityLanguageCenters";
import { languageCentersApi } from "./api";
jest.mock("./api", () => ({ languageCentersApi: { list: jest.fn() } }));
const center = {
  id: "lc-1",
  university_id: "uni-1",
  name: "English Center",
  location: "Kuala Lumpur",
  email: "hello@example.com",
  phone: "+60123456789",
  description: "English courses for university preparation.",
  is_active: true,
};
beforeEach(() => {
  jest.clearAllMocks();
  (languageCentersApi.list as jest.Mock).mockResolvedValue({
    data: {
      items: [
        center,
        { ...center, id: "lc-2", university_id: "uni-2", name: "Other Center" },
        { ...center, id: "lc-3", name: "Inactive Center", is_active: false },
      ],
    },
  });
});
it("shows scoped readable details without a table or advisor management actions", async () => {
  render(
    <UniversityLanguageCenters universityId="uni-1" basePath="/partner" />
  );
  await screen.findByRole("heading", { name: "English Center" });
  await waitFor(() => expect(screen.getByText(center.description)).toBeVisible());
  expect(screen.getByText(center.email)).toBeVisible();
  expect(screen.queryByText("Other Center")).not.toBeInTheDocument();
  expect(screen.queryByText("Inactive Center")).not.toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Manage centers" })
  ).not.toBeInTheDocument();
});
it("includes inactive centers and a management link for university managers", async () => {
  render(
    <UniversityLanguageCenters
      universityId="uni-1"
      basePath="/data-entry"
      canManage
    />
  );
  await screen.findByRole("heading", { name: "Inactive Center" });
  expect(screen.getByRole("link", { name: "Manage centers" })).toHaveAttribute(
    "href",
    "/data-entry/language-centers?university_id=uni-1"
  );
});
it("handles a failed load with retry and an empty state", async () => {
  const user = userEvent.setup();
  (languageCentersApi.list as jest.Mock)
    .mockRejectedValueOnce(new Error("Load failed"))
    .mockResolvedValueOnce({ data: { items: [] } });
  render(
    <UniversityLanguageCenters universityId="uni-1" basePath="/partner" />
  );
  await screen.findByText("Load failed");
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.getByText("No language centers available")).toBeVisible());
});
