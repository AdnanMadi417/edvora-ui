import { mock, httpError, reply } from "../router";
import { daysAgo, newId, paginate, search, table } from "../db";
import { ACCOUNT_MANAGERS, PARTNERS } from "../seed";
import type {
  AccountManager,
  AssignedPartner,
  TransferPartnersResult,
  UnsharePartnersResult,
} from "features/account-managers/types";

// Account managers (admin/account-managers + reviewer views). Primary
// portfolios come from PARTNERS[].assigned_manager; transfers reassign that
// field on the shared seed objects so the partners module sees the change.

type ManagerRow = { id: string; name: string; email: string; phone: string; is_active: boolean; created_at: string };

const managers = table<ManagerRow>([
  ...ACCOUNT_MANAGERS.map((m) => ({ ...m })),
  // An inactive manager with no Advisors, so the status filter has a match.
  { id: "am_005", name: "Farah Aziz", email: "farah@unibexs.com", phone: "+60 11-2252 4436", is_active: false, created_at: daysAgo(160) },
]);

/** managerId -> partner ids reached through a share (additional manager). */
const shares = new Map<string, Set<string>>([
  ["am_002", new Set(["ptn_001", "ptn_005"])],
  ["am_003", new Set(["ptn_004"])],
]);
const sharesOf = (id: string) => {
  if (!shares.has(id)) shares.set(id, new Set());
  return shares.get(id)!;
};

const toAssigned = (p: (typeof PARTNERS)[number]): AssignedPartner => ({ id: p.id, name: p.name, email: p.email, type: p.type });
const primaryPartners = (managerId: string) => PARTNERS.filter((p) => p.assigned_manager?.id === managerId);
const isAgency = (id: string) => PARTNERS.find((p) => p.id === id)?.type === "agency";
// Each agency carries a couple of team members along on transfer/share.
const agencyMembersFor = (ids: string[]) => ids.filter(isAgency).length * 2;

function toManager(row: ManagerRow): AccountManager {
  const assigned = primaryPartners(row.id);
  const shared = PARTNERS.filter((p) => sharesOf(row.id).has(p.id));
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    is_active: row.is_active,
    assigned_partners_count: String(assigned.length),
    assigned_partners: assigned.map(toAssigned),
    shared_partners_count: shared.length,
    shared_partners: shared.map(toAssigned),
  };
}

const findManager = (id: string) => {
  const row = managers.find(id);
  if (!row) throw httpError(404, "Account manager not found");
  return row;
};

mock.get("/admin/account-managers", ({ query }) => {
  let rows = managers.all();
  if (query.is_active !== undefined && query.is_active !== "") {
    const active = String(query.is_active) === "true";
    rows = rows.filter((m) => m.is_active === active);
  }
  rows = search(rows, query.search, ["name", "email"]);
  const page_size = Number(query.page_size ?? 100) || 100;
  const page = Number(query.page ?? 1) || 1;
  const { total, items } = paginate(rows, { limit: page_size, offset: (page - 1) * page_size });
  return { items: items.map(toManager), total, page, page_size };
});

mock.get("/admin/account-managers/:id", ({ params }) => toManager(findManager(params.id)));

const emailTaken = (email: string, exceptId?: string) =>
  managers.all().some((m) => m.email.toLowerCase() === email.toLowerCase() && m.id !== exceptId);

mock.post("/admin/account-managers", ({ body }) => {
  const email = String(body?.email ?? "");
  if (emailTaken(email)) return reply(409, { code: "email_already_exists", message: "This email is already in use." });
  const row = managers.insert({
    id: newId("am"),
    name: String(body?.name ?? ""),
    email,
    phone: "",
    is_active: body?.is_active ?? true,
    created_at: new Date().toISOString(),
  });
  return toManager(row);
});

mock.put("/admin/account-managers/:id", ({ params, body }) => {
  findManager(params.id);
  if (body?.email && emailTaken(body.email, params.id)) {
    return reply(409, { code: "email_already_exists", message: "This email is already in use." });
  }
  const row = managers.update(params.id, {
    ...(body?.name !== undefined && { name: body.name }),
    ...(body?.email !== undefined && { email: body.email }),
    ...(body?.is_active !== undefined && { is_active: body.is_active }),
  })!;
  return toManager(row);
});

mock.delete("/admin/account-managers/:id", ({ params }) => {
  findManager(params.id);
  const count = primaryPartners(params.id).length;
  if (count > 0) {
    return reply(409, {
      code: "manager_has_assigned_partners",
      message: "Transfer this manager's Advisors before deleting.",
      details: { assigned_partners_count: count },
    });
  }
  managers.remove(params.id);
  shares.delete(params.id);
  return { message: "Account manager deleted" };
});

mock.post("/admin/account-managers/:id/transfer-partners", ({ params, body }) => {
  findManager(params.id);
  const mode = body?.mode === "copy" ? "copy" : "move";
  const targetId: string | null = body?.target_manager_id ?? null;
  const target = targetId ? findManager(targetId) : null;
  if (mode === "copy" && !target) throw httpError(400, "A target manager is required to share Advisors");

  const owned = primaryPartners(params.id).map((p) => p.id);
  const requested: string[] = Array.isArray(body?.partner_ids) ? body.partner_ids : owned;
  const rejected = requested.filter((id) => !owned.includes(id));
  if (rejected.length) {
    return reply(409, {
      code: "partner_not_assigned_to_source",
      message: "Some Advisors are no longer assigned to this manager.",
      details: { partner_ids: rejected },
    });
  }

  const result: TransferPartnersResult = {
    mode,
    source_manager_id: params.id,
    target_manager_id: targetId,
    moved_partners_count: 0,
    moved_agency_members_count: 0,
    moved_partner_ids: [],
    shared_partners_count: 0,
    shared_agency_members_count: 0,
    already_shared_count: 0,
    shared_partner_ids: [],
  };

  if (mode === "move") {
    const seedTarget = target ? ACCOUNT_MANAGERS.find((m) => m.id === target.id) ?? { ...target } : null;
    for (const p of PARTNERS) {
      if (!requested.includes(p.id)) continue;
      (p as { assigned_manager: unknown }).assigned_manager = seedTarget;
      if (targetId) sharesOf(targetId).delete(p.id);
    }
    result.moved_partner_ids = requested;
    result.moved_partners_count = requested.length;
    result.moved_agency_members_count = agencyMembersFor(requested);
  } else {
    const set = sharesOf(targetId!);
    const fresh = requested.filter((id) => !set.has(id));
    fresh.forEach((id) => set.add(id));
    result.shared_partner_ids = fresh;
    result.shared_partners_count = fresh.length;
    result.shared_agency_members_count = agencyMembersFor(fresh);
    result.already_shared_count = requested.length - fresh.length;
  }
  return result;
});

mock.post("/admin/account-managers/:id/unshare-partners", ({ params, body }) => {
  findManager(params.id);
  const targetId = String(body?.target_manager_id ?? "");
  findManager(targetId);
  const owned = primaryPartners(params.id).map((p) => p.id);
  const requested: string[] = Array.isArray(body?.partner_ids) ? body.partner_ids : owned;
  const set = sharesOf(targetId);
  const removed = requested.filter((id) => set.delete(id));
  const result: UnsharePartnersResult = {
    source_manager_id: params.id,
    target_manager_id: targetId,
    unshared_partners_count: removed.length,
    unshared_agency_members_count: agencyMembersFor(removed),
    unshared_partner_ids: removed,
  };
  return result;
});
