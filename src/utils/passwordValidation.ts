
export interface PasswordRequirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

/** Single source of truth for what makes a password acceptable — the live
 *  checklist, the submit-button gate, and validateNewPassword's error
 *  message below all derive from this, so they can't drift apart. */
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: "length", label: "At least 12 characters", test: (p) => p.length >= 12 },
  { key: "letter", label: "At least 1 letter", test: (p) => /[A-Za-z]/.test(p) },
  { key: "digit", label: "At least 1 number", test: (p) => /\d/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (!isPasswordValid(password)) {
    return "Password must be at least 12 characters, with at least 1 letter and 1 number";
  }
  return undefined;
}
