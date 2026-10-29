// In-memory data helpers for mock handlers. State lives for the page
// session: creates/edits/deletes stick until a full reload.

let counter = 1000;

/** A fresh id with a readable prefix, e.g. newId("app") -> "app_1001". */
export const newId = (prefix: string) => `${prefix}_${++counter}`;

/** Zero-padded seed id: seedId("app", 3) -> "app_003". */
export const seedId = (prefix: string, n: number) => `${prefix}_${String(n).padStart(3, "0")}`;

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 29, 9, 0, 0);

/** ISO timestamp `days` before a fixed "now" (deterministic across reloads). */
export const daysAgo = (days: number, hours = 0) => new Date(NOW - days * DAY - hours * 3600_000).toISOString();
export const daysFromNow = (days: number) => new Date(NOW + days * DAY).toISOString();
export const nowIso = () => new Date().toISOString();
/** Date only, "YYYY-MM-DD". */
export const dateOnly = (iso: string) => iso.slice(0, 10);

/** Deterministic pick: same inputs always give the same item. */
export const pick = <T,>(items: readonly T[], n: number): T => items[Math.abs(n) % items.length];

/** Envelope used by most list endpoints: { total, limit, offset, items }. */
export function paginate<T>(items: T[], query: Record<string, any>, defaultLimit = 20) {
  const limit = Number(query.limit ?? defaultLimit) || defaultLimit;
  const offset = Number(query.offset ?? (query.page ? (Number(query.page) - 1) * limit : 0)) || 0;
  return { total: items.length, limit, offset, items: items.slice(offset, offset + limit) };
}

/** Case-insensitive search across the given fields. */
export function search<T>(items: T[], term: unknown, fields: (keyof T)[]): T[] {
  if (!term || typeof term !== "string") return items;
  const q = term.toLowerCase();
  return items.filter((item) => fields.some((f) => String(item[f] ?? "").toLowerCase().includes(q)));
}

/** A mutable table of records keyed by `id`. */
export function table<T extends { id: string }>(seed: T[]) {
  const rows = [...seed];
  return {
    all: () => rows,
    find: (id: string) => rows.find((r) => r.id === id),
    insert(row: T) {
      rows.unshift(row);
      return row;
    },
    update(id: string, patch: Partial<T>) {
      const row = rows.find((r) => r.id === id);
      if (row) Object.assign(row, patch);
      return row;
    },
    remove(id: string) {
      const i = rows.findIndex((r) => r.id === id);
      if (i >= 0) rows.splice(i, 1);
      return i >= 0;
    },
  };
}

/** SVG avatar/logo with initials, usable anywhere an image URL is expected. */
export function placeholderImage(label: string, color = "#0348D1") {
  const initials = label.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Arial" font-size="64" font-weight="600" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** A one-page placeholder PDF for document previews/downloads. */
export const SAMPLE_PDF_URL = "/mock/sample.pdf";
