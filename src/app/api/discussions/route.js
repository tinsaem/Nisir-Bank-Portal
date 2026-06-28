import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  try {
    const discussions = await prisma.discussion.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { replies: true } } },
    });

    // Attach reaction summaries
    const ids = discussions.map((d) => d.id);
    const reactions = ids.length
      ? await prisma.discussionReaction.findMany({
          where: { targetId: { in: ids }, targetType: "discussion" },
          select: { targetId: true, employeeId: true, emoji: true },
        })
      : [];

    const withReactions = discussions.map((d) => ({
      ...d,
      reactions: reactions.filter((r) => r.targetId === d.id),
    }));

    return NextResponse.json({ success: true, discussions: withReactions });
  } catch (err) {
    console.error("[discussions GET]", err);
    return NextResponse.json({ success: true, discussions: [] });
  }
}

export async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, body: text, category } = body;

  if (!title?.trim() || !text?.trim()) {
    return NextResponse.json({ success: false, message: "Title and content are required." }, { status: 400 });
  }

  try {
    const hr = await prisma.hrEmployee.findUnique({
      where: { employeeId: session.employeeId },
      select: { fullName: true },
    });
    const authorName = hr?.fullName ?? session.employeeId;

    const discussion = await prisma.discussion.create({
      data: {
        employeeId: session.employeeId,
        authorName,
        title:      title.trim(),
        body:       text.trim(),
        category:   category?.trim() || "general",
      },
    });
    return NextResponse.json({ success: true, discussion }, { status: 201 });
  } catch (err) {
    console.error("[discussions POST]", err);
    return NextResponse.json({ success: false, message: "Failed to save discussion. Please try again." }, { status: 500 });
  }
}
