import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

const VALID_ACTION_TYPES = new Set(["INFO", "LINK", "REPLY", "CREDENTIAL", "APPROVE", "ATTACHMENT"]);

async function requireAdmin(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 }) };
  if (session.role !== "ADMIN") return { error: NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 }) };
  return { session };
}

function toTemplate(row) {
  return {
    id: row.id,
    sequenceNumber: row.sequenceNumber,
    senderName: row.senderName,
    senderEmail: row.senderEmail,
    subject: row.subject,
    preview: row.preview,
    body: row.body,
    tag: row.tag,
    actionType: row.actionType.toLowerCase(),
    actionLabel: row.actionLabel,
    href: row.href,
    approveLabel: row.approveLabel,
    declineLabel: row.declineLabel,
    attachmentName: row.attachmentName,
    attachmentSize: row.attachmentSize,
    replyPrompt: row.replyPrompt,
    isPhishing: row.isPhishing,
    phishingLevel: row.phishingLevel,
    phishingNotes: row.phishingNotes,
    sentAt: row.sentAt,
  };
}

export async function GET(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const templates = await prisma.internalEmail.findMany({ orderBy: { sequenceNumber: "asc" } });
  return NextResponse.json({ success: true, templates: templates.map(toTemplate) });
}

export async function POST(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();

  if (!body.senderName?.trim() || !body.senderEmail?.trim() || !body.subject?.trim() || !body.body?.trim()) {
    return NextResponse.json(
      { success: false, message: "Sender name, sender email, subject, and body are required." },
      { status: 400 }
    );
  }

  const actionType = String(body.actionType ?? "INFO").toUpperCase();
  if (!VALID_ACTION_TYPES.has(actionType)) {
    return NextResponse.json({ success: false, message: "Invalid action type." }, { status: 400 });
  }

  // This instrument's 21-email sequence is fixed by research design. New templates
  // are appended after the current last position rather than inserted into it.
  const last = await prisma.internalEmail.findFirst({ orderBy: { sequenceNumber: "desc" } });
  const sequenceNumber = (last?.sequenceNumber ?? 0) + 1;

  const created = await prisma.internalEmail.create({
    data: {
      sequenceNumber,
      senderName: body.senderName.trim(),
      senderEmail: body.senderEmail.trim(),
      subject: body.subject.trim(),
      preview: body.preview?.trim() || body.body.trim().slice(0, 120),
      body: body.body.trim(),
      tag: body.tag?.trim() || "internal",
      actionType,
      actionLabel: body.actionLabel?.trim() || null,
      href: body.href?.trim() || null,
      approveLabel: body.approveLabel?.trim() || null,
      declineLabel: body.declineLabel?.trim() || null,
      attachmentName: body.attachmentName?.trim() || null,
      attachmentSize: body.attachmentSize?.trim() || null,
      replyPrompt: body.replyPrompt?.trim() || null,
      isPhishing: Boolean(body.isPhishing),
      phishingLevel: body.phishingLevel?.trim() || null,
      phishingNotes: body.phishingNotes?.trim() || null,
      sentAt: body.sentAt ? new Date(body.sentAt) : new Date(),
    },
  });

  // Deliver the new email to every existing employee's inbox immediately,
  // rather than waiting for their next lazy-seed (which only fires once, ever).
  const employees = await prisma.employeeAccount.findMany({ select: { employeeId: true } });
  if (employees.length > 0) {
    await prisma.employeeEmail.createMany({
      data: employees.map((e) => ({ employeeId: e.employeeId, emailId: created.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ success: true, template: toTemplate(created) }, { status: 201 });
}
