"use server";

import { contactSchema, type ContactInput } from "lib/contactSchema";

export type ContactResult = { ok: true } | { ok: false; error: string };

/**
 * Stub: validates again on the server, then logs. Replace the body with your
 * CRM/email integration (e.g. Resend, HubSpot, a webhook).
 */
export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Some fields need attention. Check the form and try again." };

  console.info("[contact] new enquiry", { ...parsed.data, details: `${parsed.data.details.slice(0, 80)}…` });
  return { ok: true };
}
