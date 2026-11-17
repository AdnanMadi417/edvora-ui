import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoleGuard from "./RoleGuard";
import PreviewAreaLink from "components/ub/navigation/links/PreviewAreaLink";
beforeEach(() => sessionStorage.clear());
it("blocks centre admins from other role areas, including direct URL visits", async () => {
  sessionStorage.setItem("unibexs:preview-role", "language_centre_admin");
  render(
    <RoleGuard allowedRoles={["admin"]}>
      <p>Platform management</p>
    </RoleGuard>
  );
  expect(
    await screen.findByRole("heading", { name: "Access restricted" })
  ).toBeInTheDocument();
  expect(screen.queryByText("Platform management")).not.toBeInTheDocument();
});
it("allows the centre workspace and records its preview role", async () => {
  render(
    <RoleGuard allowedRoles={["language_centre_admin"]}>
      <p>Centre workspace</p>
    </RoleGuard>
  );
  expect(await screen.findByText("Centre workspace")).toBeInTheDocument();
  expect(sessionStorage.getItem("unibexs:preview-role")).toBe(
    "language_centre_admin"
  );
});
it("keeps the explicitly chosen platform preview accessible", async () => {
  sessionStorage.setItem("unibexs:preview-role", "admin");
  render(
    <RoleGuard allowedRoles={["admin"]}>
      <p>Platform management</p>
    </RoleGuard>
  );
  expect(await screen.findByText("Platform management")).toBeInTheDocument();
});
it("only changes the preview role from an explicit area choice", async () => {
  const user = userEvent.setup();
  sessionStorage.setItem("unibexs:preview-role", "language_centre_admin");
  render(<PreviewAreaLink href="/admin/home">Admin preview</PreviewAreaLink>);
  screen
    .getByRole("link")
    .addEventListener("click", (event) => event.preventDefault());
  await user.click(screen.getByRole("link"));
  expect(sessionStorage.getItem("unibexs:preview-role")).toBe("admin");
});
