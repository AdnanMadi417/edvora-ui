import type { Program } from "features/programs/types";

/** Static sample data for the program detail pattern; no API calls. */
export const sampleProgram: Program = {
  id: "sample-computer-science",
  name: "Bachelor of Computer Science (Honours)",
  tuition_fee: 97500,
  visa_fee_amount: 2500,
  first_year_tuition: 32500,
  intake_months: [3, 7, 11],
  next_intake_month: 11,
  duration: 3,
  branch: {
    id: "campus",
    name: "Technology Park campus",
    location: "Bukit Jalil",
    state: "Kuala Lumpur",
    state_id: "kl",
  },
  yearly_fee_currency: "MYR",
  yearly_fees: [
    { year: 1, fee: 32500 },
    { year: 2, fee: 32500 },
    { year: 3, fee: 32500 },
  ],
  one_time_fees: [
    { description: "Registration", fee: 1200, currency: "MYR" },
    { description: "International student visa", fee: 2500, currency: "MYR" },
  ],
  english_required_score: 6,
  overview:
    "<p>Build a foundation in software development, data structures and intelligent systems. Combine practical projects with industry experience to prepare for a career in technology.</p>",
  curriculum:
    "<ul><li>Programming and software engineering</li><li>Data science and artificial intelligence</li><li>Industry placement and final-year project</li></ul>",
  is_on_campus: true,
  is_online: false,
  class_type: "physical",
  has_scholarship: true,
  scholarships: [
    {
      id: "merit",
      name: "International merit scholarship",
      type: "merit",
      coverage_percent: 20,
      max_amount: 6500,
      description:
        "<p>Tuition support for students with strong academic results.</p>",
      conditions: [
        "Subject to academic eligibility and university approval",
        "Applies to first-year tuition only",
      ],
    },
  ],
  commission: {
    amount: 4200,
    currency: "MYR",
    type: "fixed",
    notes: "Subject to the university’s enrollment confirmation.",
    expected_commission_from: "2",
    expected_commission_to: "3",
  },
  qualification_id: "bachelor",
  qualification_level: "Bachelor",
  course_type: null,
  field_of_study: {
    id: "computing",
    name: "Computer Science & IT",
    code: "CS",
    is_active: true,
  },
  university: {
    id: "apu",
    name: "Asia Pacific University",
    country: "Malaysia",
    is_active: true,
    description: "",
    logo_file_key: "",
    logo_file_url: "",
    intake_months: [3, 7, 11],
    university_type_id: "private",
    university_type_name: "Private university",
  },
  is_hidden: false,
};

export const sampleProgramDocuments = [
  {
    id: "passport",
    type: "Passport copy",
    description: "A clear copy of the passport information page.",
    is_required_for_init: true,
    is_required_init_app_doc: true,
  },
  {
    id: "transcript",
    type: "Academic transcripts",
    description: "Latest results and qualification certificates.",
    is_required_for_init: true,
    is_required_init_app_doc: true,
  },
  {
    id: "reference",
    type: "Reference letter",
    description: "An academic or professional recommendation.",
    is_required_for_init: false,
    is_required_init_app_doc: false,
  },
];
