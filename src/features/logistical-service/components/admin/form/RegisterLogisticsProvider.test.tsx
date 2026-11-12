import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterLogisticsProvider from "./RegisterLogisticsProvider";

const mockCreate = jest.fn();
jest.mock("features/logistical-service/hooks", () => ({
  useLogisticServices: () => ({
    logisticServices: [{ id: "service-1", name: "Airport transfer" }],
    loadingLogisticServices: false,
    refetchLogisticServices: jest.fn(),
  }),
  useLogisticLanguages: () => ({
    logisticLanguages: [{ id: "lang-1", name: "English" }],
    loadingLogisticLanguage: false,
  }),
  useLogisticUniversities: () => ({
    logisticUniversities: [
      { id: "uni-1", name: "Sunway University", country: "Malaysia" },
    ],
    loadingLogisticUniversity: false,
  }),
  useCreateLogisticProvider: () => ({
    createLogisticsProvider: mockCreate,
    loadingCreateLogisticsProvider: false,
    errorCreateLogisticsProvider: null,
  }),
  useCreateLogisticService: () => ({
    createLogisticService: jest.fn(),
    loadingCreateLogisticService: false,
  }),
}));
jest.mock("features/programs/hooks", () => ({
  useStates: () => ({ states: [{ id: "state-1", name: "Selangor" }] }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/forms/uploads/ImageUploadField", () => ({
  __esModule: true,
  default: () => <p>Provider picture</p>,
}));

it("requires each section, preserves service pricing, and creates only after review", async () => {
  mockCreate.mockResolvedValue(undefined);
  const { container } = render(<RegisterLogisticsProvider />);
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Name is required")).toBeInTheDocument();
  await userEvent.type(
    screen.getByRole("textbox", { name: "Provider name" }),
    "FastTrack Logistics"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Primary contact number" }),
    "+60123456789"
  );
  await userEvent.click(
    within(
      container.querySelector('[data-field="nationality"]') as HTMLElement
    ).getByRole("button")
  );
  await userEvent.click(screen.getByRole("option", { name: "Malaysian" }));
  await userEvent.click(
    within(
      container.querySelector('[data-field="main_location"]') as HTMLElement
    ).getByRole("button")
  );
  await userEvent.click(screen.getByRole("option", { name: "Selangor" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByText("Please select at least one service")
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Airport transfer" })
  );
  await userEvent.clear(screen.getByRole("spinbutton"));
  await userEvent.type(screen.getByRole("spinbutton"), "150");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("No packages added yet")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByText("Please select at least one language")
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("switch", { name: /English/ }));
  await userEvent.click(
    screen.getByRole("checkbox", { name: "Sunway University" })
  );
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("RM 150")).toBeInTheDocument();
  expect(mockCreate).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole("button", { name: "Create provider" })
  );
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "FastTrack Logistics",
      nationality: "Malaysian",
      main_location: "Selangor",
      phone_number: "+60123456789",
      services: [{ service_id: "service-1", price: 150 }],
      language_ids: ["lang-1"],
      university_ids: ["uni-1"],
      packages_offered: [],
    })
  );
});
