export function validateServiceName(value: string): string {
  if (!value.trim()) return "Service name is required.";
  if (value.trim().length < 3) return "Name must be at least 3 characters.";
  if (value.trim().length > 255) return "Name must not exceed 255 characters.";
  return "";
}
