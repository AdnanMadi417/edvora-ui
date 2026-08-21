import api from "lib/useApi";
import Cookies from "js-cookie";
import type { ListNotificationsParams, PaginatedNotifications } from "../types";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationsApi = {
  list: (params: ListNotificationsParams) =>
    api.get<PaginatedNotifications>("/me/notifications", {
      params,
      headers: authHeader(),
    }),

  unreadCount: () =>
    api.get<{ count: number }>("/me/notifications/unread-count", {
      headers: authHeader(),
    }),

  markAsRead: (notificationId: string) =>
    api.put(`/me/notifications/${notificationId}/read`, null, {
      headers: authHeader(),
    }),

  markAllAsRead: () =>
    api.put(`/me/notifications/read-all`, null, {
      headers: authHeader(),
    }),
};
