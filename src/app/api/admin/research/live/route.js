import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { getParticipantGroup } from "@/lib/participantGroup";

const ACTED_STATUSES = new Set(["REPLIED", "DONE", "APPROVED", "DECLINED", "DOWNLOADED", "VERIFIED"]);

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const [accounts, hrEmployees, deliveries] = await Promise.all([
    prisma.employeeAccount.findMany({ where: { role: "EMPLOYEE" } }),
    prisma.hrEmployee.findMany(),
    prisma.employeeEmail.findMany({ include: { email: { select: { sequenceNumber: true, isPhishing: true } } } }),
  ]);

  const hrMap = new Map(hrEmployees.map((h) => [h.employeeId, h.fullName]));
  const byEmployee = new Map();
  for (const d of deliveries) {
    if (!byEmployee.has(d.employeeId)) byEmployee.set(d.employeeId, []);
    byEmployee.get(d.employeeId).push(d);
  }

  const rows = accounts.map((account) => {
    const employeeId = account.employeeId;
    const employeeDeliveries = byEmployee.get(employeeId) ?? [];
    const readDeliveries = employeeDeliveries.filter((d) => d.isRead);
    const currentEmailNumber = readDeliveries.reduce((max, d) => Math.max(max, d.email.sequenceNumber), 0);
    const phishingActionsTaken = employeeDeliveries.filter((d) => d.email.isPhishing && ACTED_STATUSES.has(d.actionStatus)).length;

    let status = "not_started";
    if (account.sessionCompletedAt) status = "complete";
    else if (account.sessionStartedAt) status = "in_progress";

    const durationSeconds = account.sessionStartedAt
      ? Math.round(
          ((account.sessionCompletedAt ? new Date(account.sessionCompletedAt) : new Date()) -
            new Date(account.sessionStartedAt)) /
            1000
        )
      : null;

    return {
      employeeId,
      fullName: hrMap.get(employeeId) || employeeId,
      group: getParticipantGroup(employeeId),
      status,
      currentEmailNumber,
      emailsRead: readDeliveries.length,
      phishingActionsTaken,
      sessionStartedAt: account.sessionStartedAt,
      durationSeconds,
      complete: Boolean(account.sessionCompletedAt),
    };
  });

  rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true }));

  return NextResponse.json({ success: true, rows });
}
