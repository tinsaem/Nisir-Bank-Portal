import nodemailer from "nodemailer";
import crypto from "crypto";

export function generateTempPassword() {
  const upper  = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower  = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all    = upper + lower + digits;
  const random = crypto.randomBytes(10);
  return (
    upper[random[0] % upper.length] +
    digits[random[1] % digits.length] +
    Array.from({ length: 6 }, (_, i) => all[random[i + 2] % all.length]).join("") +
    lower[random[8] % lower.length] +
    digits[random[9] % digits.length]
  );
}

export function deriveOrgEmail(fullName) {
  const parts = fullName.trim().toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  return `${parts.join(".")}@nisirbank.com`;
}

export function maskEmail(email) {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 3);
  return `${visible}${"*".repeat(Math.max(2, local.length - 3))}@${domain}`;
}

function buildTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendCredentialsEmail({ toEmail, fullName, employeeId, tempPassword }) {
  const transport = buildTransport();

  const firstName = fullName.trim().split(/\s+/)[0];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Nisir Bank SETA Portal Credentials</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                          <span style="font-size:22px;font-weight:900;color:#ffffff;line-height:44px;">N</span>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.05em;">Nisir Bank S.C.</p>
                          <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.65);">Security Operations</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:24px;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                      Your SETA Portal Credentials
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.70);">
                      Keep this information secure — do not share it with anyone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">

              <p style="margin:0 0 20px;font-size:15px;color:#1e293b;line-height:1.6;">
                Dear <strong>${firstName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
                Your request to access the Nisir Bank <strong>Security Education, Training &amp; Awareness (SETA)</strong>
                portal has been verified. Below are your initial login credentials.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #dbeafe;border-radius:12px;margin:0 0 24px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#6b7280;">
                      Your Login Credentials
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:14px;border-bottom:1px solid #e2e8f0;">
                          <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Username / Employee ID</p>
                          <p style="margin:0;font-size:18px;font-weight:700;color:#1e293b;font-family:monospace,monospace;">${employeeId}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:14px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Temporary Password</p>
                          <p style="margin:0;font-size:22px;font-weight:700;color:#1d4ed8;font-family:monospace,monospace;letter-spacing:0.12em;">${tempPassword}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                      &#9888;&nbsp; <strong>Important:</strong> You will be required to change this password
                      immediately upon your first sign-in. Do not share this email or your credentials
                      with anyone, including Nisir Bank staff.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1e293b;">How to get started:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 10px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#1d4ed8;border-radius:50%;width:22px;height:22px;text-align:center;vertical-align:middle;color:#fff;font-size:11px;font-weight:700;">1</td>
                        <td style="padding-left:10px;font-size:13px;color:#475569;">Visit the Nisir Bank SETA Portal at <strong>seta.nisirbank.com</strong></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 10px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#1d4ed8;border-radius:50%;width:22px;height:22px;text-align:center;vertical-align:middle;color:#fff;font-size:11px;font-weight:700;">2</td>
                        <td style="padding-left:10px;font-size:13px;color:#475569;">Enter your Employee ID and the temporary password above</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#1d4ed8;border-radius:50%;width:22px;height:22px;text-align:center;vertical-align:middle;color:#fff;font-size:11px;font-weight:700;">3</td>
                        <td style="padding-left:10px;font-size:13px;color:#475569;">Set a new personal password and complete your profile</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;">
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-align:center;">
                This is an automated message from Nisir Bank Security Operations. Do not reply to this email.
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;text-align:center;">
                &copy; 2026 Nisir Bank S.C. &middot; Licensed by the National Bank of Ethiopia
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transport.sendMail({
    from:    `"Nisir Bank Security Operations" <${process.env.SMTP_FROM || "noreply@nisirbank.com"}>`,
    to:      toEmail,
    subject: "Your Nisir Bank SETA Portal Credentials",
    html,
  });
}
