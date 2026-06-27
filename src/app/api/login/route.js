import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12h
const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30d

const INVALID_CREDENTIALS = {
  success: false,
  message: "Invalid Employee ID or Password.",
};

export async function POST(req) {
  try {
    const body = await req.json();
    const employeeId = body.employee_id?.trim();
    const password = body.password;
    const rememberMe = Boolean(body.remember_me);

    if (!employeeId || !password) {
      return NextResponse.json(
        { success: false, message: "Employee ID and Password are required." },
        { status: 400 }
      );
    }

    const account = await prisma.employeeAccount.findUnique({
      where: { employeeId },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: `No account found for ID: "${employeeId}"` },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, account.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: `Wrong password for ID: "${employeeId}"` },
        { status: 401 }
      );
    }

    const hrEmployee = await prisma.hrEmployee.findUnique({
      where: { employeeId },
    });

    const duration = rememberMe ? REMEMBER_DURATION_MS : SESSION_DURATION_MS;

    const token = await createSessionToken({
      employeeId: account.employeeId,
      role: account.role,
      exp: Date.now() + duration,
    });

    const redirectTo =
      account.role === "ADMIN" ? "/admin_dashboard" : "/employee_dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      redirectTo,
      user: {
        employeeId: account.employeeId,
        role: account.role,
        fullName: hrEmployee?.fullName ?? account.employeeId,
        mustResetPassword: account.mustResetPassword,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: duration / 1000,
    });

    return response;
  } catch (err) {
    console.error("[login] unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "Server error: " + err.message },
      { status: 500 }
    );
  }
}
