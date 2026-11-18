import { render } from "@testing-library/react";
import AdvisorEntityCell from "./AdvisorEntityCell";

const base = { name: "Sara Ali", type: "individual", country: "Malaysia", is_active: true, is_verified: true };

function statusOf(container: HTMLElement) {
  const dot = container.querySelector("[data-entity-status]");
  return [dot?.getAttribute("data-entity-status"), dot?.getAttribute("title")];
}

describe("AdvisorEntityCell", () => {
  it("shows the advisor's state as the circle on the avatar", () => {
    expect(statusOf(render(<AdvisorEntityCell advisor={base} />).container)).toEqual(["active", "Active"]);
    expect(statusOf(render(<AdvisorEntityCell advisor={{ ...base, is_active: false }} />).container)).toEqual(["inactive", "Suspended"]);
    expect(statusOf(render(<AdvisorEntityCell advisor={{ ...base, is_active: false, is_verified: false }} />).container)).toEqual(["pending", "Pending review"]);
  });

  it("names a company by its company name, with type and country underneath", () => {
    const { getByText } = render(
      <AdvisorEntityCell advisor={{ ...base, type: "agency", company_details: { company_name: "Acme Study" } }} />,
    );
    expect(getByText("Acme Study")).toBeInTheDocument();
    expect(getByText("Company · Malaysia")).toBeInTheDocument();
  });
});
