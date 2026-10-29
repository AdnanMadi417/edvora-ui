import { mock } from "../router";

// Staff profile page: "Send password reset email" button.
mock.post("/auth/forgot-password", ({ body }) => ({
  message: `We sent a password reset link to ${body?.email ?? "your email"}. It expires in 30 minutes.`,
}));
