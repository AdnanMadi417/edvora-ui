import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
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

  const signInUrl = new URL(`${BASE_PATH}/auth/sign-in`, req.nextUrl.origin);
  const res = NextResponse.redirect(signInUrl, { status: 302 });

  // Delete cookies server-side — works for HttpOnly cookies that JS cannot touch.
  res.cookies.delete("token");
  res.cookies.delete("userRole");

  return res;
}
