
export const profileRouteMap: Record<string, string> = {
  admin: "/admin/profile",
  account_manager: "/account-manager/profile",
  partner: "/partner/profile",
  reviewer: "/reviewer/profile",
  data_entry: "/data-entry/profile",
};

export const notificationsRouteMap: Record<string, string> = {
  admin: "/admin/notifications",
  account_manager: "/account-manager/notifications",
  partner: "/partner/notifications",
  data_entry: "/data-entry/notifications",
  reviewer: "/reviewer/notifications",
};

// Roles without an applications view of their own (data_entry, reviewer) are
// intentionally omitted — notifications for them don't link out to an application.
export const applicationsRouteMap: Record<string, string> = {
  admin: "/admin/applications",
  account_manager: "/account-manager/applications",
  partner: "/partner/applications",
};

// partner_signed_up notifications link to the partner's detail page instead
// of an application — only the two roles that actually receive that
// notification (admin, reviewer) need an entry here.
export const partnersRouteMap: Record<string, string> = {
  admin: "/admin/advisors",
  reviewer: "/reviewer/advisors",
};