import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  // Wipes every employee's read/action progress. Templates are untouched —
  // the next time each employee opens their inbox it lazy-reseeds from scratch.
  const { count } = await prisma.employeeEmail.deleteMany({});

  // Also wipes every employee's ISP self-check quiz attempts so the quiz
  // restarts fresh. Question/choice content is untouched.
  const { count: attemptCount } = await prisma.policyAttempt.deleteMany({});

  // Clears session-start/completion timestamps so the Live Sessions view
  // (Research Dashboard → Live tab) stops showing stale "in progress" /
  // "complete" rows for employees who already went through the experiment.
  await prisma.employeeAccount.updateMany({
    data: { sessionStartedAt: null, sessionCompletedAt: null },
  });

  return NextResponse.json({ success: true, deletedCount: count, deletedAttemptCount: attemptCount });
}
