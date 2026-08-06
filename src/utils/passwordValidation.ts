
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return "Password must be at least 8 characters, with at least 1 letter and 1 number";
  }
  return undefined;
}
