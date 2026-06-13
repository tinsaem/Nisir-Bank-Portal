import { NextResponse } from "next/server";
import { generateTempPassword, deriveOrgEmail, maskEmail, sendCredentialsEmail } from "@/lib/email";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const { fullName, employeeId, phone } = body ?? {};

  if (!fullName?.trim() || !employeeId?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { success: false, message: "Full name, Employee ID, and phone number are all required." },
      { status: 400 }
    );
  }

  // Validate employee ID format (e.g. E-10234)
  if (!/^[A-Za-z0-9\-]+$/.test(employeeId.trim())) {
    return NextResponse.json(
      { success: false, message: "Employee ID contains invalid characters." },
      { status: 400 }
    );
  }

  const orgEmail    = deriveOrgEmail(fullName);
  const maskedEmail = maskEmail(orgEmail);
  const tempPassword = generateTempPassword();

  try {
    await sendCredentialsEmail({
      toEmail:      orgEmail,
      fullName:     fullName.trim(),
      employeeId:   employeeId.trim().toUpperCase(),
      tempPassword,
    });
  } catch (err) {
    console.error("[request-credentials] email send failed:", err?.message);
    return NextResponse.json(
      { success: false, message: "We could not dispatch your credentials email. Please contact Security Operations." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success:      true,
    maskedEmail,
    message:      `Credentials sent to ${maskedEmail}. Check your inbox and sign in with your Employee ID.`,
  });
}
