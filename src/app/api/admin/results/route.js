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

  const accounts = await prisma.employeeAccount.findMany({ where: { role: "EMPLOYEE" } });
  const hrEmployees = await prisma.hrEmployee.findMany();
  const hrMap = new Map(hrEmployees.map((h) => [h.employeeId, h.fullName]));

  const deliveries = await prisma.employeeEmail.findMany({
    where: { employeeId: { in: accounts.map((a) => a.employeeId) } },
    select: {
      employeeId: true,
      isRead: true,
      dv1ClickedAt: true,
      email: { select: { id: true, isPhishing: true } },
    },
  });

  const statsByEmployee = new Map(
    accounts.map((a) => [
      a.employeeId,
      {
        employeeId: a.employeeId,
        fullName: hrMap.get(a.employeeId) || a.employeeId,
        totalEmails: 0,
        readCount: 0,
        phishing008: 0,
        phishing014: 0,
        phishing019: 0,
      },
    ])
  );

  for (const delivery of deliveries) {
    const stat = statsByEmployee.get(delivery.employeeId);
    if (!stat) continue;

    stat.totalEmails += 1;
    if (delivery.isRead) stat.readCount += 1;

    if (delivery.email.id === "email-008" && delivery.dv1ClickedAt) stat.phishing008 = 1;
    if (delivery.email.id === "email-014" && delivery.dv1ClickedAt) stat.phishing014 = 1;
    if (delivery.email.id === "email-019" && delivery.dv1ClickedAt) stat.phishing019 = 1;
  }

  return NextResponse.json({ success: true, results: Array.from(statsByEmployee.values()) });
}
