import { mock, httpError, reply } from "../router";
import { table, newId, daysAgo, nowIso } from "../db";
import { PARTNERS } from "../seed";
import { partners } from "./partners";
import type { Bank } from "features/partners/banks/types";
import type { PartnerBankAccount } from "features/partners/bank-accounts/types";

// Curated banks list (admin/advisors/banks) and Advisor payout bank accounts
// (admin/advisors/bank-accounts, partner bank account tab).

const BANK_SEED: [string, string, string | null, string, boolean][] = [
  ["MY", "MBB", "MBBEMYKL", "Maybank", true],
  ["MY", "CIMB", "CIBBMYKL", "CIMB Bank", true],
  ["MY", "PBB", "PBBEMYKL", "Public Bank", true],
  ["MY", "RHB", "RHBBMYKL", "RHB Bank", true],
  ["MY", "HLB", "HLBBMYKL", "Hong Leong Bank", true],
  ["MY", "AMB", "ARBKMYKL", "AmBank", true],
  ["MY", "BIMB", "BIMBMYKL", "Bank Islam Malaysia", true],
  ["MY", "BKRM", "BKRMMYKL", "Bank Rakyat", true],
  ["MY", "AFB", "AFBQMYKL", "Affin Bank", true],
  ["MY", "ABMB", "MFBBMYKL", "Alliance Bank", true],
  ["MY", "UOB", "UOVBMYKL", "UOB Malaysia", true],
  ["MY", "OCBC", "OCBCMYKL", "OCBC Bank Malaysia", false],
  ["MY", "BSN", null, "Bank Simpanan Nasional", true],
  ["MY", "AGRO", "AGOBMYKL", "Agrobank", false],
  ["SG", "DBS", "DBSSSGSG", "DBS Bank", true],
];

export const banks = table<Bank>(
  BANK_SEED.map(([country, code, swift_code, name, is_active], i) => ({
    id: `bank_${String(i + 1).padStart(3, "0")}`,
    country,
    code,
    swift_code,
    name,
    is_active,
  })),
);

mock.get("/banks", ({ query }) => {
  let rows = banks.all();
  if (query.country) rows = rows.filter((b) => b.country.toLowerCase() === String(query.country).toLowerCase());
  if (!(query.include_inactive === true || query.include_inactive === "true")) rows = rows.filter((b) => b.is_active);
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
});

mock.post("/banks", ({ body }) => {
  if (banks.all().some((b) => b.country === body?.country && b.code === body?.code)) {
    return reply(409, { detail: `A bank with code ${body?.code} already exists for this country. Use a different code.`, code: "bank_code_taken" });
  }
  const row: Bank = {
    id: newId("bank"),
    country: String(body?.country ?? "MY").toUpperCase(),
    code: body?.code ?? "",
    swift_code: body?.swift_code || null,
    name: body?.name ?? "",
    is_active: body?.is_active ?? true,
  };
  banks.insert(row);
  return reply(201, row);
});

mock.patch("/banks/:id", ({ params, body }) => {
  const row = banks.update(params.id, body ?? {});
  if (!row) throw httpError(404, "Bank not found.");
  return row;
});

// ── Partner bank accounts ───────────────────────────────────────────────────

const RECORDER = { recorded_by_user_id: "usr_admin_001", recorded_by_name: "Nur Aisyah Binti Kamal", recorded_by_email: "aisyah.kamal@unibexs.com" };

const blank = {
  bank_id: null,
  intl_bank_name: null,
  intl_bank_country: null,
  intl_bank_swift: null,
  iban: null,
  beneficiary_address: null,
  beneficiary_phone: null,
  beneficiary_id_number: null,
  bank_branch_address: null,
  bank_branch_code: null,
  intermediary_bank_name: null,
  intermediary_bank_swift: null,
};

// Intl banks by Advisor country, for accounts not on the curated list.
const INTL: Record<string, [string, string, string]> = {
  Nigeria: ["Zenith Bank", "NG", "ZEIBNGLA"],
  Bangladesh: ["Dutch-Bangla Bank", "BD", "DBBLBDDH"],
  Pakistan: ["Habib Bank Limited", "PK", "HABBPKKA"],
  Egypt: ["National Bank of Egypt", "EG", "NBEGEGCX"],
  Indonesia: ["Bank Central Asia", "ID", "CENAIDJA"],
  Kenya: ["Equity Bank Kenya", "KE", "EQBLKENA"],
  Yemen: ["Tadhamon Bank", "YE", "TIBYYESA"],
};

