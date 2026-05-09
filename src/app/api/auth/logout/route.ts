import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (token && API_URL) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Backend logout failure is non-fatal — we still clear local session.
    }
  }

  // Return 200 — client handles navigation with a relative URL so the
  // public domain is always correct regardless of deployment environment.
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("token");
  res.cookies.delete("userRole");
  return res;
}
