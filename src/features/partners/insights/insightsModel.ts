/**
 * Pure calculations for the Advisor insights page. Inputs are the admin
 * Advisor list and the admin applications list (all statuses); everything is
 * counted here so the numbers on every card agree.
 */

export interface InsightAdvisor {
  id: string;
  name: string;
  type: "agency" | "individual" | string;
  country: string | null;
  nationality: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string | null;
  last_login: string | null;
}

export interface InsightApplication {
  partner_id: string;
  stage: string | null;
}

export type InsightPeriod = "30d" | "90d" | "12m" | "all";
export const INSIGHT_PERIODS: { key: InsightPeriod; label: string; days: number | null }[] = [
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "12m", label: "Last 12 months", days: 365 },
  { key: "all", label: "All time", days: null },
];

export type GrowthGrain = "weekly" | "monthly" | "quarterly";

export interface Slice {
  key: string;
  label: string;
  value: number;
}

const DAY = 86_400_000;

/** Display name the rest of the app uses: the company name for companies. */
export function advisorName(a: { name?: string | null; company_details?: { company_name?: string | null } | null }) {
  return a.company_details?.company_name || a.name || "Advisor";
}

/** Total, new in the period (with the period before it, for the change), active and suspended. */
export function kpis(advisors: InsightAdvisor[], period: InsightPeriod, now = Date.now()) {
  const days = INSIGHT_PERIODS.find((p) => p.key === period)?.days ?? null;
  const created = (a: InsightAdvisor) => (a.created_at ? new Date(a.created_at).getTime() : NaN);
  const inRange = (from: number, to: number) => advisors.filter((a) => created(a) >= from && created(a) < to).length;
  const newInPeriod = joinedInPeriod(advisors, period, now).length;
  const before = days === null ? null : inRange(now - 2 * days * DAY, now - days * DAY);
  return {
    total: advisors.length,
    newInPeriod,
    newBefore: before,
    active: advisors.filter((a) => a.is_active).length,
    inactive: advisors.filter((a) => !a.is_active).length,
  };
}

/** Advisors who joined in the period, newest first (every Advisor for "all"). The New Advisors tile counts these. */
export function joinedInPeriod(advisors: InsightAdvisor[], period: InsightPeriod, now = Date.now()) {
  const days = INSIGHT_PERIODS.find((p) => p.key === period)?.days ?? null;
  const created = (a: InsightAdvisor) => (a.created_at ? new Date(a.created_at).getTime() : NaN);
  const joined = days === null ? advisors : advisors.filter((a) => created(a) >= now - days * DAY && created(a) < now + DAY);
  return [...joined].sort((a, b) => (created(b) || 0) - (created(a) || 0));
}

/** Count by a field, most first; empty values become "Not recorded". */
export function countBy(advisors: InsightAdvisor[], pick: (a: InsightAdvisor) => string | null | undefined): Slice[] {
  const counts = new Map<string, number>();
  for (const a of advisors) {
    const key = (pick(a) ?? "").trim() || "Not recorded";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].map(([label, value]) => ({ key: label, label, value })).sort((a, b) => b.value - a.value);
}

