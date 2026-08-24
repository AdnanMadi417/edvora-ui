export function daysSince(dateString: string): number {
  if (!dateString) return 0;
  const updatedDate = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - updatedDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function formatGender(value: boolean | null): string {
  if (value === null) return "Not provided";
  return value ? "Male" : "Female";
}
