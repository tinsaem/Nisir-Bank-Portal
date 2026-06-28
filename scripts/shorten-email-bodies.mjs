import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Shortened email bodies — concise, realistic, preserving all action cues.
// Phishing emails retain all deception indicators.
const updates = [
  {
    seq: 1,
    body: `Dear Employee,

Welcome to Nisir Bank S.C. as a Graduate Trainee. You have been given access to the SETA Portal, which you will use throughout your onboarding to receive official communications and complete your training tasks.

Please treat every message in your inbox as you would a real bank communication — read carefully and take action as required.

To confirm your portal access is working, please use the Reply button below to send a brief acknowledgment to HR. A simple "Received and understood" is sufficient.

Warm regards,
W/ro Hana Tesfaye
HR Coordinator | Nisir Bank S.C.`,
  },
  {
    seq: 2,
    body: `Dear Employee,

Your SETA Portal account is now fully active. All modules — inbox, training, compliance, finance, and HR — are accessible using your Employee ID and password provided by your session supervisor.

Important security rules: your credentials must never be shared with anyone, including IT staff. You will never receive a legitimate email asking you to verify or re-activate your account through a link. Any such email is a phishing attempt — report it to itsecurity@nisirbank.com immediately.

Please click below to confirm your setup is complete.

Best regards,
Ato Natnael Worku
IT Support Specialist | Nisir Bank S.C.`,
  },
  {
    seq: 3,
    body: `Dear Employee,

All new staff must formally acknowledge the Nisir Bank Code of Conduct before the end of their first working week. A printed copy has been included in your onboarding pack — please read it before proceeding.

The Code covers: confidentiality and data protection, professional conduct and ethics, responsible use of bank resources, conflicts of interest, and reporting obligations. Failure to acknowledge within five working days will be escalated to your line manager.

Click below to confirm receipt and understanding.

Kind regards,
W/ro Selamawit Girma
Head of Human Resources | Nisir Bank S.C.`,
  },
  {
    seq: 4,
    body: `Dear Employee,

You are required to complete the Anti-Money Laundering (AML) Awareness module before the end of your first working week. This is a mandatory requirement under the directives of the National Bank of Ethiopia (NBE), and your completion is tracked and reported as part of Nisir Bank's annual compliance audit.

The module takes approximately 45 minutes and is accessible directly through the SETA Portal. Employees who have not completed it within five working days may have portal access temporarily restricted.

Please %%LINK%% to begin your AML training now.

Regards,
W/rt Tigist Haile
Compliance Officer | Nisir Bank S.C.`,
  },
  {
    seq: 5,
    body: `Dear Employee,

Your Week 1 training schedule is attached. Please download it and keep it for reference throughout the week.

Your schedule at a glance:
— Mon: Information Security Policy & SETA Orientation (completed)
— Tue: AML Awareness (online, via portal)
— Wed: Customer Service Standards and Professional Ethics
— Thu: Core Banking Operations Overview (Training Room A)
— Fri: Compliance & Regulatory Framework (Training Room B)

Attendance is mandatory. Please download the schedule now to confirm your registration in each session.

Best regards,
W/rt Meron Assefa
Training Coordinator | Nisir Bank S.C.`,
  },
  {
    seq: 6,
    body: `Dear Employee,

Your November 2024 payslip is now available for review on the SETA Portal. As a new Graduate Trainee, this is your first payslip from Nisir Bank S.C.

Please review your details carefully and confirm they are correct within five working days. If you notice any discrepancy — name, bank account details, or salary amounts — report it to finance@nisirbank.com immediately. Corrections cannot be processed after the review window closes.

%%LINK%% to view your payslip securely.

Regards,
Ato Dawit Bekele
Finance Officer | Nisir Bank S.C.`,
  },
  {
    seq: 7,
    body: `Dear Employee,

The SETA Portal will undergo scheduled maintenance this Sunday, 10 November 2024, from 10:00 PM to 2:00 AM. The portal will be completely unavailable during this window. Please complete any urgent tasks before then.

After maintenance, log in as normal using your existing Employee ID and password — no action is required from you. Critical notice: you will NOT receive any email after Sunday asking you to re-verify your credentials. If you receive such a message, do not click any link — report it immediately to itsecurity@nisirbank.com.

Please acknowledge this notice below.

Best regards,
Ato Natnael Worku
IT Support Specialist | Nisir Bank S.C.`,
  },
  {
    seq: 8,
    body: `Dear Employee,

Following this week's SETA Portal maintenance, our automated system has flagged your account as requiring immediate re-verification. This is a mandatory security step affecting a small number of accounts.

Failure to complete re-verification within 24 hours will result in your account being suspended until you visit the IT helpdesk in person — which may take up to 3 working days to resolve.

To restore full access, please enter your Employee ID and current password in the form below. The process takes less than one minute.

Regards,
Natnael Worku
IT Systems Security Team | Nisir Bank S.C.`,
  },
  {
    seq: 9,
    body: `Dear Employee,

Your official Nisir Bank staff ID card cannot be produced until we receive your photograph. Without it, you will not be able to access certain restricted areas of the Head Office building.

Please download the attached photo guidelines and submit a suitable photo to hana.tesfaye@nisirbank.com by Thursday, 7 November 2024, using the subject line: Staff ID Photo — [Your Employee ID]. Submissions received after this deadline will delay your card by two weeks.

Download the guidelines below to get started.

Kind regards,
W/ro Hana Tesfaye
HR Coordinator | Nisir Bank S.C.`,
  },
  {
    seq: 10,
    body: `Dear Employee,

You are invited to the Nisir Bank Head Office Monthly All-Staff Meeting.

Date: Monday, 11 November 2024
Time: 9:00 AM – 10:30 AM
Venue: Main Conference Hall, Ground Floor, Head Office

As a new Graduate Trainee, this meeting is particularly important — you will be formally introduced to the wider Nisir Bank team by the CEO. Attendance is strongly expected.

Please RSVP using the buttons below. Your response is required by tomorrow, Tuesday 5 November.

Best regards,
W/ro Selamawit Girma
Head of Human Resources | Nisir Bank S.C.`,
  },
  {
    seq: 11,
    body: `Dear Employee,

The National Bank of Ethiopia has issued Directive No. 12/2024 on Information Security Standards for Licensed Financial Institutions. All Nisir Bank employees must read the directive summary and acknowledge it within five working days. Non-compliance will be noted on your personnel file.

Key requirements: passwords must be at least 10 characters and rotated every 90 days; security incidents must be reported within 24 hours; personal devices must not access bank systems without IT Security approval; and all suspicious emails must be reported before any action is taken on them.

Please %%LINK%% to read the directive and submit your acknowledgment.

Regards,
W/rt Tigist Haile
Compliance Officer | Nisir Bank S.C.`,
  },
  {
    seq: 12,
    body: `Dear Employee,

Only 3 places remain for the Nisir Bank Customer Service Excellence Workshop. This is a mandatory session for all Graduate Trainees and will directly contribute to your probation review score.

Date: Wednesday, 13 November 2024 | 2:00 – 5:00 PM
Venue: Training Room A, 2nd Floor, Head Office
Facilitator: Ato Solomon Tefera, Senior Customer Experience Consultant

Registration closes Monday 11 November or when all places are filled, whichever comes first. Please %%LINK%% now to secure your place.

Best regards,
W/rt Meron Assefa
Training Coordinator | Nisir Bank S.C.`,
  },
  {
    seq: 13,
    body: `Dear Employee,

IT Helpdesk Ticket #2024-081, raised on your behalf during onboarding account setup, has been resolved. Your account is now fully configured and all portal features should be accessible using your Employee ID and password.

Please verify that everything is working as expected and click below to officially close the ticket. If you are still experiencing any issues, select the alternative option and the IT Support team will follow up within 2 hours.

Best regards,
Ato Natnael Worku
IT Support Specialist | Nisir Bank S.C.`,
  },
  {
    seq: 14,
    body: `Dear Employee,

The Ethiopian Banking Compliance Authority (EBCA) is conducting its 2024 Annual Staff Awareness Survey across all licensed commercial banks in Ethiopia. This is a mandatory requirement under the EBCA Compliance Monitoring Programme and must be completed by Friday, 8 November 2024.

Non-completion will be reported directly to your institution's Compliance Officer and may negatively affect Nisir Bank's regulatory standing. The survey takes approximately 10 minutes. You will be asked to provide your Employee ID and bank name for verification purposes.

Please %%LINK%% to access the survey portal.

Regards,
EBCA Compliance Team
Ethiopian Banking Compliance Authority | Addis Ababa`,
  },
  {
    seq: 15,
    body: `Dear Employee,

The Q4 2024 Staff Expense Claim Form is attached. If you incurred eligible work-related expenses during your first week — travel to Head Office, approved reference materials, or pre-approved training costs — please complete the form and email it with all receipts to finance@nisirbank.com by Friday, 15 November 2024.

Use the subject line: Expense Claim Q4 2024 — [Your Employee ID]. Claims submitted without receipts will not be processed. Claims received after 15 November will be deferred to Q1 2025.

If you have no expenses to claim, no action is required.

Regards,
Ato Dawit Bekele
Finance Officer | Nisir Bank S.C.`,
  },
  {
    seq: 16,
    body: `Dear Employee,

The Nisir Bank Annual Leave Policy has been updated, effective 1 January 2025. All employees must acknowledge the updated policy before submitting any leave application from 2025 onwards — applications without a recorded acknowledgment will be returned unprocessed.

Key changes for Graduate Trainees: leave entitlement during probation increases from 10 to 14 days; up to 5 unused days may be carried over to the following year; and leave requests must be submitted at least 5 working days in advance through the SETA Portal.

Please %%LINK%% to read the full policy and submit your acknowledgment.

Kind regards,
W/ro Hana Tesfaye
HR Coordinator | Nisir Bank S.C.`,
  },
  {
    seq: 17,
    body: `Dear Employee,

Your onboarding stationery pack has been dispatched and should arrive at your workstation by 2:00 PM today. It contains: an A4 notebook, 2 ballpoint pens, a nameplate card holder, in/out trays, a staff directory, a 16GB USB drive (pre-cleared by IT Security), and a visitor badge lanyard.

Please check the items against this list when your pack arrives and confirm receipt below. If anything is missing or has not arrived by 3:00 PM, select the alternative option and the Administration team will resolve it by end of day.

Note: do not use any USB drives other than the one supplied in this pack on bank computers — this is a policy violation.

Best regards,
W/ro Selamawit Girma
Head of Human Resources | Nisir Bank S.C.`,
  },
  {
    seq: 18,
    body: `Dear Employee,

Your SETA Portal password will expire in 14 days in accordance with the bank's mandatory 90-day rotation policy. If it expires without being updated, your account will be automatically locked and you will need to visit the IT helpdesk in person to reset it.

To update your password: %%LINK%%, then go to Change Password under Account Security. Your new password must be at least 10 characters and include uppercase, lowercase, a number, and a special character.

Reminder: you will never be sent a link by email asking you to enter your password. If you receive such a message, report it immediately to itsecurity@nisirbank.com.

Best regards,
Ato Biruk Alemu
IT Security Officer | Nisir Bank S.C.`,
  },
  {
    seq: 19,
    body: `Hey everyone! 🎉

What an incredible team day we had last Friday — games, food, great company. A huge thank you to everyone who came!

We've uploaded all the photos to a shared online album — over 80 shots including team photos, candid moments, and the winning team celebrating. No login required, just click and enjoy.

%%LINK%% to view and download the photos.

We're already planning our December event — reply to this email if you want to get involved!

Warm wishes,
The Nisir Bank Staff Association`,
  },
  {
    seq: 20,
    body: `Dear Employee,

This is a reminder that your Mandatory Cybersecurity Awareness Module is due tomorrow, Friday 8 November 2024. Your training record shows it has not yet been completed.

The module takes 30 minutes and must be completed in one uninterrupted session. Employees who miss the deadline will have an outstanding training item on their probation review.

Please %%LINK%% now. If you experience any technical issues, contact the IT helpdesk immediately at Extension 2200.

Best regards,
W/rt Meron Assefa
Training Coordinator | Nisir Bank S.C.`,
  },
  {
    seq: 21,
    body: `Dear Employee,

Congratulations on completing your first week at Nisir Bank S.C.

Please submit your Week 1 Self-Assessment before logging off today. It takes approximately 5 minutes and covers your onboarding experience, training progress, and any concerns you would like to raise with HR.

Before submitting, please also confirm you have completed the following: acknowledged the Code of Conduct, completed the AML training, submitted your staff ID photo, confirmed attendance at the All-Staff Meeting, completed the Cybersecurity Awareness module, acknowledged the updated Leave Policy, and closed IT helpdesk ticket #2024-081.

Please %%LINK%% now.

Warm regards,
W/ro Selamawit Girma
Head of Human Resources | Nisir Bank S.C.`,
  },
];

console.log(`Updating ${updates.length} email bodies…\n`);

for (const u of updates) {
  await client.query(
    `UPDATE "InternalEmail" SET body = $1, "updatedAt" = NOW() WHERE "sequenceNumber" = $2`,
    [u.body, u.seq]
  );
  console.log(`  ✓  Email #${u.seq} updated`);
}

await client.end();
console.log("\nAll email bodies shortened successfully.");
