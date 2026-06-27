import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSessionToken } from "@/lib/session";

export async function GET() {
  const steps = {};
  try {
    // Step 1: env vars
    steps.dbUrl = !!process.env.DATABASE_URL;
    steps.sessionSecret = !!process.env.SESSION_SECRET;

    // Step 2: find account
    const account = await prisma.employeeAccount.findUnique({
      where: { employeeId: "ADMIN" },
    });
    steps.accountFound = !!account;
    if (!account) return NextResponse.json({ steps });

    // Step 3: password check
    steps.passwordMatch = await bcrypt.compare("Admin@Nisir2026!", account.passwordHash);

    // Step 4: session token creation
    const token = await createSessionToken({
      employeeId: account.employeeId,
      role: account.role,
      exp: Date.now() + 3600000,
    });
    steps.tokenCreated = token.length > 0;

    return NextResponse.json({ steps });
  } catch (err) {
    return NextResponse.json({ steps, error: err.message, stack: err.stack }, { status: 500 });
  }
}
