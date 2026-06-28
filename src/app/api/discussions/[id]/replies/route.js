import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { body: text } = body;

  if (!text?.trim()) {
    return NextResponse.json({ success: false, message: "Reply content is required." }, { status: 400 });
  }

  try {
    const { id } = await params;
    const discussion = await prisma.discussion.findUnique({ where: { id }, select: { id: true } });
    if (!discussion) return NextResponse.json({ success: false, message: "Discussion not found." }, { status: 404 });

    const hr = await prisma.hrEmployee.findUnique({
      where: { employeeId: session.employeeId },
      select: { fullName: true },
    });
    const authorName = hr?.fullName ?? session.employeeId;

    const reply = await prisma.discussionReply.create({
      data: { discussionId: id, employeeId: session.employeeId, authorName, body: text.trim() },
    });

    return NextResponse.json({ success: true, reply }, { status: 201 });
  } catch (err) {
    console.error("[reply POST]", err);
    return NextResponse.json({ success: false, message: "Failed to post reply." }, { status: 500 });
  }
}
