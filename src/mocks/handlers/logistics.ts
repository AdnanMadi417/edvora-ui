import { mock, httpError } from "../router";
import { newId, placeholderImage, table } from "../db";
import { UNIVERSITIES } from "../seed";
import type {
  LogisticLanguage,
  LogisticService,
  LogisticServiceLocation,
  LogisticUniversity,
  PackageOffered,
  PriceRange,
  ServiceProvider,
} from "features/logistical-service/types";

// Logistics Marketplace: providers, service catalogue and lookups. Prices are
// in RM. Providers keep ids internally and expose names, like the backend.

const services = table<LogisticService>(
  [
    "Airport Pickup",
    "Accommodation Search",
    "Health Insurance",
    "SIM Card Setup",
    "Bank Account Opening",
    "City Orientation Tour",
    "Student Pass Renewal Assistance",
    "Moving & Furniture Delivery",
    "Document Translation",
  ].map((name, i) => ({ id: `lsvc_${String(i + 1).padStart(3, "0")}`, name })),
);

const LANGUAGES: LogisticLanguage[] = [
  "English", "Arabic", "Malay", "Mandarin", "Bengali", "Urdu", "French", "Swahili", "Indonesian", "Hausa",
].map((name, i) => ({ id: `lang_${String(i + 1).padStart(3, "0")}`, name }));

const LOCATIONS: LogisticServiceLocation[] = [
  "Kuala Lumpur", "Selangor", "Putrajaya", "Negeri Sembilan", "Penang", "Johor", "Perak", "Melaka",
].map((name, i) => ({ id: `loc_${String(i + 1).padStart(3, "0")}`, name }));

const LOGISTIC_UNIVERSITIES: LogisticUniversity[] = UNIVERSITIES.map((u) => ({ id: u.id, name: u.name, country: u.country }));

type ProviderRow = {
  id: string;
  name: string;
  picture_file_key: string;
  picture_file_url: string;
  nationality: string;
  main_location: string;
  phone_number: string;
  whatsapp: string;
  is_active: boolean;
  university_ids: string[];
  language_ids: string[];
  location_names: string[];
  services: { service_id: string; price: number }[];
  packages_offered: PackageOffered[];
};

const pkg = (name: string, price: number, includes: string[], description: string): PackageOffered => ({ name, price, includes, description });

