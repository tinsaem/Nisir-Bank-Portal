import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session)
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const categoriesParam = searchParams.get("categories");

  const where = { isActive: true };
  if (categoriesParam) {
    where.category = { in: categoriesParam.split(",").map((c) => c.trim()) };
  }

  const documents = await prisma.document.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      fileName: true,
      storedName: true,
      fileSize: true,
      mimeType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, documents });
}
