import { countBy, followUps, growth, kpis, performance, regionOf, type InsightAdvisor } from "./insightsModel";

const NOW = Date.UTC(2026, 10, 20);
const days = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
const advisor = (over: Partial<InsightAdvisor>): InsightAdvisor => ({
  id: "a",
  name: "Advisor",
  type: "individual",
  country: "Nigeria",
  nationality: "Nigeria",
  is_active: true,
  is_verified: true,
  created_at: days(10),
  last_login: days(1),
  ...over,
});

const list = [
  advisor({ id: "1", created_at: days(5) }),
  advisor({ id: "2", created_at: days(40), country: "Malaysia", type: "agency" }),
  advisor({ id: "3", created_at: days(100), is_active: false }),
  advisor({ id: "4", created_at: days(200), is_verified: false, country: "Kazakhstan" }),
];

it("counts total, new in the period and the period before, active and suspended", () => {
  expect(kpis(list, "30d", NOW)).toEqual({ total: 4, newInPeriod: 1, newBefore: 1, active: 3, inactive: 1 });
  expect(kpis(list, "all", NOW).newBefore).toBeNull();
});

it("maps countries to regions and counts by field, most first", () => {
  expect(regionOf("Malaysia")).toBe("Southeast Asia");
  expect(regionOf("kazakhstan")).toBe("Central Asia");
  expect(regionOf("Atlantis")).toBe("Other");
  expect(regionOf(null)).toBe("Not recorded");
  expect(countBy(list, (a) => a.country)[0]).toEqual({ key: "Nigeria", label: "Nigeria", value: 2 });
});

it("buckets new Advisors by month, oldest first", () => {
  const monthly = growth([advisor({ created_at: "2026-11-05T00:00:00Z" }), advisor({ created_at: "2026-10-02T00:00:00Z" })], "monthly", new Date(NOW));
  expect(monthly).toHaveLength(12);
  expect(monthly.slice(-2).map((m) => m.value)).toEqual([1, 1]);
  expect(growth(list, "quarterly", new Date(NOW))).toHaveLength(8);
});

it("ranks performance and lists follow-ups by urgency", () => {
  const perf = performance(list, [
    { partner_id: "1", stage: "Visa" },
    { partner_id: "1", stage: "Commission" },
    { partner_id: "2", stage: "Unibexs review" },
  ]);
  expect(perf.applications[0]).toMatchObject({ key: "1", value: 2 });
  expect(perf.enrolled).toEqual([{ key: "1", label: "Advisor", value: 1 }]);
  const reasons = followUps(list, perf.counts, NOW).map((r) => `${r.advisor.id}:${r.reason}`);
  // Advisor 4 is awaiting review: that list is on Home, not here.
  expect(reasons).toEqual(["3:Suspended"]);
});
