// Demo content for Advisor home (UI-only build). Replace with API data when
// the endpoints exist; the component only reads these shapes.
import type { DaysTagMode } from "components/ub/data/badges/DaysTag";

export interface NextAction {
  student: string;
  reference: string;
  task: string;
  days: number;
  mode: DaysTagMode;
  action: string;
}

export const ADVISOR = { firstName: "Nur Aisyah", today: "Thursday, 29 Oct 2026" };

export const NEXT_ACTIONS: NextAction[] = [
  { student: "Nur Aisyah Binti Kamal", reference: "UBX-2026-0412", task: "Upload the signed offer letter", days: 1, mode: "deadline", action: "Upload letter" },
  { student: "Chinedu Okafor", reference: "UBX-2026-0413", task: "Pay the EMGS visa fee", days: 0, mode: "deadline", action: "Pay fee" },
  { student: "Tanvir Hossain", reference: "UBX-2026-0414", task: "Replace the blurred passport copy", days: 9, mode: "inStage", action: "Replace file" },
];

export const STATS = {
  active: { value: "24", delta: 3, context: "vs last month", sparkline: [14, 16, 15, 18, 20, 21, 24] },
  offers: { value: "6", delta: 20, context: "vs last intake" },
  commission: { value: 12400, delta: -8, context: "vs last month" },
  placed: { value: "18", delta: 12, context: "vs 2025", sparkline: [4, 6, 9, 11, 13, 16, 18] },
};

/** Applications per stage id (config/applicationStages.ts). */
export const PIPELINE: Partial<Record<string, number>> = {
  enquiry: 6,
  "documents-pending": 4,
  submitted: 3,
  "institution-review": 5,
  "offer-received": 3,
  "visa-in-progress": 2,
  "arrival-logistics": 1,
  enrolled: 4,
};

export const DEADLINES = [
  { title: "Sunway University · September intake", detail: "Application deadline", days: 3 },
  { title: "EMGS visa renewal · Sara Mahmoud", detail: "Passport expires before arrival", days: 12 },
  { title: "Taylor's University · scholarship", detail: "Merit scholarship closes", days: 21 },
];

export const ONBOARDING = [
  { label: "Complete your Advisor profile", done: true },
  { label: "Add your bank account", done: true },
  { label: "Sign the Non-Compete Covenant", done: true, required: true },
  { label: "Add your first student", done: false },
  { label: "Join the earners circle", done: false },
];

export const ACTIVITY = [
  { who: "Sunway University", what: "sent an offer letter for Nur Aisyah Binti Kamal", when: "2 hours ago" },
  { who: "Finance team", what: "paid RM4,200 commission for UBX-2026-0398", when: "Yesterday" },
  { who: "You", what: "submitted Chinedu Okafor to Taylor's University", when: "27 Oct 2026" },
];