const seedAccounts: PartnerBankAccount[] = [];
// Every seeded Advisor has an account (pending sign-ups don't). The active
// row's id is pba_NNN for ptn_NNN so finance payouts line up.
PARTNERS.forEach((p, i) => {
  const curated = i % 2 === 0; // RM accounts with a Malaysian bank
  const intl = INTL[p.country] ?? ["Standard Chartered", "GB", "SCBLGB2L"];
  const base = (n: number, age: number, active: boolean): PartnerBankAccount => ({
    ...blank,
    id: n === 1 ? p.id.replace("ptn_", "pba_") : `${p.id.replace("ptn_", "pba_")}_v${n}`,
    partner_id: p.id,
    ...(curated
      ? { bank_id: `bank_${String((i % 6) + 1).padStart(3, "0")}`, bank_branch_address: "Jalan Tun Perak, 50050 Kuala Lumpur", bank_branch_code: `0${14 + i}` }
      : {
          intl_bank_name: intl[0],
          intl_bank_country: intl[1],
          intl_bank_swift: intl[2],
          iban: i === 4 ? "EG380019000500000000263180002" : null,
          intermediary_bank_name: "Citibank N.A. New York",
          intermediary_bank_swift: "CITIUS33",
        }),
    account_holder_name: p.type === "agency" ? `${p.name} Sdn Bhd` : p.name,
    account_number: curated ? `5${String(14000000000 + i * 7919713 + n * 11).slice(0, 11)}` : `${String(1020000000 + i * 3571 + n * 7)}`,
    currency: curated ? "RM" : "USD",
    beneficiary_address: `${12 + i} ${pick2(i)}, ${p.country}`,
    beneficiary_phone: p.phone,
    beneficiary_id_number: `ID${String(880000000 + i * 1237)}`,
    is_active: active,
    ...RECORDER,
    created_at: daysAgo(age),
  });
  seedAccounts.push(base(1, 20 + i * 3, true));
  // Older, retired versions so the history view has a trail.
  if (i % 3 === 0) seedAccounts.push(base(0, 140 + i * 5, false));
  if (i === 0) seedAccounts.push({ ...base(9, 260, false), account_holder_name: "Global Pathways Education Enterprise" });
});

function pick2(i: number) {
  return ["Adeola Odeku Street", "Gulshan Avenue", "Shahrah-e-Faisal", "Tahrir Square", "Jalan Sudirman", "Moi Avenue", "Hadda Street", "Kimathi Street"][i % 8];
}

const accounts = table<PartnerBankAccount>(seedAccounts);

const ofPartner = (partnerId: string) =>
  accounts
    .all()
    .filter((a) => a.partner_id === partnerId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

const ensurePartner = (id: string) => {
  if (!partners.find(id)) throw httpError(404, "Advisor not found.");
};

mock.get("/partners/:id/bank-accounts", ({ params }) => {
  ensurePartner(params.id);
  return ofPartner(params.id).filter((a) => a.is_active);
});

mock.get("/partners/:id/bank-accounts/history", ({ params, query }) => {
  ensurePartner(params.id);
  const rows = ofPartner(params.id);
  return query.currency ? rows.filter((a) => a.currency.toUpperCase() === String(query.currency).toUpperCase()) : rows;
});

mock.post("/partners/:id/bank-accounts", ({ params, body }) => {
  ensurePartner(params.id);
  ofPartner(params.id).forEach((a) => (a.is_active = false));
  const row: PartnerBankAccount = {
    ...blank,
    ...body,
    id: newId("pba"),
    partner_id: params.id,
    currency: String(body?.currency ?? "RM").toUpperCase(),
    is_active: true,
    ...RECORDER,
    created_at: nowIso(),
  };
  accounts.insert(row);
  return reply(201, row);
});

// Updates retire the current row and create a new one in the same lineage.
mock.patch("/partners/:id/bank-accounts/:accountId", ({ params, body }) => {
  const current = accounts.find(params.accountId);
  if (!current || current.partner_id !== params.id) throw httpError(404, "Bank account not found.");
  current.is_active = false;
  const { currency: _c, ...patch } = body ?? {};
  void _c;
  const row: PartnerBankAccount = { ...current, ...patch, id: newId("pba"), is_active: true, ...RECORDER, created_at: nowIso() };
  accounts.insert(row);
  return row;
});