const PROVIDER_SEED: Omit<ProviderRow, "id" | "picture_file_key" | "picture_file_url">[] = [
  {
    name: "KL Student Arrival Services",
    nationality: "Malaysia",
    main_location: "Kuala Lumpur",
    phone_number: "+60 12-345 6789",
    whatsapp: "+60123456789",
    is_active: true,
    university_ids: ["uni_001", "uni_003", "uni_004"],
    language_ids: ["lang_001", "lang_003", "lang_004"],
    location_names: ["Kuala Lumpur", "Selangor", "Putrajaya"],
    services: [{ service_id: "lsvc_001", price: 120 }, { service_id: "lsvc_004", price: 35 }, { service_id: "lsvc_006", price: 90 }],
    packages_offered: [
      pkg("Arrival Essentials Package", 199, ["KLIA pickup", "Local SIM card with 30GB data", "Drop-off at Institution accommodation"], "Everything a new student needs for their first day in Malaysia."),
      pkg("First Week Settle-In Package", 450, ["KLIA pickup", "SIM card setup", "Bank account opening support", "Half-day city orientation"], "Hands-on support through the first week after arrival."),
    ],
  },
  {
    name: "Nile Bridge Student Care",
    nationality: "Egypt",
    main_location: "Selangor",
    phone_number: "+60 17-882 4410",
    whatsapp: "+60178824410",
    is_active: true,
    university_ids: ["uni_002", "uni_004", "uni_008"],
    language_ids: ["lang_001", "lang_002"],
    location_names: ["Selangor", "Kuala Lumpur"],
    services: [{ service_id: "lsvc_001", price: 110 }, { service_id: "lsvc_002", price: 300 }, { service_id: "lsvc_009", price: 60 }],
    packages_offered: [
      pkg("Arabic-Speaking Arrival Package", 380, ["Airport pickup", "Accommodation viewing (up to 3 units)", "Arabic-speaking guide"], "Arrival and housing support for Advisors' Arabic-speaking students."),
    ],
  },
  {
    name: "Penang Campus Connect",
    nationality: "Malaysia",
    main_location: "Penang",
    phone_number: "+60 16-410 2290",
    whatsapp: "+60164102290",
    is_active: true,
    university_ids: ["uni_005", "uni_006"],
    language_ids: ["lang_001", "lang_003", "lang_004", "lang_009"],
    location_names: ["Penang", "Perak"],
    services: [{ service_id: "lsvc_001", price: 150 }, { service_id: "lsvc_002", price: 250 }, { service_id: "lsvc_008", price: 380 }],
    packages_offered: [],
  },
  {
    name: "Dhaka-KL Student Desk",
    nationality: "Bangladesh",
    main_location: "Kuala Lumpur",
    phone_number: "+60 11-2765 3301",
    whatsapp: "+601127653301",
    is_active: true,
    university_ids: ["uni_001", "uni_005", "uni_007"],
    language_ids: ["lang_001", "lang_005", "lang_006"],
    location_names: ["Kuala Lumpur", "Selangor"],
    services: [{ service_id: "lsvc_003", price: 650 }, { service_id: "lsvc_005", price: 80 }, { service_id: "lsvc_007", price: 220 }],
    packages_offered: [
      pkg("Compliance Package", 820, ["Annual student health insurance", "Student pass renewal paperwork", "Bank account opening support"], "Keeps students covered and compliant with Institution requirements."),
      pkg("Insurance Only", 600, ["Annual student health insurance", "Claims assistance"], "Approved medical coverage for international students."),
    ],
  },
  {
    name: "Lagos Link Malaysia",
    nationality: "Nigeria",
    main_location: "Negeri Sembilan",
    phone_number: "+60 19-330 7781",
    whatsapp: "+60193307781",
    is_active: true,
    university_ids: ["uni_006", "uni_002"],
    language_ids: ["lang_001", "lang_010"],
    location_names: ["Negeri Sembilan", "Melaka", "Selangor"],
    services: [{ service_id: "lsvc_001", price: 180 }, { service_id: "lsvc_002", price: 280 }],
    packages_offered: [
      pkg("Nilai Arrival Package", 420, ["KLIA pickup to Nilai", "Room search near campus", "Grocery run on day one"], "Arrival support for students heading to Nilai and Seremban."),
    ],
  },
  {
    name: "Johor Student Housing Co.",
    nationality: "Malaysia",
    main_location: "Johor",
    phone_number: "+60 7-221 4580",
    whatsapp: "+6072214580",
    is_active: false,
    university_ids: [],
    language_ids: ["lang_001", "lang_003"],
    location_names: ["Johor"],
    services: [{ service_id: "lsvc_002", price: 200 }, { service_id: "lsvc_008", price: 320 }],
    packages_offered: [],
  },
  {
    name: "Jakarta Pelajar Services",
    nationality: "Indonesia",
    main_location: "Selangor",
    phone_number: "+60 14-998 1203",
    whatsapp: "+60149981203",
    is_active: true,
    university_ids: ["uni_003", "uni_004", "uni_005"],
    language_ids: ["lang_001", "lang_003", "lang_009"],
    location_names: ["Selangor", "Kuala Lumpur", "Putrajaya"],
    services: [{ service_id: "lsvc_001", price: 100 }, { service_id: "lsvc_004", price: 30 }, { service_id: "lsvc_005", price: 70 }, { service_id: "lsvc_009", price: 45 }],
    packages_offered: [
      pkg("Budget Arrival Package", 160, ["Shared airport pickup", "SIM card setup"], "An affordable start for students on a tight budget."),
    ],
  },
  {
    name: "Swahili Student Support MY",
    nationality: "Kenya",
    main_location: "Kuala Lumpur",
    phone_number: "+60 13-604 7712",
    whatsapp: "+60136047712",
    is_active: true,
    university_ids: ["uni_001", "uni_002"],
    language_ids: ["lang_001", "lang_008"],
    location_names: ["Kuala Lumpur"],
    services: [],
    packages_offered: [
      pkg("Full Relocation Package", 1250, ["Airport pickup", "Three months' accommodation search", "Health insurance", "Orientation tour"], "End-to-end relocation for students from East Africa."),
    ],
  },
];

const PICTURE_COLORS = ["#0348D1", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];

const providers = table<ProviderRow>(
  PROVIDER_SEED.map((p, i) => {
    const id = `lgp_${String(i + 1).padStart(3, "0")}`;
    return {
      id,
      ...p,
      picture_file_key: `logistics/providers/${id}.png`,
      picture_file_url: placeholderImage(p.name, PICTURE_COLORS[i % PICTURE_COLORS.length]),
    };
  }),
);

const range = (prices: number[]): PriceRange | null =>
  prices.length ? { min_price: Math.min(...prices), max_price: Math.max(...prices) } : null;

