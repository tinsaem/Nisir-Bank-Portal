import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

// Lets the client recover "currentUser" from the real httpOnly session cookie
// when sessionStorage is empty (e.g. a link opened in a new tab) instead of
// bouncing straight to the login page even though the cookie is still valid.
export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const account = await prisma.employeeAccount.findUnique({
    where: { employeeId: session.employeeId },
  });
  if (!account) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const hrEmployee = await prisma.hrEmployee.findUnique({
    where: { employeeId: account.employeeId },
  });

  return NextResponse.json({
    success: true,
    user: {
      employeeId: account.employeeId,
      role: account.role,
      fullName: hrEmployee?.fullName ?? account.employeeId,
      mustResetPassword: account.mustResetPassword,
    },
  });
}
