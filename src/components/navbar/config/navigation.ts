
export const profileRouteMap: Record<string, string> = {
  admin: "/admin/applications",
  account_manager: "/account-manager/applications",
  partner: "/partner/profile",
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