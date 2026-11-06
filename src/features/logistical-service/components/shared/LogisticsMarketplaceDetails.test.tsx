import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogisticsMarketplaceDetails from "./LogisticsMarketplaceDetails";
import LogisticsMarketplaceProviderDetails from "../admin/details/LogisticsMarketplaceProviderDetails";
const mockProvider = {
  id: "lgp_008",
  name: "Swahili Student Support MY",
  picture_file_key: "",
  main_location: "Kuala Lumpur",
  nationality: "Kenya",
  is_active: true,
  services_offered: [],
  packages_offered: [
    {
      name: "Arrival package",
      price: 150,
      description: "Support on arrival.",
      includes: ["Airport pickup", "SIM setup"],
    },
  ],
  universities_served: ["Sunway"],
  languages: ["English", "Swahili"],
  service_locations: ["Kuala Lumpur"],
  price_range: { min_price: 150, max_price: 150 },
  services_price_range: null,
  packages_price_range: { min_price: 150, max_price: 150 },
  phone_number: "+60123456789",
  whatsapp: "+60 12-345 6789",
};
let mockError: string | null = null;
jest.mock("features/logistical-service/hooks", () => ({
  useLogisticProviderDetails: () => ({
    service: mockError ? null : mockProvider,
    loadingService: false,
    errorService: mockError,
  }),
}));
jest.mock("components/ub/data/media/PresignedImage", () => ({
  __esModule: true,
  default: ({ fallback }: any) => fallback,
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
beforeEach(() => {
  mockError = null;
});
it("shows package-only pricing and inclusions without edit controls", () => {
  render(<LogisticsMarketplaceDetails id="lgp_008" />);
  expect(
    screen.getByRole("heading", { name: "Swahili Student Support MY" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Arrival package" })
  ).toBeInTheDocument();
  expect(screen.getByText("Airport pickup")).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Services offered" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Back to providers" })
  ).toHaveAttribute("href", "/partner/logistics-marketplace");
  expect(
    screen.queryByRole("link", { name: "Edit provider" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Contact on WhatsApp" })
  ).toHaveAttribute("href", "https://wa.me/60123456789");
});
it("preserves account-manager navigation", () => {
  render(
    <LogisticsMarketplaceDetails id="lgp_008" basePath="/account-manager" />
  );
  expect(
    screen.getByRole("link", { name: "Back to providers" })
  ).toHaveAttribute("href", "/account-manager/logistics-marketplace");
  expect(
    screen.queryByRole("link", { name: "Edit provider" })
  ).not.toBeInTheDocument();
});
it("keeps admin edit access", () => {
  render(<LogisticsMarketplaceProviderDetails id="lgp_008" />);
  expect(screen.getByRole("link", { name: "Edit provider" })).toHaveAttribute(
    "href",
    "/admin/logistics-marketplace/lgp_008/edit"
  );
});
it("copies the contact number with feedback", async () => {
  const user = userEvent.setup();
  render(<LogisticsMarketplaceDetails id="lgp_008" />);
  const copy = jest.spyOn(navigator.clipboard, "writeText");
  await user.click(screen.getByRole("button", { name: "Copy phone number" }));
  expect(copy).toHaveBeenCalledWith("+60123456789");
  expect(screen.getByRole("status")).toHaveTextContent("Copied");
});
it("shows a failed request instead of an endless loader", () => {
  mockError = "Provider unavailable";
  render(<LogisticsMarketplaceDetails id="missing" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Provider unavailable");
});
