import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityProfileView from "./UniversityProfileView";
import type { UniversityDetails } from "features/universities/types";
jest.mock(
  "features/universities/language-centers/UniversityLanguageCenters",
  () =>
    function Centers(props) {
      return (
        <div
          data-testid="center-details"
          data-university={props.universityId}
          data-manage={String(!!props.canManage)}
        >
          Language center details
        </div>
      );
    }
);
const university: UniversityDetails = {
  id: "uni-1",
  name: "Example University",
  country: "Malaysia",
  is_active: true,
  logo_file_key: "",
  logo_file_url: "",
  university_type_id: "type-1",
  university_type_name: "Private",
  is_public: false,
  has_language_center: false,
  is_hidden: false,
};
it.each([
  ["/admin", true],
  ["/data-entry", true],
  ["/partner", false],
])(
  "uses program-style section navigation and readable center details for %s",
  async (basePath, canManage) => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = jest.fn();
    render(
      <UniversityProfileView
        university={university}
        branches={[]}
        basePath={`${basePath}/universities`}
        canManage={canManage as boolean}
      />
    );
    const nav = screen.getByRole("navigation", { name: "University sections" });
    expect(nav.closest("header")).not.toBeNull();
    const directory = screen.getByTestId("center-details");
    expect(directory).toHaveAttribute("data-university", "uni-1");
    expect(directory).toHaveAttribute("data-manage", String(canManage));
    await user.click(screen.getByRole("link", { name: "Language Centers" }));
    expect(directory.parentElement).toHaveFocus();
    await waitFor(() => expect(screen.getByRole("heading", { name: "University overview" })).toBeVisible());
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  }
);
