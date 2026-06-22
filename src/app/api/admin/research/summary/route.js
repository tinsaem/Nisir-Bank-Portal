import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getGroupSummary } from "@/lib/research";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const summary = await getGroupSummary();
  return NextResponse.json({ success: true, ...summary });
}
