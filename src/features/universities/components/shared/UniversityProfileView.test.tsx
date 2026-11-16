import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityProfileView from "./UniversityProfileView";
import type { UniversityDetails } from "features/universities/types";
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
}));
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
  "shows all university details with section navigation for %s",
  async (basePath, canManage) => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = jest.fn();
    render(
      <UniversityProfileView
        university={university}
        branches={[
          {
            id: "branch-1",
            name: "Main Campus",
            location: "Bukit Jalil",
            state_id: "state-1",
            state: "Kuala Lumpur",
          },
        ]}
        paymentMethods={[
          {
            id: "payment-1",
            university_id: "uni-1",
            payment_method_id: "bank",
            payment_method_name: "Bank transfer",
            currency: "MYR",
            instructions: "Use the university reference.",
            is_active: true,
          },
        ]}
        basePath={`${basePath}/universities`}
        canManage={canManage as boolean}
      />
    );
    const nav = screen.getByRole("navigation", { name: "University sections" });
    expect(nav.closest("header")).not.toBeNull();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "University overview" })
      ).toBeVisible();
      expect(
        screen.getByRole("heading", { name: "Main Campus" })
      ).toBeVisible();
    });
    const directory = screen.getByTestId("center-details");
    expect(directory).toBeVisible();
    expect(directory).toHaveAttribute("data-university", "uni-1");
    expect(directory).toHaveAttribute("data-manage", String(canManage));
    await user.click(screen.getByRole("link", { name: "Language Centre" }));
    expect(directory.parentElement).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "Language Centre" })
    ).toHaveAttribute("aria-current", "location");
    expect(
      screen.getByRole("heading", { name: "University overview" })
    ).toBeVisible();
    if (canManage) {
      expect(
        screen.getByRole("link", { name: "Payment methods" })
      ).toBeVisible();
      expect(
        screen.getByRole("heading", { name: "Bank transfer" })
      ).toBeVisible();
    } else {
      expect(
        screen.queryByRole("link", { name: "Payment methods" })
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Bank transfer")).not.toBeInTheDocument();
    }
    if (canManage) {
      await user.click(screen.getByRole("button", { name: "Actions" }));
      await user.click(
        screen.getByRole("menuitem", { name: "Edit university" })
      );
      expect(mockPush).toHaveBeenLastCalledWith(
        `${basePath}/universities/uni-1/edit`
      );
    } else {
      expect(
        screen.queryByRole("button", { name: "Actions" })
      ).not.toBeInTheDocument();
    }
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  }
);
