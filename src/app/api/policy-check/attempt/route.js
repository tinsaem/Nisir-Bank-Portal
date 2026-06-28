import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

// POST — record one answer and return correctness + explanation
export async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { questionId, choiceId } = body;
  if (!questionId || !choiceId)
    return NextResponse.json({ success: false, message: "questionId and choiceId are required." }, { status: 400 });

  try {
    const choice = await prisma.policyChoice.findUnique({
      where: { id: choiceId },
      include: { question: { select: { id: true, explanation: true } } },
    });

    if (!choice || choice.questionId !== questionId)
      return NextResponse.json({ success: false, message: "Invalid question/choice." }, { status: 400 });

    const isCorrect = choice.isCorrect;

    await prisma.policyAttempt.create({
      data: { employeeId: session.employeeId, questionId, choiceId, isCorrect },
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      explanation: choice.question.explanation ?? null,
    });
  } catch (err) {
    console.error("[policy-check attempt]", err);
    return NextResponse.json({ success: false, message: "Failed to record attempt." }, { status: 500 });
  }
}
