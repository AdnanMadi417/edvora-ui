import type { University, Branch } from "features/universities/types";

export const sampleUniversities: University[] = [
  {
    id: "sample-apu",
    name: "Asia Pacific University",
    country: "Malaysia",
    is_active: true,
    description:
      "<p>A technology-focused institution offering industry-led programs and a diverse international campus community.</p>",
    logo_file_key: "",
    logo_file_url: "",
    university_type_id: "private",
    university_type_name: "Extended",
    intake_months: [1, 5, 9],
    is_public: false,
    has_language_center: true,
    is_hidden: false,
  },
  {
    id: "sample-utm",
    name: "Universiti Teknologi Malaysia",
    country: "Malaysia",
    is_active: true,
    description: "",
    logo_file_key: "",
    logo_file_url: "",
    university_type_id: "public",
    university_type_name: "Conditional",
    intake_months: [2, 9],
    is_public: true,
    has_language_center: false,
    is_hidden: false,
  },
];
export const sampleUniversityBranches: Branch[] = [
  {
    id: "campus-kl",
    name: "Technology Park campus",
    location: "Bukit Jalil",
    state_id: "kl",
    state: "Kuala Lumpur",
  },
  {
    id: "campus-city",
    name: "City campus",
    location: "City center",
    state_id: "kl",
    state: "Kuala Lumpur",
  },
];
