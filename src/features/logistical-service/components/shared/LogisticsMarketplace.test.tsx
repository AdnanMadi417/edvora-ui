import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogisticsMarketplace from "./LogisticsMarketplace";
const mockProvider = {
  id: "provider",
  name: "Airport Assist",
  main_location: "Selangor",
  nationality: "Malaysia",
  is_active: true,
  picture_file_key: "",
  whatsapp: "+60 12-345 6789",
  languages: ["English"],
  universities_served: ["Sunway"],
  services_offered: [{ id: "pickup", name: "Airport transfer", price: 0 }],
  services_price_range: { min_price: 0, max_price: 100 },
  packages_price_range: null,
};
jest.mock("features/logistical-service/hooks", () => ({
  useLogisticProviders: () => ({
    serviceProviders: [mockProvider],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));
jest.mock("components/ub/data/media/PresignedImage", () => ({
  __esModule: true,
  default: ({ fallback }: any) => fallback,
}));
it("offers a card link and separate details/contact actions", () => {
  render(<LogisticsMarketplace />);
  expect(
    screen.getByRole("link", { name: "View Airport Assist" })
  ).toHaveAttribute("href", "/partner/logistics-marketplace/provider");
  expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute(
    "href",
    "/partner/logistics-marketplace/provider"
  );
  expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
    "href",
    "https://wa.me/60123456789"
  );
  expect(screen.getByText("RM 0")).toBeInTheDocument();
});
it("hides provider details, prices and contact links while locked", () => {
  render(<LogisticsMarketplace locked visaProcessingCount={0} />);
  expect(screen.getByText("Unlock Logistics Marketplace")).toBeInTheDocument();
  expect(screen.queryByText("Airport Assist")).not.toBeInTheDocument();
  expect(screen.queryByText("RM 0")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Details" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "WhatsApp" })
  ).not.toBeInTheDocument();
  expect(screen.getByText("Contact locked")).toBeInTheDocument();
});
it("searches by service and location", async () => {
  const user = userEvent.setup();
  render(<LogisticsMarketplace />);
  const search = screen.getByPlaceholderText(
    "Search providers, locations, or services..."
  );
  await user.type(search, "Selangor");
  expect(
    screen.getByRole("link", { name: "View Airport Assist" })
  ).toBeInTheDocument();
  await user.clear(search);
  await user.type(search, "not found");
  expect(
    screen.queryByRole("link", { name: "View Airport Assist" })
  ).not.toBeInTheDocument();
  expect(screen.getByText("No providers found")).toBeInTheDocument();
});
