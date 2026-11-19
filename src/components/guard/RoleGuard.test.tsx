import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoleGuard from "./RoleGuard";
import PreviewAreaLink from "components/ub/navigation/links/PreviewAreaLink";
beforeEach(() => sessionStorage.clear());
it("renders the role area", async () => {
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
  sessionStorage.setItem("unibexs:preview-role", "partner");
  render(<PreviewAreaLink href="/admin/home">Admin preview</PreviewAreaLink>);
  screen
    .getByRole("link")
    .addEventListener("click", (event) => event.preventDefault());
  await user.click(screen.getByRole("link"));
  expect(sessionStorage.getItem("unibexs:preview-role")).toBe("admin");
});
