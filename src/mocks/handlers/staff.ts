import { mock, httpError } from "../router";
import { newId, paginate, search, seedId, table } from "../db";
import { ROLES } from "./roles";
import type { StaffUser } from "features/staff-users/types";

// Staff users (admin/staff-users) and staff invitations.

const roleByCode = (code: string) => ROLES.find((r) => r.code === code) ?? ROLES[0];

const STAFF_SEED: [string, string, boolean][] = [
  ["Sarah Lim", "admin", true],
  ["Hafiz Ismail", "admin", true],
  ["Nurul Huda", "reviewer", true],
  ["Kumar Selvam", "reviewer", true],
  ["Jessica Wong", "reviewer", false],
  ["Ahmad Faizal", "data_entry", true],
  ["Mei Chen", "data_entry", true],
  ["Ravi Shankar", "data_entry", false],
  ["Siti Aminah", "finance_officer", true],
  ["Lucas Ng", "marketing_lead", true],
  ["Aminah Yusof", "support_agent", true],
  ["Kevin Teo", "reviewer", true],
];

const staffUsers = table<StaffUser>(
  STAFF_SEED.map(([name, code, active], i) => ({
    id: seedId("stf", i + 1),
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@unibexs.com`,
    role: roleByCode(code),
    is_active: active,
  })),
);

// Pending invitations keyed by email; any 6-digit OTP verifies.
const invitations = new Map<string, { name: string; role: string }>([
  ["farah.aziz@unibexs.com", { name: "Farah Aziz", role: "reviewer" }],
  ["daniel.lee@unibexs.com", { name: "Daniel Lee", role: "data_entry" }],
]);

mock.get("/admin/staff-users", ({ query }) => {
  let items = staffUsers.all();
  if (query.role) items = items.filter((u) => u.role.code === query.role);
  if (query.is_active !== undefined && query.is_active !== "") {
    const active = String(query.is_active) === "true";
    items = items.filter((u) => u.is_active === active);
  }
  items = search(items, query.search, ["name", "email"]);
  const page_size = Number(query.page_size ?? 20) || 20;
  const page = Number(query.page ?? 1) || 1;
  const { total, items: pageItems } = paginate(items, { limit: page_size, offset: (page - 1) * page_size });
  return { items: pageItems, total, page, page_size };
});

const findStaff = (id: string) => {
  const user = staffUsers.find(id);
  if (!user) throw httpError(404, "Staff user not found");
  return user;
};

mock.get("/admin/staff-users/:id", ({ params }) => findStaff(params.id));

mock.patch("/admin/staff-users/:id/suspend", ({ params }) => {
  findStaff(params.id);
  return staffUsers.update(params.id, { is_active: false });
});

mock.patch("/admin/staff-users/:id/reactivate", ({ params }) => {
  findStaff(params.id);
  return staffUsers.update(params.id, { is_active: true });
});

mock.post("/admin/staff-invitations", ({ body }) => {
  const email = String(body?.email ?? "").toLowerCase();
  if (staffUsers.all().some((u) => u.email === email)) {
    throw httpError(409, "A staff user with this email already exists");
  }
  invitations.set(email, { name: String(body?.name ?? ""), role: String(body?.role ?? "reviewer") });
  return { message: `Invitation sent to ${email}` };
});

mock.post("/admin/staff-invitations/resend-otp", ({ body }) => {
  const email = String(body?.email ?? "").toLowerCase();
  return { message: `A new verification code was sent to ${email}` };
});

mock.post("/staff-invitations/verify-otp", ({ body }) => {
  const email = String(body?.email ?? "").toLowerCase();
  if (!/^\d{6}$/.test(String(body?.otp ?? ""))) throw httpError(400, "Invalid or expired code");
  const invite = invitations.get(email) ?? { name: email.split("@")[0], role: "reviewer" };
  invitations.delete(email);
  staffUsers.insert({ id: newId("stf"), name: invite.name || email, email, role: roleByCode(invite.role), is_active: true });
  return { message: "Invitation verified", email, role: invite.role };
});
