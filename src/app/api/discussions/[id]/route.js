import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  try {
    const { id } = await params;
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
    if (!discussion) return NextResponse.json({ success: false, message: "Discussion not found." }, { status: 404 });

    // Attach reactions for the post and all replies
    const targetIds = [id, ...discussion.replies.map((r) => r.id)];
    const reactions = await prisma.discussionReaction.findMany({
      where: { targetId: { in: targetIds } },
      select: { targetId: true, employeeId: true, emoji: true },
    });

    const withReactions = {
      ...discussion,
      reactions: reactions.filter((r) => r.targetId === id),
      replies: discussion.replies.map((reply) => ({
        ...reply,
        reactions: reactions.filter((r) => r.targetId === reply.id),
      })),
    };

    return NextResponse.json({ success: true, discussion: withReactions });
  } catch (err) {
    console.error("[discussion GET]", err);
    return NextResponse.json({ success: false, message: "Failed to load thread." }, { status: 500 });
  }
}
