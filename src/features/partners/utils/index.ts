const AGENCY_ROLE_LABELS: Record<string, string> = {
  admin: "Agency Admin",
  member: "Team Member",
};

export function formatAgencyRole(role: string): string {
  return AGENCY_ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}
