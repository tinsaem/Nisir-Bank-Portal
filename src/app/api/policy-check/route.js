import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

// GET — return all active questions with shuffled choices (no correct flag exposed)
export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  try {
    const questions = await prisma.policyQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { choices: { orderBy: { order: "asc" } } },
    });

    // Strip isCorrect so client can't cheat
    const safe = questions.map((q) => ({
      id: q.id,
      question: q.question,
      explanation: q.explanation,
      choices: q.choices.map((c) => ({ id: c.id, text: c.text })),
    }));

    return NextResponse.json({ success: true, questions: safe });
  } catch (err) {
    console.error("[policy-check GET]", err);
    return NextResponse.json({ success: false, message: "Failed to load questions." }, { status: 500 });
  }
}
