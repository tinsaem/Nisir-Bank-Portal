import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

function generateTempPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;

  const pick = (s) => s[randomInt(s.length)];

  const parts = [
    pick(upper),
    pick(upper),
    pick(lower),
    pick(lower),
    pick(lower),
    pick(digits),
    pick(digits),
    pick(all),
    pick(all),
    pick(all),
  ];

  for (let i = parts.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join("");
}

async function sendCredentialEmail(to, fullName, employeeId, tempPassword) {
  if (process.env.MAIL_MODE === "console") {
    console.log("======================================");
    console.log("DEV MODE: Credential email not sent");
    console.log("To:", to);
    console.log("Full Name:", fullName);
    console.log("Employee ID:", employeeId);
    console.log("Temporary Password:", tempPassword);
    console.log("======================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      "Nisir Bank SETA Portal <noreply@nisirbank.com>",
    to,
    subject: "Your Nisir Bank SETA Portal Credentials",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
        <h2 style="color:#1e3a5f;">Nisir Bank SETA Portal - Credential Issuance</h2>

        <p>Dear ${fullName},</p>

        <p>
          Your portal account has been created. Use the credentials below to sign in
          for the first time. You will be prompted to set a new password immediately
          after your first login.
        </p>

        <table style="border-collapse:collapse;width:100%;margin:24px 0;">
          <tr style="background:#f4f6f9;">
            <td style="padding:12px 16px;font-weight:600;width:180px;">Employee ID</td>
            <td style="padding:12px 16px;font-family:monospace;">${employeeId}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-weight:600;">Temporary Password</td>
            <td style="padding:12px 16px;font-family:monospace;font-size:1.15em;letter-spacing:0.05em;">${tempPassword}</td>
          </tr>
        </table>

        <p style="color:#c0392b;font-weight:600;">
          This password is single-use. You must change it on first login.
        </p>

        <p style="color:#666;font-size:0.875em;">
          If you did not request portal access, contact IT support immediately and
          do not use these credentials.
        </p>

        <hr style="border:none;border-top:1px solid #e0e0e0;margin:32px 0;" />

        <p style="color:#999;font-size:0.8em;">
          Nisir Bank SETA Portal - Confidential
        </p>
      </div>
    `,
  });
}

export async function POST(req) {
  let account = null;

  try {
    const body = await req.json();
    const employeeId = body.employeeId?.trim();

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required.",
        },
        { status: 400 }
      );
    }

    const existingAccount = await prisma.employeeAccount.findUnique({
      where: {
        employeeId,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "Credentials have already been issued for this Employee ID.",
        },
        { status: 409 }
      );
    }

    const hrEmployee = await prisma.hrEmployee.findUnique({
      where: {
        employeeId,
      },
    });

    if (!hrEmployee) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Employee ID not found in HR records. Verify your ID or contact HR.",
        },
        { status: 404 }
      );
    }

    if (!hrEmployee.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This employee record is inactive. Contact HR to reactivate before requesting access.",
        },
        { status: 403 }
      );
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    account = await prisma.employeeAccount.create({
      data: {
        employeeId,
        passwordHash,
        role: "EMPLOYEE",
        mustResetPassword: true,
      },
    });

    await sendCredentialEmail(
      hrEmployee.email,
      hrEmployee.fullName,
      employeeId,
      tempPassword
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Your credentials have been sent to your institutional email address. Check your inbox.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Request credentials error:", error);

    if (account) {
      try {
        await prisma.employeeAccount.delete({
          where: {
            id: account.id,
          },
        });
      } catch (cleanupError) {
        console.error(
          "Account cleanup failed after email error. Manual intervention may be needed:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to issue credentials. Please try again or contact IT support.",
      },
      { status: 500 }
    );
  }
}