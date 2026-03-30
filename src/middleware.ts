import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/sign-in", "/unauthorized", "/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  if (pathname === "/auth/sign-in" && token) {
    const role = req.cookies.get("userRole")?.value;
    const destination =
      role === "partner" ? "/partner/applications"
      : role === "account_manager" ? "/account-manager/applications"
      : "/admin/applications";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
