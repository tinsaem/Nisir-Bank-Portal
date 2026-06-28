import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
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

export async function GET(req) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, documents });
  } catch (err) {
    console.error("[admin/documents GET]", err);
    return NextResponse.json({ success: false, message: "Failed to load documents." }, { status: 500 });
  }
}

export async function POST(req) {
  const { error, session } = await requireAdmin(req);
  if (error) return error;

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, message: "Failed to parse upload." }, { status: 400 });
  }

  const file = formData.get("file");
  const title = (formData.get("title") ?? "").toString().trim();
  const description = (formData.get("description") ?? "").toString().trim() || null;
  const category = (formData.get("category") ?? "general").toString().trim();

  if (!file || typeof file === "string") {
    return NextResponse.json({ success: false, message: "No file attached." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ success: false, message: "Title is required." }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const storedName = `${randomUUID()}${ext}`;
  const filePath = path.join(DOCS_DIR, storedName);

  let bytes;
  try {
    bytes = await file.arrayBuffer();
    await mkdir(DOCS_DIR, { recursive: true });
    await writeFile(filePath, Buffer.from(bytes));
  } catch (err) {
    console.error("[admin/documents POST] file write", err);
    return NextResponse.json({ success: false, message: "Failed to save file to disk." }, { status: 500 });
  }

  try {
    const document = await prisma.document.create({
      data: {
        title,
        description,
        category,
        fileName:   file.name,
        storedName,
        fileSize:   bytes.byteLength,
        mimeType:   file.type || "application/octet-stream",
        uploadedBy: session.employeeId,
      },
    });
    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err) {
    console.error("[admin/documents POST] db", err);
    return NextResponse.json({ success: false, message: "Failed to save document record." }, { status: 500 });
  }
}
