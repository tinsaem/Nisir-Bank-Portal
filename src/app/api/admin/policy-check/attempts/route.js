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
    // All attempts ordered by time so attempt-number ranking is deterministic
    const attempts = await prisma.policyAttempt.findMany({
      orderBy: { attemptedAt: "asc" },
      include: {
        question: { select: { id: true, question: true } },
      },
    });

    if (attempts.length === 0) {
      return NextResponse.json({ success: true, byEmployee: [], summary: { totalEmployees: 0, totalAttempts: 0, firstAttemptCorrectPct: 0 } });
    }

    // Fetch choice texts for all referenced choices
    const choiceIds = [...new Set(attempts.map((a) => a.choiceId))];
    const choices = await prisma.policyChoice.findMany({
      where: { id: { in: choiceIds } },
      select: { id: true, text: true },
    });
    const choiceMap = Object.fromEntries(choices.map((c) => [c.id, c.text]));

    // Fetch all questions so we can show unattempted ones too
    const allQuestions = await prisma.policyQuestion.findMany({
      orderBy: { order: "asc" },
      select: { id: true, question: true, order: true },
    });

    // Fetch employee names from HrEmployee (best source for full name + dept)
    const employeeIds = [...new Set(attempts.map((a) => a.employeeId))];
    const hrEmployees = await prisma.hrEmployee.findMany({
      where: { employeeId: { in: employeeIds } },
      select: { employeeId: true, fullName: true, department: true },
    });
    const empMap = Object.fromEntries(hrEmployees.map((e) => [e.employeeId, e]));

    // Rank attempts: per (employeeId, questionId) sorted by attemptedAt → attempt number 1, 2, 3…
    const rankCounters = {}; // `${employeeId}:${questionId}` → current count
    const enriched = attempts.map((a) => {
      const key = `${a.employeeId}:${a.questionId}`;
      rankCounters[key] = (rankCounters[key] ?? 0) + 1;
      return {
        attemptId:    a.id,
        employeeId:   a.employeeId,
        questionId:   a.questionId,
        questionText: a.question.question,
        choiceId:     a.choiceId,
        choiceText:   choiceMap[a.choiceId] ?? "—",
        isCorrect:    a.isCorrect,
        attemptNumber: rankCounters[key],
        attemptedAt:  a.attemptedAt,
      };
    });

    // Group by employee
    const byEmployeeMap = {};
    for (const a of enriched) {
      if (!byEmployeeMap[a.employeeId]) {
        const hr = empMap[a.employeeId];
        byEmployeeMap[a.employeeId] = {
          employeeId:  a.employeeId,
          name:        hr?.fullName   ?? a.employeeId,
          department:  hr?.department ?? "Unknown",
          attempts:    [],
        };
      }
      byEmployeeMap[a.employeeId].attempts.push(a);
    }

    // For each employee, build a per-question summary with up to N attempt slots
    const byEmployee = Object.values(byEmployeeMap).map((emp) => {
      // Group this employee's attempts by questionId
      const byQ = {};
      for (const a of emp.attempts) {
        if (!byQ[a.questionId]) byQ[a.questionId] = [];
        byQ[a.questionId].push(a); // already sorted asc so attempt numbers are in order
      }

      // Build per-question rows (only for questions they actually tried)
      const questionRows = allQuestions
        .filter((q) => byQ[q.id])
        .map((q) => {
          const qAttempts = byQ[q.id];
          return {
            questionId:   q.id,
            questionText: q.question,
            order:        q.order,
            attempts:     qAttempts.map((a) => ({
              attemptNumber: a.attemptNumber,
              choiceText:    a.choiceText,
              isCorrect:     a.isCorrect,
              attemptedAt:   a.attemptedAt,
            })),
          };
        });

      // How many times has this employee fully completed the quiz?
      const maxAttemptNumber = emp.attempts.reduce((m, a) => Math.max(m, a.attemptNumber), 0);

      // First-attempt score: count questions where attempt #1 is correct
      const firstAttemptCorrect = questionRows.filter(
        (r) => r.attempts.find((a) => a.attemptNumber === 1)?.isCorrect
      ).length;

      // Second-attempt score (if any)
      const questionsWithSecondAttempt = questionRows.filter((r) => r.attempts.some((a) => a.attemptNumber === 2));
      const secondAttemptCorrect = questionsWithSecondAttempt.filter(
        (r) => r.attempts.find((a) => a.attemptNumber === 2)?.isCorrect
      ).length;

      const totalQuestionsAttempted = questionRows.length;
      const totalQuizRuns = maxAttemptNumber;

      return {
        employeeId:             emp.employeeId,
        name:                   emp.name,
        department:             emp.department,
        totalQuestionsAttempted,
        totalAttempts:          emp.attempts.length,
        totalQuizRuns,
        firstAttemptCorrect,
        secondAttemptCorrect:   questionsWithSecondAttempt.length > 0 ? secondAttemptCorrect : null,
        secondAttemptTotal:     questionsWithSecondAttempt.length,
        questionRows,
        lastAttemptedAt:        emp.attempts[emp.attempts.length - 1]?.attemptedAt ?? null,
      };
    });

    // Sort by last activity
    byEmployee.sort((a, b) => new Date(b.lastAttemptedAt) - new Date(a.lastAttemptedAt));

    // Global summary
    const totalAttempts   = enriched.length;
    const totalEmployees  = byEmployee.length;
    const firstAttemptCorrectAll = enriched.filter((a) => a.attemptNumber === 1 && a.isCorrect).length;
    const firstAttemptTotal      = enriched.filter((a) => a.attemptNumber === 1).length;
    const firstAttemptCorrectPct = firstAttemptTotal > 0
      ? Math.round((firstAttemptCorrectAll / firstAttemptTotal) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      summary: { totalEmployees, totalAttempts, firstAttemptCorrectPct },
      byEmployee,
      totalQuestions: allQuestions.length,
    });
  } catch (err) {
    console.error("[admin/policy-check/attempts GET]", err);
    return NextResponse.json({ success: false, message: err?.message ?? "Failed to load attempts." }, { status: 500 });
  }
}
