import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

const DOCS_DIR = path.join(process.cwd(), "public", "documents");

async function requireAdmin(req) {
  const session = await getSessionFromRequest(req);
  if (!session)
    return { error: NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 }) };
  if (session.role !== "ADMIN")
    return { error: NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 }) };
  return { session };
}

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(body.title       !== undefined && { title:       body.title.trim() }),
        ...(body.description !== undefined && { description: body.description.trim() || null }),
        ...(body.category    !== undefined && { category:    body.category }),
        ...(body.isActive    !== undefined && { isActive:    body.isActive }),
      },
    });
    return NextResponse.json({ success: true, document });
  } catch (err) {
    console.error("[admin/documents PATCH]", err);
    return NextResponse.json({ success: false, message: "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;

  try {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });

    try { await unlink(path.join(DOCS_DIR, doc.storedName)); } catch { /* file may already be gone */ }

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/documents DELETE]", err);
    return NextResponse.json({ success: false, message: "Failed to delete document." }, { status: 500 });
  }
}
