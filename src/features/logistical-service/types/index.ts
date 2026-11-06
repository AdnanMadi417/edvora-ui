export interface PackageOffered {
  name: string;
  description: string;
  price: number;
  includes: string[];
}

export interface PriceRange {
  min_price: number;
  max_price: number;
}

export interface ServicesOffered {
  id: string;
  name: string;
  price: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  picture_file_key: string;
  picture_file_url: string;
  nationality: string;
  main_location: string;
  universities_served: string[];
  service_locations: string[];
  languages: string[];
  services_offered: ServicesOffered[];
  packages_offered: PackageOffered[];
  price_range: PriceRange;
  services_price_range: PriceRange | null;
  packages_price_range: PriceRange | null;
  phone_number: string;
  whatsapp: string;
  is_active: boolean;
}

export type ServiceProviders = ServiceProvider[];

export interface LogisticLanguage {
  id: string;
  name: string;
}

export type LogisticLanguages = LogisticLanguage[];

export interface LogisticUniversity {
  id: string;
  name: string;
  country: string;
}

export type LogisticUniversities = LogisticUniversity[];

export interface LogisticServiceLocation {
  id: string;
  name: string;
}

export type LogisticServiceLocations = LogisticServiceLocation[];

export interface ServiceEntry {
  service_id: string;
  price: number;
}

export interface CreateLogisticsProviderPayload {
  name: string;
  picture_file_key: string;
  picture_file_url: string;
  nationality: string;
  main_location: string;
  phone_number: string;
  whatsapp: string;
  is_active: boolean;
  packages_offered: PackageOffered[];
  university_ids: string[];
  services: ServiceEntry[];
  language_ids: string[];
}

export type EditLogisticsProviderPayload =
  Partial<CreateLogisticsProviderPayload>;

export type {
  LogisticService,
  LogisticServices,
  CreateLogisticServicePayload,
  EditLogisticServicePayload,
} from "../service-types/types";