const REGIONS: Record<string, string[]> = {
  Africa: ["Nigeria", "Ghana", "Kenya", "Uganda", "Tanzania", "Ethiopia", "Sudan", "South Sudan", "Somalia", "Egypt", "Morocco", "Algeria", "Tunisia", "Libya", "South Africa", "Zimbabwe", "Zambia", "Cameroon", "Senegal", "Rwanda", "Mauritius", "Botswana", "Namibia", "Malawi", "Mozambique", "Ivory Coast", "Côte d'Ivoire", "Sierra Leone", "Liberia", "Gambia", "Chad", "Niger", "Mali", "Burkina Faso", "Benin", "Togo", "Guinea", "Angola", "Djibouti", "Eritrea"],
  "Middle East": ["Saudi Arabia", "United Arab Emirates", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman", "Yemen", "Iraq", "Iran", "Jordan", "Lebanon", "Syria", "Palestine", "Turkey", "Türkiye"],
  "South Asia": ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Maldives", "Afghanistan"],
  "Southeast Asia": ["Malaysia", "Indonesia", "Singapore", "Thailand", "Vietnam", "Philippines", "Myanmar", "Cambodia", "Laos", "Brunei", "Timor-Leste"],
  "East Asia": ["China", "Japan", "South Korea", "Korea", "Taiwan", "Hong Kong", "Mongolia", "Macau"],
  "Central Asia": ["Kazakhstan", "Uzbekistan", "Kyrgyzstan", "Tajikistan", "Turkmenistan"],
  Europe: ["United Kingdom", "UK", "Ireland", "France", "Germany", "Spain", "Italy", "Portugal", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Poland", "Russia", "Ukraine", "Greece", "Romania", "Czech Republic", "Hungary"],
  Americas: ["United States", "USA", "Canada", "Mexico", "Brazil", "Argentina", "Colombia", "Chile", "Peru", "Venezuela"],
  Oceania: ["Australia", "New Zealand", "Fiji", "Papua New Guinea"],
};
const REGION_OF = new Map(Object.entries(REGIONS).flatMap(([region, countries]) => countries.map((c) => [c.toLowerCase(), region] as const)));

/** Region from a country name; unknown names are "Other". */
export function regionOf(country: string | null | undefined): string {
  if (!country?.trim()) return "Not recorded";
  return REGION_OF.get(country.trim().toLowerCase()) ?? "Other";
}

export const TYPE_LABEL: Record<string, string> = { agency: "Company", individual: "Individual" };

/** New Advisors per week (12, from Monday), month (12) or quarter (8), oldest first. */
export function growth(advisors: InsightAdvisor[], grain: GrowthGrain, now = new Date()): Slice[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const starts: { t: number; label: string }[] =
    grain === "weekly"
      ? Array.from({ length: 12 }, (_, i) => {
          const monday = today - ((new Date(today).getUTCDay() + 6) % 7) * DAY;
          const t = monday - (11 - i) * 7 * DAY;
          return { t, label: `${new Date(t).getUTCDate()}/${new Date(t).getUTCMonth() + 1}` };
        })
      : grain === "monthly"
      ? Array.from({ length: 12 }, (_, i) => {
          const t = Date.UTC(y, m - 11 + i, 1);
          return { t, label: new Date(t).toLocaleString("en-GB", { month: "short", timeZone: "UTC" }) };
        })
      : Array.from({ length: 8 }, (_, i) => {
          const q = Math.floor(m / 3) - 7 + i;
          const t = Date.UTC(y, q * 3, 1);
          const d = new Date(t);
          return { t, label: `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${String(d.getUTCFullYear()).slice(2)}` };
        });
  const series = starts.map(({ t, label }) => ({ key: new Date(t).toISOString().slice(0, 10), label, value: 0, t }));
  for (const a of advisors) {
    if (!a.created_at) continue;
    const at = new Date(a.created_at).getTime();
    let hit = -1;
    series.forEach((b, i) => {
      if (at >= b.t) hit = i;
    });
    if (hit >= 0) series[hit].value += 1;
  }
  return series.map(({ key, label, value }) => ({ key, label, value }));
}

/** Applications that reached the commission stage count as enrolled students. */
const isEnrolled = (stage: string | null) => /commission/i.test(stage ?? "");

/** Applications and enrolled students per Advisor, most first. */
export function performance(advisors: InsightAdvisor[], applications: InsightApplication[]) {
  const names = new Map(advisors.map((a) => [a.id, a.name]));
  const apps = new Map<string, number>();
  const enrolled = new Map<string, number>();
  for (const app of applications) {
    if (!names.has(app.partner_id)) continue;
    apps.set(app.partner_id, (apps.get(app.partner_id) ?? 0) + 1);
    if (isEnrolled(app.stage)) enrolled.set(app.partner_id, (enrolled.get(app.partner_id) ?? 0) + 1);
  }
  const rank = (m: Map<string, number>): Slice[] =>
    [...m].map(([id, value]) => ({ key: id, label: names.get(id) ?? "Advisor", value })).sort((a, b) => b.value - a.value);
  return { applications: rank(apps), enrolled: rank(enrolled), counts: apps };
}

export type FollowUpReason = "Suspended" | "No applications" | "No recent login";

/**
 * Advisors to follow up, one row each with the most urgent reason: suspended,
 * active with no applications, or no login in 60+ days. Advisors awaiting
 * review are left out: the home page's review list holds them.
 */
export function followUps(advisors: InsightAdvisor[], appCounts: Map<string, number>, now = Date.now()) {
  const rows: { advisor: InsightAdvisor; reason: FollowUpReason; days: number | null }[] = [];
  for (const a of advisors) {
    if (!a.is_verified) continue;
    const since = (iso: string | null) => (iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY)) : null);
    const login = since(a.last_login);
    const reason: FollowUpReason | null = !a.is_active
      ? "Suspended"
      : !appCounts.get(a.id)
      ? "No applications"
      : login === null || login >= 60
      ? "No recent login"
      : null;
    if (reason) rows.push({ advisor: a, reason, days: reason === "No recent login" ? login : since(a.created_at) });
  }
  const order: FollowUpReason[] = ["Suspended", "No applications", "No recent login"];
  return rows.sort((x, y) => order.indexOf(x.reason) - order.indexOf(y.reason) || (y.days ?? 0) - (x.days ?? 0));
}
