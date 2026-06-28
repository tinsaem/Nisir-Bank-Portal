import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

async function requireAdmin(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 }) };
  if (session.role !== "ADMIN") return { error: NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 }) };
  return { session };
}

export async function GET(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    // Fetch questions + choices without _count (avoids driver-adapter edge cases)
    const questions = await prisma.policyQuestion.findMany({
      orderBy: { order: "asc" },
      include: { choices: { orderBy: { order: "asc" } } },
    });

    // Fetch attempt counts separately with groupBy
    let attemptCounts = [];
    try {
      attemptCounts = await prisma.policyAttempt.groupBy({
        by: ["questionId"],
        _count: { id: true },
      });
    } catch {
      // non-fatal — attempt counts stay at 0 if this fails
    }

    const countMap = Object.fromEntries(
      attemptCounts.map((a) => [a.questionId, a._count.id])
    );

    const result = questions.map((q) => ({
      ...q,
      _count: { attempts: countMap[q.id] ?? 0 },
    }));

    return NextResponse.json({ success: true, questions: result });
  } catch (err) {
    console.error("[admin/policy-check GET]", err);
    return NextResponse.json({
      success: false,
      message: err?.message ?? "Failed to load questions.",
    }, { status: 500 });
  }
}

export async function POST(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { question, explanation, choices } = body;

  if (!question?.trim())
    return NextResponse.json({ success: false, message: "Question text is required." }, { status: 400 });
  if (!Array.isArray(choices) || choices.length < 2)
    return NextResponse.json({ success: false, message: "At least 2 choices are required." }, { status: 400 });
  if (!choices.some((c) => c.isCorrect))
    return NextResponse.json({ success: false, message: "At least one correct answer is required." }, { status: 400 });

  try {
    const maxOrder = await prisma.policyQuestion.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const created = await prisma.policyQuestion.create({
      data: {
        question: question.trim(),
        explanation: explanation?.trim() || null,
        order: nextOrder,
        choices: {
          create: choices.map((c, i) => ({
            text: c.text.trim(),
            isCorrect: Boolean(c.isCorrect),
            order: i,
          })),
        },
      },
      include: { choices: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, question: created }, { status: 201 });
  } catch (err) {
    console.error("[admin/policy-check POST]", err);
    return NextResponse.json({ success: false, message: "Failed to create question." }, { status: 500 });
  }
}
