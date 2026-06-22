import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getParticipantMatrix, rowsToMatrixCsv, rowsToWideCsv, getFullExportCsv } from "@/lib/research";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const format = new URL(req.url).searchParams.get("format") || "matrix";

  let csv;
  if (format === "wide") {
    const { phishingEmails, rows } = await getParticipantMatrix();
    csv = rowsToWideCsv(phishingEmails, rows);
  } else if (format === "full") {
    csv = await getFullExportCsv();
  } else {
    const { phishingEmails, rows } = await getParticipantMatrix();
    csv = rowsToMatrixCsv(phishingEmails, rows);
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nisir-bank-research-${format}.csv"`,
    },
  });
}
