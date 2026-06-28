import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

async function requireAdmin(req) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 }) };
  if (session.role !== "ADMIN") return { error: NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 }) };
  return { session };
}

// PATCH — update question text, explanation, active status, and replace all choices
export async function PATCH(req, { params }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { question, explanation, isActive, choices } = body;

  try {
    const data = {};
    if (question  !== undefined) data.question    = question.trim();
    if (explanation !== undefined) data.explanation = explanation?.trim() || null;
    if (isActive  !== undefined) data.isActive    = Boolean(isActive);

    // Replace choices if provided
    if (Array.isArray(choices) && choices.length >= 2) {
      if (!choices.some((c) => c.isCorrect))
        return NextResponse.json({ success: false, message: "At least one correct answer is required." }, { status: 400 });

      data.choices = {
        deleteMany: {},
        create: choices.map((c, i) => ({
          text: c.text.trim(),
          isCorrect: Boolean(c.isCorrect),
          order: i,
        })),
      };
    }

    const updated = await prisma.policyQuestion.update({
      where: { id },
      data,
      include: { choices: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (err) {
    console.error("[admin/policy-check PATCH]", err);
    return NextResponse.json({ success: false, message: "Failed to update question." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.policyQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/policy-check DELETE]", err);
    return NextResponse.json({ success: false, message: "Failed to delete question." }, { status: 500 });
  }
}
