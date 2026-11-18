import { mock, httpError, reply } from "../router";
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
//
// Mirrors unibexs-backend agency_members.py: verify-otp, resend-otp and
// submit with the same error codes, so every recovery screen can be demoed.
//
// Demo: /team/verify-otp?email=chiamaka.nwosu@mail.com with code 123456.
// Any other code counts as a wrong guess (3 locks the invite). Other seeds:
//   musa.danjuma@mail.com      code expired (send a new code, then 123456)
//   ibrahim.sule@mail.com      already verified
//   folake.adeyemi@mail.com    no open invite (replaced by a newer one)
//   kwame.mensah@mail.com      already has an account
// Profile links ("emailed" to the browser console on verify):
//   /team/accept-invite?token=invite-inv_002  valid
//   /team/accept-invite?token=invite-inv_003  expired
//   /team/accept-invite?token=invite-inv_006  already used

export const DEMO_INVITE_OTP = "123456";
const OTP_MAX_ATTEMPTS = 3;
const OTP_MAX_RESENDS = 3;
const OTP_COOLDOWN_MS = 60_000;

const fail = (status: number, code: string, message: string, details: unknown = null) =>
  reply(status, { code, message, details });

// Per-invitation OTP bookkeeping the admin table doesn't show.
const otpState = new Map<string, { attempts: number; resends: number; sentAt: number }>();
const stateOf = (inv: AgencyInvitation) => {
  if (!otpState.has(inv.id)) otpState.set(inv.id, { attempts: 0, resends: 0, sentAt: Date.parse(inv.created_at) });
  return otpState.get(inv.id)!;
};

const emailOf = (body: any) => String(body?.email ?? "").trim().toLowerCase();
const hasAccount = (email: string) => invitations.some((r) => r.email === email && r.progress === "completed");
/** The newest invitation that can still be used, as the backend's is_used == False lookup. */
const openInvitation = (email: string) =>
  invitations.find((r) => r.email === email && !r.is_used && r.progress !== "superseded" && r.progress !== "completed");
const tokenFor = (inv: AgencyInvitation) => `invite-${inv.id}`;

mock.post("/agency-invitations/resend-otp", ({ body }) => {
  const email = emailOf(body);
  if (hasAccount(email)) return fail(409, "email_already_registered", "An account with this email already exists");
  const inv = openInvitation(email);
  if (!inv) return fail(404, "no_pending_invitation", "No pending invitation found for this email");
  if (inv.otp_verified_at) return fail(409, "already_verified", "This invitation's email is already verified. Check for the profile-completion link instead");
  const st = stateOf(inv);
  if (Date.now() - st.sentAt < OTP_COOLDOWN_MS)
    return fail(429, "otp_recently_sent", "An OTP was recently sent. Please wait before requesting another");
  if (st.resends >= OTP_MAX_RESENDS)
    return fail(429, "otp_max_resends", "Maximum resend attempts reached. Please ask the agency to send a new invitation");
  Object.assign(st, { resends: st.resends + 1, attempts: 0, sentAt: Date.now() });
  inv.progress = "otp_pending";
  return { message: "A verification code has been sent to the invitee's email address." };
});

mock.post("/agency-invitations/verify-otp", ({ body }) => {
  const email = emailOf(body);
  if (hasAccount(email)) return fail(409, "email_already_registered", "An account with this email already exists");
  const inv = openInvitation(email);
  if (!inv) return fail(404, "otp_not_found", "No active verification code found for this email");
  if (inv.otp_verified_at)
    return fail(409, "already_verified", "This email is already verified. Ask the agency to resend your profile-completion link if you need a new one");
  if (inv.progress === "otp_expired") return fail(410, "otp_expired", "Verification code has expired. Please ask the agency to resend it");
  const st = stateOf(inv);
  if (String(body?.otp ?? "") !== DEMO_INVITE_OTP) {
    st.attempts += 1;
    const remaining = OTP_MAX_ATTEMPTS - st.attempts;
    if (remaining <= 0) {
      inv.is_used = true;
      inv.progress = "superseded";
      return fail(429, "otp_max_attempts", "Maximum verification attempts reached. Please ask the agency to send a new invitation");
    }
    return fail(422, "otp_invalid", "Invalid verification code", { attempts_remaining: remaining });
  }
  Object.assign(inv, { progress: "pending_profile", otp_verified_at: nowIso() });
  // Stands in for the profile-link email.
  // eslint-disable-next-line no-console
  console.info(`[mock email] Profile link for ${email}: /team/accept-invite?token=${tokenFor(inv)}`);
  return { message: "Email verified. Check your email for a link to complete your profile." };
});

mock.post("/agency-invitations/submit", ({ body }) => {
  const inv = invitations.find((r) => tokenFor(r) === body?.submission_token);
  if (!inv || !inv.otp_verified_at)
    return fail(404, "submission_link_invalid", "This link is invalid. Please ask the agency to resend your invitation");
  if (inv.is_used) return fail(409, "already_submitted", "This invitation has already been completed");
  if (inv.progress === "link_expired")
    return fail(410, "submission_link_expired", "This link has expired. Please ask the agency to resend your invitation");
  Object.assign(inv, { is_used: true, progress: "completed" });
  return {
    message: "Profile submitted. Check your email for login instructions.",
    reference_id: `UBX-TM-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  };
});
