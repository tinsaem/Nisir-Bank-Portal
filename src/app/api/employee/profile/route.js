import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session)
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const hr = await prisma.hrEmployee.findUnique({
    where: { employeeId: session.employeeId },
    select: { fullName: true, department: true, employeeId: true, email: true },
  });

  if (!hr)
    return NextResponse.json({ success: false, message: "Employee record not found." }, { status: 404 });

  return NextResponse.json({ success: true, profile: hr });
}