function toProvider(row: ProviderRow): ServiceProvider {
  const services_offered = row.services
    .map((s) => ({ id: s.service_id, name: services.find(s.service_id)?.name ?? "", price: s.price }))
    .filter((s) => s.name);
  const servicesRange = range(services_offered.map((s) => s.price));
  const packagesRange = range(row.packages_offered.map((p) => p.price));
  return {
    id: row.id,
    name: row.name,
    picture_file_key: row.picture_file_key,
    picture_file_url: row.picture_file_url,
    nationality: row.nationality,
    main_location: row.main_location,
    universities_served: row.university_ids.map((id) => LOGISTIC_UNIVERSITIES.find((u) => u.id === id)?.name).filter((n): n is string => !!n),
    service_locations: row.location_names,
    languages: row.language_ids.map((id) => LANGUAGES.find((l) => l.id === id)?.name).filter((n): n is string => !!n),
    services_offered,
    packages_offered: row.packages_offered,
    price_range: range([...services_offered.map((s) => s.price), ...row.packages_offered.map((p) => p.price)]) ?? { min_price: 0, max_price: 0 },
    services_price_range: servicesRange,
    packages_price_range: packagesRange,
    phone_number: row.phone_number,
    whatsapp: row.whatsapp,
    is_active: row.is_active,
  };
}

const findProvider = (id: string) => {
  const row = providers.find(id);
  if (!row) throw httpError(404, "Logistics provider not found");
  return row;
};

/** Map the create/edit payload onto a provider row. */
function fromPayload(body: any): Partial<ProviderRow> {
  const patch: Partial<ProviderRow> = {};
  const keys = ["name", "picture_file_key", "picture_file_url", "nationality", "main_location", "phone_number", "whatsapp", "is_active", "packages_offered"] as const;
  for (const k of keys) if (body?.[k] !== undefined) (patch as any)[k] = body[k];
  if (Array.isArray(body?.university_ids)) patch.university_ids = body.university_ids;
  if (Array.isArray(body?.language_ids)) patch.language_ids = body.language_ids;
  if (Array.isArray(body?.services)) patch.services = body.services.map((s: any) => ({ service_id: s.service_id, price: Number(s.price) || 0 }));
  if (patch.main_location && !body?.service_locations) patch.location_names = [patch.main_location];
  return patch;
}

// Providers
mock.get("/logistic-providers", () => providers.all().map(toProvider));
mock.get("/logistic-providers/:id", ({ params }) => toProvider(findProvider(params.id)));

mock.post("/logistic-providers", ({ body }) => {
  const id = newId("lgp");
  const row: ProviderRow = {
    id,
    name: "",
    picture_file_key: "",
    picture_file_url: "",
    nationality: "",
    main_location: "",
    phone_number: "",
    whatsapp: "",
    is_active: true,
    university_ids: [],
    language_ids: [],
    location_names: [],
    services: [],
    packages_offered: [],
    ...fromPayload(body),
  };
  if (!row.picture_file_url) row.picture_file_url = placeholderImage(row.name || "Provider");
  return toProvider(providers.insert(row));
});

mock.put("/logistic-providers/:id", ({ params, body }) => {
  const row = findProvider(params.id);
  // Keep existing service locations when editing; only a new main location is added.
  const patch = fromPayload(body);
  if (patch.location_names) patch.location_names = Array.from(new Set([...row.location_names, ...patch.location_names]));
  return toProvider(providers.update(params.id, patch)!);
});

mock.delete("/logistic-providers/:id", ({ params }) => {
  findProvider(params.id);
  providers.remove(params.id);
  return { message: "Logistics provider deleted" };
});

// Service catalogue
mock.get("/logistic-services", () => services.all());

mock.post("/admin/logistic-services", ({ body }) => {
  const name = String(body?.name ?? "").trim();
  if (!name) throw httpError(422, "Service name is required");
  if (services.all().some((s) => s.name.toLowerCase() === name.toLowerCase())) throw httpError(409, "This service already exists");
  const row = { id: newId("lsvc"), name };
  services.all().push(row); // append so the catalogue keeps its order
  return row;
});

mock.put("/admin/logistic-services/:id", ({ params, body }) => {
  if (!services.find(params.id)) throw httpError(404, "Service not found");
  return services.update(params.id, { name: String(body?.name ?? "").trim() });
});

mock.delete("/admin/logistic-services/:id", ({ params }) => {
  if (!services.find(params.id)) throw httpError(404, "Service not found");
  services.remove(params.id);
  for (const p of providers.all()) p.services = p.services.filter((s) => s.service_id !== params.id);
  return { message: "Service deleted" };
});

// Lookups
mock.get("/logistic-languages", () => LANGUAGES);
mock.get("/logistic-universities", () => LOGISTIC_UNIVERSITIES);
mock.get("/logistic-service-locations", () => LOCATIONS);
