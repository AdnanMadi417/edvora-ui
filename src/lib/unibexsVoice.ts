// Advisors hear one voice: Unibexs. Whoever did it on the staff side
// (account manager, admin, finance), an Advisor reads "Unibexs", never a
// role, a team or a person's name. Staff screens keep the real names and
// roles, for accountability. The backend already hides staff names from
// Advisors, as "Unibexs Operations Team" (app/services/actor_display.py);
// this turns that and the roles in backend copy into the one voice.

export const UNIBEXS = "Unibexs";

/** The name the backend shows Advisors for any staff member. */
export const BACKEND_STAFF_NAME = "Unibexs Operations Team";

const REWRITES: [RegExp, string][] = [
  [/\bUnibexs Operations Team\b/gi, UNIBEXS],
  // "Review the Admin's response" → "Review the Unibexs response"
  [/\b(account manager|admin)'s\b/gi, UNIBEXS],
  // "Under Review by Account Manager", "Account Manager is reviewing", "Awaiting Admin review"
  [/\baccount manager\b/gi, UNIBEXS],
  [/\badmin\b/gi, UNIBEXS],
  // Backend copy says Partner; the app calls the role Advisor.
  [/\bPartner\b/g, "Advisor"],
  [/\bpartner\b/g, "advisor"],
];

/** Backend copy (status names, next steps, notification text) as an Advisor should read it. */
export function unibexsVoice(text: string): string;
export function unibexsVoice(text: string | null | undefined): string | null;
export function unibexsVoice(text: string | null | undefined): string | null {
  if (!text) return text ?? null;
  return REWRITES.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text);
}

/**
 * Who did something, as an Advisor sees it. Staff (`actor_role` other than
 * partner, or the backend's masked staff name) read as Unibexs; the Advisor's
 * own agency keeps its names.
 */
export function advisorActorName(name: string | null | undefined, role?: string | null): string {
  if (!name) return UNIBEXS;
  if (role && role !== "partner") return UNIBEXS;
  return name.trim().toLowerCase() === BACKEND_STAFF_NAME.toLowerCase() ? UNIBEXS : name;
}
