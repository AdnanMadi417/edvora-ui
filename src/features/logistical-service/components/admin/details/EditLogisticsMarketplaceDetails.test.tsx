import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditLogisticsMarketplaceDetails from "./EditLogisticsMarketplaceDetails";
const mockEdit = jest.fn();
const mockPush = jest.fn();
const mockService = {
  id: "provider",
  name: "Airport Assist",
  nationality: "Malaysia",
  main_location: "Selangor",
  phone_number: "+60123456789",
  whatsapp: "",
  is_active: true,
  picture_file_key: "",
  picture_file_url: "",
  packages_offered: [],
  services_offered: [{ id: "pickup", name: "Airport transfer", price: 125 }],
  languages: ["English"],
  universities_served: ["Sunway University"],
  service_locations: [],
};
jest.mock("features/logistical-service/hooks", () => ({
  useLogisticProviderDetails: () => ({
    service: mockService,
    loadingService: false,
    errorService: null,
  }),
  useLogisticServices: () => ({
    logisticServices: [{ id: "pickup", name: "Airport transfer" }],
    loadingLogisticServices: false,
    errorLogisticServices: null,
    refetchLogisticServices: jest.fn(),
  }),
  useLogisticLanguages: () => ({
    logisticLanguages: [{ id: "english", name: "English" }],
    loadingLogisticLanguage: false,
    errorLogisticLanguage: null,
  }),
  useLogisticUniversities: () => ({
    logisticUniversities: [{ id: "sunway", name: "Sunway University" }],
    loadingLogisticUniversity: false,
    errorLogisticUniversity: null,
  }),
  useEditLogisticProvider: () => ({
    editLogisticsProvider: mockEdit,
    loadingEditLogisticsProvider: false,
    errorEditLogisticsProvider: null,
  }),
  useEditLogisticService: () => ({
    editLogisticService: jest.fn(),
    loadingEditLogisticService: false,
  }),
}));
jest.mock("features/programs/hooks", () => ({
  useStates: () => ({
    states: [{ id: "selangor", name: "Selangor" }],
    stateLoading: false,
    stateError: null,
  }),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/forms/uploads/ImageUploadField", () => ({
  __esModule: true,
  default: () => <p>Provider picture</p>,
}));
it("preserves service prices and selection IDs when saving provider details", async () => {
  mockEdit.mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(<EditLogisticsMarketplaceDetails id="provider" />);
  const name = screen.getByRole("textbox", { name: "Provider name" });
  await user.clear(name);
  await user.type(name, "Updated provider");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(mockEdit).toHaveBeenCalledWith(
    "provider",
    expect.objectContaining({
      name: "Updated provider",
      services: [{ service_id: "pickup", price: 125 }],
      language_ids: ["english"],
      university_ids: ["sunway"],
      is_active: true,
    })
  );
  expect(mockPush).toHaveBeenCalledWith(
    "/admin/logistics-marketplace/provider"
  );
});
