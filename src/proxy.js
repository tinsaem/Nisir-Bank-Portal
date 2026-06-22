import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function proxy(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (req.nextUrl.pathname.startsWith("/admin_dashboard") || req.nextUrl.pathname.startsWith("/admin/")) &&
    session.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/employee_dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employee_dashboard/:path*",
    "/admin_dashboard/:path*",
    "/admin/:path*",
    "/internal_email/:path*",
  ],
};
