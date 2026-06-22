import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const deliveries = await prisma.employeeEmail.findMany({
    where: { email: { isPhishing: true } },
    include: { email: { select: { id: true, subject: true, senderName: true, actionType: true } } },
    orderBy: { actionAt: "desc" },
  });

  const hrEmployees = await prisma.hrEmployee.findMany();
  const hrMap = new Map(hrEmployees.map((h) => [h.employeeId, h.fullName]));

  const rows = deliveries.map((d) => ({
    employeeId: d.employeeId,
    fullName: hrMap.get(d.employeeId) || d.employeeId,
    emailId: d.email.id,
    subject: d.email.subject,
    senderName: d.email.senderName,
    isRead: d.isRead,
    clicked: d.actionStatus === "DONE",
    clickedAt: d.actionStatus === "DONE" ? d.actionAt : null,
  }));

  return NextResponse.json({ success: true, clicks: rows });
}
