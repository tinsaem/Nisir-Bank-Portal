import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const { id: discussionId } = await params;
  const body = await req.json().catch(() => ({}));
  const { emoji, replyId } = body;

  if (!emoji) return NextResponse.json({ success: false, message: "emoji is required." }, { status: 400 });

  const targetId   = replyId ?? discussionId;
  const targetType = replyId ? "reply" : "discussion";

  try {
    const existing = await prisma.discussionReaction.findUnique({
      where: { targetId_employeeId: { targetId, employeeId: session.employeeId } },
    });

    if (existing) {
      if (existing.emoji === emoji) {
        // Same emoji clicked again → remove (toggle off)
        await prisma.discussionReaction.delete({ where: { id: existing.id } });
      } else {
        // Different emoji → replace
        await prisma.discussionReaction.update({ where: { id: existing.id }, data: { emoji } });
      }
    } else {
      const hr = await prisma.hrEmployee.findUnique({
        where: { employeeId: session.employeeId },
        select: { fullName: true },
      });
      await prisma.discussionReaction.create({
        data: {
          targetId,
          targetType,
          employeeId: session.employeeId,
          authorName: hr?.fullName ?? session.employeeId,
          emoji,
        },
      });
    }

    const reactions = await prisma.discussionReaction.findMany({ where: { targetId } });
    return NextResponse.json({ success: true, reactions });
  } catch (err) {
    console.error("[reactions POST]", err);
    return NextResponse.json({ success: false, message: "Failed to save reaction." }, { status: 500 });
  }
}
