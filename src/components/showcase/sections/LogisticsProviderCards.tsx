"use client";
import LogisticsProviderCard from "components/ub/data/cards/LogisticsProviderCard";
import type { ServiceProvider } from "features/logistical-service/types";
import { Demo } from "../Showcase";
const provider: ServiceProvider = {
  id: "demo-provider",
  name: "Student Arrival Support",
  picture_file_key: "",
  picture_file_url: "",
  nationality: "Malaysia",
  main_location: "Kuala Lumpur",
  universities_served: ["Sunway University", "Asia Pacific University"],
  service_locations: ["Kuala Lumpur", "Selangor"],
  languages: ["English", "Malay"],
  services_offered: [
    { id: "pickup", name: "Airport pickup", price: 120 },
    { id: "orientation", name: "City orientation", price: 90 },
  ],
  packages_offered: [],
  price_range: { min_price: 90, max_price: 250 },
  services_price_range: { min_price: 90, max_price: 120 },
  packages_price_range: { min_price: 250, max_price: 250 },
  phone_number: "",
  whatsapp: "",
  is_active: true,
};
export default function LogisticsProviderCards() {
  return (
    <Demo
      name="LogisticsProviderCard"
      path="components/ub/data/cards/LogisticsProviderCard.tsx"
      description="Marketplace provider card with service and package prices, coverage, languages, separate actions, and a restricted-access state."
      code={
        "<LogisticsProviderCard provider={provider} href={`/partner/logistics-marketplace/${provider.id}`} locked={false} />"
      }
      props={[
        {
          name: "provider",
          type: "ServiceProvider",
          description: "Provider information and price ranges.",
        },
        {
          name: "href",
          type: "string",
          description: "Provider details route.",
        },
        {
          name: "locked",
          type: "boolean",
          description:
            "Hides provider information and removes details/contact links.",
        },
      ]}
    >
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <LogisticsProviderCard
          provider={provider}
          href="#c-logisticsprovidercard"
        />
        <LogisticsProviderCard
          provider={provider}
          href="#c-logisticsprovidercard"
          locked
        />
      </div>
    </Demo>
  );
}
