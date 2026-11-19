import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Notifications from "./Notifications";

const push = jest.fn();
const markAsRead = jest.fn().mockResolvedValue(undefined);
const refetch = jest.fn().mockResolvedValue(undefined);
const notifications = [{
  id: "notification-1", type: "new_application", title: "submitted a new application",
  body: "Review the documents and assign it for checking.", application_id: "app-1",
  created_at: "2026-11-01T00:00:00Z", read_at: null,
  data: { student_name: "Ruqayyah Zhang", university_name: "Limkokwing University", actor_name: "Fatima Yusuf", actor_role: "partner", stage_name: "Application Review", status_name: "New Application" },
}];
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("hooks/useMe", () => ({ useMe: () => ({ user: { role: "admin" } }) }));
jest.mock("./NotificationAvatar", () => ({ __esModule: true, default: () => <span data-testid="avatar" /> }));
jest.mock("../hooks", () => ({
  useAllNotifications: () => ({ notifications, total: 1, loading: false, error: null, refetch }),
  useUnreadCount: () => ({ unreadCount: 1, refetch }),
  useMarkAsRead: () => ({ markAsRead }),
  useMarkAllAsRead: () => ({ markAllAsRead: jest.fn(), loading: false }),
}));

it("shows a compact notification and preserves mark-read and navigation", async () => {
  const user = userEvent.setup();
  render(<Notifications applicationBasePath="/admin/applications" />);
  const heading = await screen.findByText("Ruqayyah Zhang — New application");
  expect(screen.getByText("Review the documents and assign it for checking.")).toBeInTheDocument();
  expect(screen.queryByText(/Limkokwing/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Fatima Yusuf/)).not.toBeInTheDocument();
  expect(screen.queryByText("Application Review")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Unread" })).toBeInTheDocument();
  // No separate View button: the whole row is the link.
  expect(screen.queryByRole("link", { name: "View application" })).not.toBeInTheDocument();
  await user.click(heading);
  await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/applications/app-1"));
  expect(markAsRead).toHaveBeenCalledWith("notification-1");
});

it("opens a notification from the keyboard", async () => {
  const user = userEvent.setup();
  push.mockClear();
  render(<Notifications applicationBasePath="/admin/applications" />);
  const row = (await screen.findByText("Ruqayyah Zhang — New application")).closest('[role="link"]') as HTMLElement;
  row.focus();
  await user.keyboard("{Enter}");
  await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/applications/app-1"));
});
