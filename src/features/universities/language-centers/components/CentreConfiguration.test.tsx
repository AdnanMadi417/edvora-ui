import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  emptyConfiguration,
  emptyCourse,
  type CentreConfiguration,
} from "../configuration";
import CentreConfigurationFields from "./CentreConfigurationFields";
import CentreConfigurationView from "./CentreConfigurationView";
import UniversityLanguageCenters from "../UniversityLanguageCenters";
import { saveCentreConfiguration } from "../hooks/useCentreConfiguration";
import { selectOption } from "testUtils/selectOption";

beforeEach(() => localStorage.clear());
function Editor() {
  const [value, setValue] = useState({
    ...emptyConfiguration(),
    enabled: true,
  });
  return <CentreConfigurationFields value={value} onChange={setValue} />;
}
it("adds and removes course pricing without mixing packages and tuition", async () => {
  const user = userEvent.setup();
  render(<Editor />);
  expect(
    screen.queryByLabelText(/Centre contact|Official website|Brochure/)
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("Brochure and official sources")
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Add course" }));
  expect(
    screen.queryByRole("button", { name: "Add intake" })
  ).not.toBeInTheDocument();
  await user.type(screen.getByLabelText(/^Course name/), "English");
  await user.click(screen.getByRole("button", { name: "Add level" }));
  await user.type(screen.getByLabelText(/^Level name/), "Beginner");
  await user.click(screen.getByRole("button", { name: "Add tuition fee" }));
  await selectOption(
    user,
    screen.getByRole("combobox", { name: /Pricing basis/ }),
    "level"
  );
  expect(screen.getByRole("combobox", { name: /Fee level/ })).toBeVisible();
  await user.click(screen.getByRole("combobox", { name: /Fee level/ }));
  await user.click(screen.getByRole("option", { name: "Beginner" }));
  await user.click(screen.getByText("Packages (0)"));
  await user.click(screen.getByRole("button", { name: "Add package" }));
  await user.type(screen.getByLabelText(/^Package name/), "English bundle");
  expect(
    screen.getByRole("region", { name: "Tuition fees" })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Remove package 1" }));
  expect(screen.queryByLabelText(/^Package name/)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Remove level 1" }));
  expect(screen.getByRole("combobox", { name: /Fee level/ })).toHaveValue("");
  await user.click(
    screen.getByRole("button", { name: "Remove tuition fee 1" })
  );
  await user.click(screen.getByRole("button", { name: "Remove course 1" }));
  expect(screen.queryByLabelText(/^Course name/)).not.toBeInTheDocument();
});
it("renders saved advisor prices, services and refundable deposits while hiding missing facts", async () => {
  const course = {
    ...emptyCourse(),
    name: "Academic English",
    language: "English",
  };
  course.fees = [
    { id: "fee", amount: "1500", currency: "MYR", basis: "month", levelId: "" },
  ];
  course.packages = [
    {
      id: "pkg",
      name: "Study bundle",
      amount: "4200",
      currency: "MYR",
      duration: "3 months",
      services: "Books\nAirport pickup",
    },
  ];
  course.charges = [
    {
      id: "deposit",
      kind: "Refundable deposit",
      amount: "500",
      currency: "MYR",
      description: "Returned after course completion",
      refundable: true,
    },
  ];
  const value: CentreConfiguration = {
    ...emptyConfiguration(),
    enabled: true,
    name: "University Language Centre",
    courses: [course],
    website: "https://example.edu",
    sources: [
      {
        id: "source",
        label: "Official fee schedule",
        url: "https://example.edu/fees",
      },
    ],
    brochure: {
      name: "fees.pdf",
      dataUrl: "data:application/pdf;base64,JVBERi0=",
    },
  };
  saveCentreConfiguration("uni-1", value);
  render(
    <UniversityLanguageCenters universityId="uni-1" basePath="/partner" />
  );
  await waitFor(() =>
    expect(screen.getByText("MYR 1,500 / month")).toBeVisible()
  );
  expect(screen.getByText("MYR 4,200")).toBeVisible();
  expect(screen.getByText("Books")).toBeVisible();
  expect(screen.getByText("Refundable")).toBeVisible();
  expect(
    screen.queryByRole("link", { name: /Download brochure/ })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Official fee schedule/ })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Official website/ })
  ).not.toBeInTheDocument();
  expect(screen.queryByText("Available start dates")).not.toBeInTheDocument();
  expect(screen.queryByText("Contact email")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /Edit Language Centre/ })
  ).not.toBeInTheDocument();
});

it("shows every course by default and allows details to be collapsed", async () => {
  const user = userEvent.setup();
  const first = {
    ...emptyCourse(),
    name: "Intensive English",
    language: "English",
    entryRequirements: "Beginner learners welcome",
  };
  const second = {
    ...emptyCourse(),
    name: "Academic English",
    language: "English",
    entryRequirements: "Intermediate learners required",
  };
  render(
    <CentreConfigurationView
      value={{
        ...emptyConfiguration(),
        enabled: true,
        name: "Language Academy",
        courses: [first, second],
      }}
    />
  );
  await waitFor(() =>
    expect(screen.getByText("Beginner learners welcome")).toBeVisible()
  );
  expect(screen.getByText("Intermediate learners required")).toBeVisible();
  await user.click(screen.getByText("Academic English"));
  expect(screen.getByText("Intermediate learners required")).not.toBeVisible();
  await user.click(screen.getByText("Academic English"));
  expect(screen.getByText("Intermediate learners required")).toBeVisible();
});
