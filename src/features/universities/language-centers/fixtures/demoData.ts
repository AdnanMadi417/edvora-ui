import {
  type CentreConfiguration,
  type CentreCourse,
  type CentreCharge,
} from "../configuration";

// Illustrative course and pricing fixtures only.
const institutions = [
  {
    id: "uni_001",
    name: "Asia Pacific University",
    code: "apu",
    location: "Level 3, Learning Centre, Bukit Jalil, Kuala Lumpur",
    currency: "MYR",
    rate: 1450,
    mode: "Full-time · On campus",
  },
  {
    id: "uni_003",
    name: "UCSI University",
    code: "ucsi",
    location: "Block B, English Academy, Cheras, Kuala Lumpur",
    currency: "MYR",
    rate: 1250,
    mode: "Full-time · Hybrid",
  },
  {
    id: "uni_004",
    name: "Sunway University",
    code: "sunway",
    location: "Academic Building, Bandar Sunway, Petaling Jaya",
    currency: "USD",
    rate: 380,
    mode: "Full-time · On campus",
  },
  {
    id: "uni_006",
    name: "INTI International University",
    code: "inti",
    location: "Language Learning Hub, Putra Nilai, Negeri Sembilan",
    currency: "MYR",
    rate: 1150,
    mode: "Part-time · Evening classes",
  },
  {
    id: "uni_007",
    name: "Limkokwing University",
    code: "limkokwing",
    location: "International Learning Centre, Cyberjaya, Selangor",
    currency: "MYR",
    rate: 1350,
    mode: "Full-time · On campus",
  },
];
const levelNames = [
  "Starter (A1)",
  "Elementary (A2)",
  "Pre-intermediate (B1)",
  "Intermediate (B1+)",
  "Upper-intermediate (B2)",
  "Advanced (C1)",
];

