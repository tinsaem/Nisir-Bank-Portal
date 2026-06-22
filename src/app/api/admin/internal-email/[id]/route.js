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

const EDITABLE_STRING_FIELDS = [
  "senderName",
  "senderEmail",
  "subject",
  "preview",
  "body",
  "tag",
  "actionLabel",
  "href",
  "approveLabel",
  "declineLabel",
  "attachmentName",
  "attachmentSize",
  "replyPrompt",
  "phishingLevel",
  "phishingNotes",
];

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.internalEmail.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });
  }

  const body = await req.json();
  const data = {};

  for (const field of EDITABLE_STRING_FIELDS) {
    if (field in body) {
      const value = body[field];
      data[field] = typeof value === "string" && value.trim() ? value.trim() : null;
    }
  }

  if ("actionType" in body) {
    const actionType = String(body.actionType).toUpperCase();
    if (!VALID_ACTION_TYPES.has(actionType)) {
      return NextResponse.json({ success: false, message: "Invalid action type." }, { status: 400 });
    }
    data.actionType = actionType;
  }

  if ("isPhishing" in body) {
    data.isPhishing = Boolean(body.isPhishing);
  }

  if ("sentAt" in body && body.sentAt) {
    data.sentAt = new Date(body.sentAt);
  }

  const updated = await prisma.internalEmail.update({ where: { id }, data });

  return NextResponse.json({
    success: true,
    template: {
      id: updated.id,
      sequenceNumber: updated.sequenceNumber,
      senderName: updated.senderName,
      senderEmail: updated.senderEmail,
      subject: updated.subject,
      preview: updated.preview,
      body: updated.body,
      tag: updated.tag,
      actionType: updated.actionType.toLowerCase(),
      actionLabel: updated.actionLabel,
      href: updated.href,
      approveLabel: updated.approveLabel,
      declineLabel: updated.declineLabel,
      attachmentName: updated.attachmentName,
      attachmentSize: updated.attachmentSize,
      replyPrompt: updated.replyPrompt,
      isPhishing: updated.isPhishing,
      phishingLevel: updated.phishingLevel,
      phishingNotes: updated.phishingNotes,
      sentAt: updated.sentAt,
    },
  });
}

export async function DELETE(req, { params }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.internalEmail.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });
  }

  // onDelete: Cascade on EmployeeEmail.email removes every employee's delivered
  // copy of this template along with it.
  await prisma.internalEmail.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
