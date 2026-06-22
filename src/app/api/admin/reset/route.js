import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  // Wipes every employee's read/action progress. Templates are untouched —
  // the next time each employee opens their inbox it lazy-reseeds from scratch.
  const { count } = await prisma.employeeEmail.deleteMany({});

  return NextResponse.json({ success: true, deletedCount: count });
}