function buildCentre(
  institution: (typeof institutions)[number]
): CentreConfiguration {
  const { id, name, code, location, currency, rate, mode } = institution;
  const charges = (prefix: string): CentreCharge[] => [
    {
      id: `${prefix}-visa`,
      kind: "Visa",
      amount: String(Math.round(rate * 0.8)),
      currency,
      description:
        "Sample student visa processing and administration fee; charged once where applicable.",
      refundable: false,
    },
    {
      id: `${prefix}-insurance`,
      kind: "Insurance",
      amount: String(Math.round(rate * 0.3)),
      currency,
      description: "Sample six-month student medical insurance cover.",
      refundable: false,
    },
    {
      id: `${prefix}-housing`,
      kind: "Accommodation",
      amount: String(Math.round(rate * 0.65)),
      currency,
      description:
        "Optional shared room, sample monthly rate. Utilities charged separately.",
      refundable: false,
    },
    {
      id: `${prefix}-deposit`,
      kind: "Refundable deposit",
      amount: String(Math.round(rate * 0.5)),
      currency,
      description:
        "Returned after completion, subject to outstanding balances and property inspection.",
      refundable: true,
    },
    {
      id: `${prefix}-materials`,
      kind: "Other",
      amount: String(Math.round(rate * 0.1)),
      currency,
      description:
        "Course materials and digital learning access; waived when included in a package.",
      refundable: false,
    },
  ];
  const intensiveId = `${id}-intensive`;
  const academicId = `${id}-academic`;
  const mandarinId = `${id}-mandarin`;
  const intensive: CentreCourse = {
    id: intensiveId,
    name: "Intensive English Programme",
    language: "English",
    studyMode: mode,
    entryRequirements:
      "Minimum age 16. Open to beginners and continuing learners. Bring a passport or identity document to registration.",
    placementTest:
      "Required before enrollment: 45-minute online grammar and reading test, followed by a 10-minute speaking interview. The first test is included in the course fee.",
    levels: levelNames.map((level, i) => ({
      id: `${intensiveId}-level-${i + 1}`,
      name: level,
      order: String(i + 1),
      duration: "4 weeks",
      learningHours: "80",
    })),
    intakes: [],
    fees: levelNames.map((_, i) => ({
      id: `${intensiveId}-fee-${i}`,
      amount: String(rate + i * Math.round(rate * 0.05)),
      currency,
      basis: "level",
      levelId: `${intensiveId}-level-${i + 1}`,
    })),
    packages: [
      {
        id: `${intensiveId}-starter-package`,
        name: "English Starter Bundle",
        duration: "12 weeks · 3 levels",
        amount: String(rate * 3 - Math.round(rate * 0.2)),
        currency,
        services:
          "Tuition for the first three levels\nInitial placement test\nCourse books and digital learning materials\nWeekly conversation club\nEnd-of-level assessments",
      },
      {
        id: `${intensiveId}-complete-package`,
        name: "Complete English Pathway",
        duration: "24 weeks · 6 levels",
        amount: String(rate * 6 - Math.round(rate * 0.5)),
        currency,
        services:
          "Tuition for all six levels\nInitial placement test and one retest\nAll course books\nAcademic skills workshops\nOne airport pickup\nCompletion certificate\nVisa, insurance, accommodation and deposits excluded",
      },
    ],
    charges: charges(intensiveId),
  };
  const academic: CentreCourse = {
    id: academicId,
    name: "English for Academic Study",
    language: "English",
    studyMode: "Full-time · Hybrid",
    entryRequirements:
      "Intermediate English (B1) or a comparable placement result. Recommended for students preparing for an English-medium degree.",
    placementTest:
      "Writing diagnostic and an academic speaking interview. Recent proficiency results may be considered for placement.",
    levels: [
      {
        id: `${academicId}-level-1`,
        name: "Academic Foundations",
        order: "1",
        duration: "6 weeks",
        learningHours: "90",
      },
      {
        id: `${academicId}-level-2`,
        name: "University Readiness",
        order: "2",
        duration: "6 weeks",
        learningHours: "90",
      },
    ],
    intakes: [],
    fees: [
      {
        id: `${academicId}-fee`,
        amount: String(rate * 3),
        currency,
        basis: "course",
        levelId: "",
      },
    ],
    packages: [
      {
        id: `${academicId}-package`,
        name: "Academic Success Package",
        duration: "12 weeks",
        amount: String(rate * 3 + Math.round(rate * 0.25)),
        currency,
        services:
          "Full course tuition\nWriting support sessions\nResearch and referencing workshops\nMock presentations\nDigital course materials",
      },
    ],
    charges: charges(academicId).filter((charge) =>
      ["Visa", "Insurance", "Refundable deposit"].includes(charge.kind)
    ),
  };
  const mandarin: CentreCourse = {
    id: mandarinId,
    name: "Mandarin Essentials",
    language: "Mandarin Chinese",
    studyMode: "Part-time · Online evening classes",
    entryRequirements:
      "Minimum age 16. No prior Mandarin knowledge is required for Beginner. Continuing learners take a short placement interview.",
    placementTest:
      "Optional 15-minute speaking and character-recognition check for applicants seeking entry above Beginner.",
    levels: ["Beginner", "Everyday Communication", "Practical Fluency"].map(
      (level, i) => ({
        id: `${mandarinId}-level-${i + 1}`,
        name: level,
        order: String(i + 1),
        duration: "8 weeks",
        learningHours: "32",
      })
    ),
    intakes: [],
    fees: [
      {
        id: `${mandarinId}-fee`,
        amount: String(Math.round(rate * 0.45)),
        currency,
        basis: "month",
        levelId: "",
      },
    ],
    packages: [
      {
        id: `${mandarinId}-package`,
        name: "Mandarin Conversation Bundle",
        duration: "8 weeks · 1 level",
        amount: String(Math.round(rate * 0.8)),
        currency,
        services:
          "Eight weeks of tuition\nDownloadable practice sheets\nWeekly speaking circle\nEnd-of-level assessment",
      },
    ],
    charges: [
      {
        id: `${mandarinId}-materials`,
        kind: "Other",
        amount: String(Math.round(rate * 0.08)),
        currency,
        description:
          "Optional printed workbook and delivery. Digital materials are already included.",
        refundable: false,
      },
    ],
  };
  return {
    enabled: true,
    name: `${name} Language Centre`,
    description: `Demo language centre at ${name}, supporting international learners through general English, academic preparation and conversational Mandarin. Small-group lessons, progress reviews and academic support are included where specified. All courses and fees shown here are illustrative dummy data, not official university information.`,
    location,
    website: "",
    email: "",
    phone: "",
    courses: [intensive, academic, mandarin],
    sources: [],
    brochure: null,
  };
}
export const demoCentreConfigurations: Record<string, CentreConfiguration> =
  Object.fromEntries(
    institutions.map((institution, index) => [
      institution.id,
      buildCentre(institution),
    ])
  );
export function getDemoCentreConfiguration(
  id: string
): CentreConfiguration | null {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "false") return null;
  const value = demoCentreConfigurations[id];
  return value ? JSON.parse(JSON.stringify(value)) : null;
}
