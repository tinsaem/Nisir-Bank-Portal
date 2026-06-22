import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

const VALID_ACTION_STATUSES = new Set([
  "REPLIED",
  "DONE",
  "APPROVED",
  "DECLINED",
  "DOWNLOADING",
  "DOWNLOADED",
  "VERIFYING",
  "VERIFIED",
]);

export async function PATCH(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.employeeEmail.findUnique({
    where: { id },
    include: { email: { select: { sequenceNumber: true } } },
  });
  if (!existing || existing.employeeId !== session.employeeId) {
    return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });
  }

  const body = await req.json();
  const data = {};

  if (typeof body.read === "boolean") {
    data.isRead = body.read;
    if (body.read && !existing.openedAt) {
      data.openedAt = new Date();
    }
  }

  if (typeof body.archived === "boolean") {
    data.isArchived = body.archived;
  }

  if (body.action && typeof body.action.status === "string") {
    const status = body.action.status.toUpperCase();
    if (!VALID_ACTION_STATUSES.has(status)) {
      return NextResponse.json({ success: false, message: "Invalid action status." }, { status: 400 });
    }
    data.actionStatus = status;
    data.actionAt = new Date();
    // Only "REPLIED" carries free-text content; other actions never persist
    // anything the employee typed (e.g. the credential-form fields).
    data.actionText = status === "REPLIED" ? String(body.action.text ?? "").slice(0, 2000) : null;
  }

  // Research DVs: recorded independently of the UI-facing actionStatus so click
  // (DV1) and submit (DV2) timing survive regardless of actionType.
  if (body.dv1 === true && !existing.dv1ClickedAt) {
    data.dv1ClickedAt = new Date();
  }
  if (body.dv2 === true) {
    if (!existing.dv1ClickedAt && !data.dv1ClickedAt) data.dv1ClickedAt = new Date();
    if (!existing.dv2SubmittedAt) data.dv2SubmittedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, message: "No valid fields to update." }, { status: 400 });
  }

  const updated = await prisma.employeeEmail.update({ where: { id }, data });

  // Mark the participant's session complete once the fixed-sequence final email is opened.
  if (data.isRead && existing.email.sequenceNumber === 21) {
    await prisma.employeeAccount.updateMany({
      where: { employeeId: session.employeeId, sessionCompletedAt: null },
      data: { sessionCompletedAt: new Date() },
    });
  }

  return NextResponse.json({
    success: true,
    email: {
      id: updated.id,
      isRead: updated.isRead,
      isArchived: updated.isArchived,
      actionStatus: updated.actionStatus.toLowerCase(),
      actionText: updated.actionText,
      actionAt: updated.actionAt,
    },
  });
}
