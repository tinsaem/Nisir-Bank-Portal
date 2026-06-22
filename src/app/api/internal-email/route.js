import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

function toResponseItem(row) {
  return {
    id: row.id,
    sequenceNumber: row.email.sequenceNumber,
    sender: row.email.senderName,
    senderEmail: row.email.senderEmail,
    subject: row.email.subject,
    preview: row.email.preview,
    body: row.email.body,
    tag: row.email.tag,
    actionType: row.email.actionType.toLowerCase(),
    actionLabel: row.email.actionLabel,
    href: row.email.href,
    approveLabel: row.email.approveLabel,
    declineLabel: row.email.declineLabel,
    attachmentName: row.email.attachmentName,
    attachmentSize: row.email.attachmentSize,
    replyPrompt: row.email.replyPrompt,
    sentAt: row.email.sentAt,
    isRead: row.isRead,
    isArchived: row.isArchived,
    actionStatus: row.actionStatus.toLowerCase(),
    actionText: row.actionText,
    actionAt: row.actionAt,
    // isPhishing / phishingLevel / phishingNotes are intentionally omitted —
    // never expose simulation metadata to the participant-facing client.
  };
}

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const employeeId = session.employeeId;

  const existingCount = await prisma.employeeEmail.count({ where: { employeeId } });

  if (existingCount === 0) {
    const templates = await prisma.internalEmail.findMany({ select: { id: true } });
    if (templates.length > 0) {
      await prisma.employeeEmail.createMany({
        data: templates.map((t) => ({ employeeId, emailId: t.id })),
        skipDuplicates: true,
      });
    }
  }

  await prisma.employeeAccount.updateMany({
    where: { employeeId, sessionStartedAt: null },
    data: { sessionStartedAt: new Date() },
  });

  // Fixed presentation order — every participant sees emails 1-21 in exactly this sequence.
  const rows = await prisma.employeeEmail.findMany({
    where: { employeeId },
    include: { email: true },
    orderBy: { email: { sequenceNumber: "asc" } },
  });

  return NextResponse.json({ success: true, emails: rows.map(toResponseItem) });
}
