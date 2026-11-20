export interface LanguageCenter {
  id: string;
  university_id: string;
  centre_type?: "university_linked" | "independent";
  logo_url?: string;
  images?: { id: string; name: string; url: string }[];
  branches?: { id: string; name: string; location: string; address: string }[];
  name: string;
  location: string;
  email: string;
  phone: string;
  description: string;
  is_active: boolean;
}
export type LanguageCenterInput = Omit<LanguageCenter, "id">;

export function validateLanguageCenter(
  value: LanguageCenterInput
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!value.name.trim()) errors.name = "Enter the language center name.";
  if (!value.university_id) errors.university_id = "Choose a university.";
  if (!value.location.trim()) errors.location = "Enter the center location.";
  if (
    value.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())
  )
    errors.email = "Enter a valid email address.";
  return errors;
}

/**
 * The short place a list shows: the last two parts of the address, usually the
 * city and state ("Level 3, Learning Centre, Bukit Jalil, Kuala Lumpur" →
 * "Bukit Jalil, Kuala Lumpur"). Details pages show the full address.
 */
export function cityState(location: string | null | undefined): string {
  const parts = (location ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  return parts.slice(-2).join(", ");
}
