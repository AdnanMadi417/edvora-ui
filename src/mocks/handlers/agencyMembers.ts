import { mock, httpError } from "../router";
import { daysAgo, newId, nowIso, search } from "../db";
import { CURRENT_PARTNER } from "../seed";
import { partners, memberships, membersOf } from "./partners";
import type { AgencyMember, AgencyMemberDetails, AgencyInvitation } from "features/agency-members/types";

// Team members of the signed-in agency Advisor (partner/team-members) plus
// the public invite flow (team/verify-otp, team/accept-invite).

const truthy = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : v === true || v === "true");
const pageOf = <T,>(items: T[], query: Record<string, any>) => {
  const page = Number(query.page ?? 1) || 1;
  const page_size = Number(query.page_size ?? 10) || 10;
  return { items: items.slice((page - 1) * page_size, page * page_size), total: items.length, page, page_size };
};

/** Membership row with is_active kept in sync with the member's partner row. */
const view = (m: AgencyMember): AgencyMember => {
  const p = partners.find(m.partner_id);
  const isActive = p?.is_active ?? m.is_active;
  const { agency_id: _a, ...rest } = m as AgencyMember & { agency_id?: string };
  void _a;
  return { ...rest, is_active: isActive, status: isActive ? 1 : 0 };
};

const findMember = (partnerId: string) => {
  const m = membersOf(CURRENT_PARTNER.id).find((r) => r.partner_id === partnerId);
  if (!m) throw httpError(404, "Team member not found.");
  return m;
};

mock.get("/partners/agency/members", ({ query }) => {
  let rows = search(membersOf(CURRENT_PARTNER.id).map(view), query.search, ["name", "email"]);
  const active = truthy(query.is_active);
  const visible = truthy(query.commission_visible);
  if (active !== undefined) rows = rows.filter((m) => m.is_active === active);
  if (visible !== undefined) rows = rows.filter((m) => m.commission_visible === visible);
  return pageOf(rows, query);
});

mock.get("/partners/agency/members/:id", ({ params }) => {
  const m = findMember(params.id);
  const p = partners.find(m.partner_id)!;
  const details: AgencyMemberDetails = {
    ...view(m),
    country: p.country,
    nationality: p.nationality ?? p.country,
    phone: p.phone,
    last_login: p.last_login,
    individual_details: p.individual_details ?? undefined,
  };
  return details;
});

mock.patch("/partners/agency/members/:id/commission", ({ params, body }) => {
  const m = findMember(params.id);
  memberships.update(m.id, {
    commission_visible: !!body?.commission_visible,
    commission_display_percentage: body?.commission_visible ? Number(body?.commission_display_percentage ?? 0) : 0,
  });
  return view(m);
});

const setActive = (partnerId: string, isActive: boolean) => {
  const m = findMember(partnerId);
  memberships.update(m.id, { is_active: isActive, status: isActive ? 1 : 0 });
  partners.update(partnerId, { is_active: isActive, updated_at: nowIso() });
  return view(m);
};

mock.patch("/partners/agency/members/:id/suspend", ({ params }) => setActive(params.id, false));
mock.patch("/partners/agency/members/:id/reactivate", ({ params }) => setActive(params.id, true));

mock.post("/partners/agency/members/:id/resend-welcome-email", ({ params }) => {
  const m = findMember(params.id);
  return { member_partner_id: m.partner_id, sent_at: nowIso(), message: `Welcome email resent to ${m.email}.` };
});

// ── Invitations ─────────────────────────────────────────────────────────────

const invitations: AgencyInvitation[] = (
  [
    ["Chiamaka Nwosu", "otp_pending", true, 60, 0],
    ["Ibrahim Sule", "pending_profile", false, 0, 1],
    ["Adaeze Okonkwo", "link_expired", true, 50, 6],
    ["Musa Danjuma", "otp_expired", false, 0, 3],
    ["Folake Adeyemi", "superseded", true, 55, 12],
    ["Kwame Mensah", "completed", true, 70, 40],
    ["Ngozi Eze", "completed", true, 60, 35],
  ] as [string, AgencyInvitation["progress"], boolean, number, number][]
).map(([name, progress, visible, pct, age], i) => ({
  id: `inv_${String(i + 1).padStart(3, "0")}`,
  email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ")[1].toLowerCase()}@mail.com`,
  name,
  commission_visible: visible,
  commission_display_percentage: visible ? pct : 0,
  otp_verified_at: ["pending_profile", "link_expired", "completed"].includes(progress) ? daysAgo(age, -1) : null,
  is_used: progress === "completed",
  created_at: daysAgo(age, 2),
  progress,
}));

mock.get("/partners/agency/invitations", ({ query }) => {
  let rows = search(invitations, query.search, ["name", "email"]);
  if (query.progress) rows = rows.filter((r) => r.progress === query.progress);
  return pageOf(rows, query);
});

mock.post("/partners/agency/members/invite", ({ body }) => {
  // A re-invite supersedes the open invitation for the same email.
  invitations.forEach((inv) => {
    if (inv.email === body?.email && !inv.is_used) inv.progress = "superseded";
  });
  invitations.unshift({
    id: newId("inv"),
    email: body?.email,
    name: body?.name,
    commission_visible: !!body?.commission_visible,
    commission_display_percentage: body?.commission_visible ? Number(body?.commission_display_percentage ?? 0) : 0,
    otp_verified_at: null,
    is_used: false,
    created_at: nowIso(),
    progress: "otp_pending",
  });
  return { message: `Invitation sent to ${body?.email}.` };
});

mock.post("/partners/agency/members/resend-submission-link", ({ body }) => {
  const inv = invitations.find((r) => r.email === body?.email && !r.is_used);
  if (inv && inv.progress === "link_expired") inv.progress = "pending_profile";
  return { message: `A new profile link was sent to ${body?.email}.` };
});

// ── Public invite flow ──────────────────────────────────────────────────────

mock.post("/agency-invitations/resend-otp", ({ body }) => ({ message: `A new code was sent to ${body?.email}.` }));

mock.post("/agency-invitations/verify-otp", ({ body }) => {
  const inv = invitations.find((r) => r.email === body?.email && !r.is_used);
  if (inv) Object.assign(inv, { progress: "pending_profile", otp_verified_at: nowIso() });
  return { message: "Email verified. Check your inbox for the link to complete your profile." };
});

mock.post("/agency-invitations/submit", () => ({
  message: "Profile submitted. You can sign in once your Advisor account is activated.",
  reference_id: `UBX-TM-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
}));
