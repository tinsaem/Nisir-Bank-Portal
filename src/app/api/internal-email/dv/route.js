import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

// Lets an external landing page (e.g. the simulated EBCA survey) record DV2
// against a participant + email template without needing the per-delivery
// row id, which the participant's browser never sees once it navigates away
// from the inbox.
export async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json();
  const templateId = body.templateId;
  const dv = body.dv;

  if (!templateId || (dv !== "dv1" && dv !== "dv2")) {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const existing = await prisma.employeeEmail.findUnique({
    where: { employeeId_emailId: { employeeId: session.employeeId, emailId: templateId } },
  });
  if (!existing) {
    return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });
  }

  const data = {};
  if (!existing.dv1ClickedAt) data.dv1ClickedAt = new Date();
  if (dv === "dv2" && !existing.dv2SubmittedAt) data.dv2SubmittedAt = new Date();

  if (Object.keys(data).length > 0) {
    await prisma.employeeEmail.update({ where: { id: existing.id }, data });
  }

  return NextResponse.json({ success: true });
}
