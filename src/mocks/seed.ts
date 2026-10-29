// Core reference entities shared across mock modules, so an application's
// partner, university and program line up everywhere they appear. Module
// handlers build their full response objects from these.

import { daysAgo, pick, placeholderImage, seedId } from "./db";

export const COUNTRIES = ["Malaysia", "Nigeria", "Bangladesh", "Pakistan", "Egypt", "Indonesia", "Yemen", "Sudan", "Kenya", "China"];

export const UNIVERSITIES = [
  { name: "Asia Pacific University", short: "APU", city: "Kuala Lumpur" },
  { name: "Taylor's University", short: "TU", city: "Subang Jaya" },
  { name: "UCSI University", short: "UCSI", city: "Kuala Lumpur" },
  { name: "Sunway University", short: "SU", city: "Petaling Jaya" },
  { name: "Multimedia University", short: "MMU", city: "Cyberjaya" },
  { name: "INTI International University", short: "INTI", city: "Nilai" },
  { name: "Limkokwing University", short: "LUCT", city: "Cyberjaya" },
  { name: "SEGi University", short: "SEGi", city: "Kota Damansara" },
].map((u, i) => ({
  id: seedId("uni", i + 1),
  ...u,
  country: "Malaysia",
  state: "Selangor",
  email: `admissions@${u.short.toLowerCase()}.edu.my`,
  phone: `+60 3-${8000 + i * 111} ${1000 + i * 37}`,
  website: `https://www.${u.short.toLowerCase()}.edu.my`,
  logo_url: placeholderImage(u.short, pick(["#0348D1", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0891B2"], i)),
  is_active: i !== 7,
  created_at: daysAgo(400 - i * 20),
}));

const PROGRAM_NAMES: [string, string][] = [
  ["Bachelor of Computer Science (Hons)", "Bachelor"],
  ["Bachelor of Business Administration (Hons)", "Bachelor"],
  ["Diploma in Information Technology", "Diploma"],
  ["Master of Business Administration", "Master"],
  ["Bachelor of Software Engineering (Hons)", "Bachelor"],
  ["Foundation in Engineering", "Foundation"],
  ["Master of Data Science", "Master"],
  ["Bachelor of Accounting and Finance (Hons)", "Bachelor"],
  ["PhD in Management", "PhD"],
  ["Diploma in Hospitality Management", "Diploma"],
];

export const PROGRAMS = UNIVERSITIES.flatMap((uni, u) =>
  [0, 1, 2].map((k) => {
    const [name, level] = pick(PROGRAM_NAMES, u * 3 + k);
    return {
      id: seedId("prog", u * 3 + k + 1),
      university_id: uni.id,
      university_name: uni.name,
      name,
      level,
      duration_months: level === "Master" ? 18 : level === "PhD" ? 36 : level === "Diploma" ? 30 : level === "Foundation" ? 12 : 36,
      tuition_fee: 18000 + ((u * 3 + k) % 7) * 6500,
      currency: "MYR",
      intakes: ["January", "May", "September"],
      is_active: (u * 3 + k) % 9 !== 8,
    };
  }),
);

export const ACCOUNT_MANAGERS = ["Aisha Rahman", "Daniel Tan", "Priya Nair", "Omar Haddad"].map((name, i) => ({
  id: seedId("am", i + 1),
  name,
  email: `${name.split(" ")[0].toLowerCase()}@unibexs.com`,
  phone: `+60 11-${2200 + i * 13} ${4400 + i * 9}`,
  is_active: true,
  created_at: daysAgo(300 - i * 30),
}));

const PARTNER_SEED: [string, "agency" | "individual", string][] = [
  ["Global Pathways Education", "agency", "Nigeria"],
  ["Ahmed Karim", "individual", "Bangladesh"],
  ["Bright Future Consultants", "agency", "Pakistan"],
  ["Fatima Yusuf", "individual", "Nigeria"],
  ["Nile Study Abroad", "agency", "Egypt"],
  ["Rizky Pratama", "individual", "Indonesia"],
  ["EduBridge International", "agency", "Kenya"],
  ["Hassan Al-Amri", "individual", "Yemen"],
  ["Crescent Education Hub", "agency", "Sudan"],
  ["Li Wei", "individual", "China"],
];

export const PARTNERS = PARTNER_SEED.map(([name, type, country], i) => ({
  id: seedId("ptn", i + 1),
  user_id: seedId("usr_ptn", i + 1),
  name,
  type,
  country,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  phone: `+${200 + i} 80 ${1000000 + i * 4321}`,
  is_active: i !== 9,
  is_verified: i < 8,
  assigned_manager: ACCOUNT_MANAGERS[i % ACCOUNT_MANAGERS.length],
  logo_url: placeholderImage(name, pick(["#0348D1", "#7C3AED", "#059669", "#D97706"], i)),
  created_at: daysAgo(380 - i * 25),
  last_login: daysAgo(i % 5, i),
}));

/** The partner the mock partner session signs in as (config/mockSession.ts). */
export const CURRENT_PARTNER = PARTNERS[0];

const FIRST = ["Amina", "Chinedu", "Tanvir", "Sara", "Mohamed", "Putri", "Kevin", "Zainab", "Ibrahim", "Nadia", "Yusuf", "Mei Ling", "Omar", "Halima", "Arif", "Grace", "Tariq", "Laila", "Samuel", "Nur", "Bilal", "Esther", "Faisal", "Ruqayyah"];
const LAST = ["Okafor", "Hossain", "Mahmoud", "Siregar", "Ochieng", "Bello", "Khan", "Abdallah", "Zhang", "Adeyemi", "Rahman", "Hassan"];

export const STUDENTS = FIRST.map((first, i) => {
  const last = pick(LAST, i * 5 + 1);
  return {
    id: seedId("stu", i + 1),
    first_name: first,
    last_name: last,
    name: `${first} ${last}`,
    email: `${first.toLowerCase().replace(" ", "")}.${last.toLowerCase()}@mail.com`,
    nationality: pick(COUNTRIES.slice(1), i),
    passport_number: `${String.fromCharCode(65 + (i % 26))}${String(10000000 + i * 7919).slice(0, 8)}`,
    date_of_birth: `${1998 + (i % 8)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    gender: i % 2 ? "female" : "male",
    phone: `+${230 + i} 70 ${3000000 + i * 1231}`,
    photo_url: placeholderImage(`${first} ${last}`, pick(["#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444"], i)),
  };
});

/** One application per student; the applications module adds stages/status. */
export const APPLICATIONS = STUDENTS.map((student, i) => {
  // The current partner owns every third application so the partner area isn't empty.
  const partner = i % 3 === 0 ? CURRENT_PARTNER : pick(PARTNERS, i);
  const program = pick(PROGRAMS, i * 7 + 2);
  return {
    id: seedId("app", i + 1),
    reference: `UBX-${String(24001 + i)}`,
    student,
    partner,
    program,
    university: UNIVERSITIES.find((u) => u.id === program.university_id)!,
    account_manager: partner.assigned_manager,
    intake: pick(["January 2027", "May 2027", "September 2026"], i),
    created_at: daysAgo(120 - i * 4),
    updated_at: daysAgo(i % 9, i),
  };
});
