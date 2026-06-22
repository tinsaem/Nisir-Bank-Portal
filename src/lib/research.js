import prisma from "@/lib/prisma";
import { getParticipantGroup } from "@/lib/participantGroup";

const MIN_SESSION_SECONDS = 600; // 10 minutes — sessions faster than this suggest skimming, not reading.

function durationSeconds(start, end) {
  if (!start || !end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
}

// Builds the individual-level participant x phishing-email matrix that backs
// the admin research dashboard. One row per EMPLOYEE account.
export async function getParticipantMatrix() {
  const [accounts, hrEmployees, phishingEmails, deliveries] = await Promise.all([
    prisma.employeeAccount.findMany({ where: { role: "EMPLOYEE" } }),
    prisma.hrEmployee.findMany(),
    prisma.internalEmail.findMany({
      where: { isPhishing: true },
      orderBy: { sequenceNumber: "asc" },
      select: { id: true, sequenceNumber: true, subject: true, phishingLevel: true },
    }),
    prisma.employeeEmail.findMany({
      include: { email: { select: { id: true, sequenceNumber: true, isPhishing: true } } },
    }),
  ]);

  const hrMap = new Map(hrEmployees.map((h) => [h.employeeId, h.fullName]));
  const deliveriesByEmployee = new Map();
  for (const d of deliveries) {
    if (!deliveriesByEmployee.has(d.employeeId)) deliveriesByEmployee.set(d.employeeId, []);
    deliveriesByEmployee.get(d.employeeId).push(d);
  }

  const rows = accounts.map((account) => {
    const employeeId = account.employeeId;
    const group = getParticipantGroup(employeeId);
    const employeeDeliveries = deliveriesByEmployee.get(employeeId) ?? [];
    const totalEmailsOpened = employeeDeliveries.filter((d) => d.isRead).length;
    const reachedLast = employeeDeliveries.some((d) => d.email.sequenceNumber === 21 && d.isRead);

    const perEmail = {};
    let totalClicks = 0;
    for (const pe of phishingEmails) {
      const delivery = employeeDeliveries.find((d) => d.emailId === pe.id);
      const opened = Boolean(delivery?.isRead);
      const dv1 = Boolean(delivery?.dv1ClickedAt);
      const dv2 = Boolean(delivery?.dv2SubmittedAt);
      if (dv1) totalClicks += 1;
      perEmail[pe.id] = {
        sequenceNumber: pe.sequenceNumber,
        phishingLevel: pe.phishingLevel,
        opened,
        openedAt: delivery?.openedAt ?? null,
        dv1Clicked: dv1,
        dv1ClickedAt: delivery?.dv1ClickedAt ?? null,
        dv2Submitted: dv2,
        dv2SubmittedAt: delivery?.dv2SubmittedAt ?? null,
        timeOnEmailBeforeClickSeconds: durationSeconds(delivery?.openedAt, delivery?.dv1ClickedAt),
      };
    }

    const sessionDurationSeconds = durationSeconds(account.sessionStartedAt, account.sessionCompletedAt);

    const excludeReasons = [];
    if (!reachedLast) excludeReasons.push("did_not_finish");
    if (sessionDurationSeconds !== null && sessionDurationSeconds < MIN_SESSION_SECONDS) {
      excludeReasons.push("under_10_minutes");
    }

    return {
      employeeId,
      group,
      fullName: hrMap.get(employeeId) || employeeId,
      sessionStartedAt: account.sessionStartedAt,
      sessionCompletedAt: account.sessionCompletedAt,
      sessionDurationSeconds,
      totalEmailsOpened,
      reachedLastEmail: reachedLast,
      perEmail,
      totalClicks,
      anyClick: totalClicks > 0,
      // Self-reported suspicion (DV3) is captured in the post-session survey,
      // which is outside this portal's build scope — left null until that
      // instrument is wired up.
      excludeFlag: excludeReasons.length > 0 ? excludeReasons.join(",") : null,
    };
  });

  rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true }));

  return { phishingEmails, rows };
}

export async function getGroupSummary() {
  const { phishingEmails, rows } = await getParticipantMatrix();
  const groups = ["control", "gain", "loss"];

  const countsByGroup = Object.fromEntries(groups.map((g) => [g, rows.filter((r) => r.group === g).length]));

  const perEmailSummary = phishingEmails.map((pe) => {
    const byGroup = {};
    for (const group of groups) {
      const groupRows = rows.filter((r) => r.group === group);
      const n = groupRows.length;
      const opened = groupRows.filter((r) => r.perEmail[pe.id]?.opened).length;
      const dv1 = groupRows.filter((r) => r.perEmail[pe.id]?.dv1Clicked).length;
      const dv2 = groupRows.filter((r) => r.perEmail[pe.id]?.dv2Submitted).length;
      byGroup[group] = {
        n,
        opened,
        openedPct: n ? Math.round((opened / n) * 1000) / 10 : 0,
        dv1Clicked: dv1,
        dv1ClickedPct: n ? Math.round((dv1 / n) * 1000) / 10 : 0,
        dv2Submitted: dv2,
        dv2SubmittedPct: n ? Math.round((dv2 / n) * 1000) / 10 : 0,
      };
    }

    const totalN = rows.length;
    const totalOpened = rows.filter((r) => r.perEmail[pe.id]?.opened).length;
    const totalDv1 = rows.filter((r) => r.perEmail[pe.id]?.dv1Clicked).length;
    const totalDv2 = rows.filter((r) => r.perEmail[pe.id]?.dv2Submitted).length;

    return {
      emailId: pe.id,
      sequenceNumber: pe.sequenceNumber,
      subject: pe.subject,
      phishingLevel: pe.phishingLevel,
      byGroup,
      total: {
        n: totalN,
        opened: totalOpened,
        openedPct: totalN ? Math.round((totalOpened / totalN) * 1000) / 10 : 0,
        dv1Clicked: totalDv1,
        dv1ClickedPct: totalN ? Math.round((totalDv1 / totalN) * 1000) / 10 : 0,
        dv2Submitted: totalDv2,
        dv2SubmittedPct: totalN ? Math.round((totalDv2 / totalN) * 1000) / 10 : 0,
      },
    };
  });

  const noClickByGroup = {};
  for (const group of groups) {
    const groupRows = rows.filter((r) => r.group === group);
    const n = groupRows.length;
    const noClick = groupRows.filter((r) => !r.anyClick).length;
    noClickByGroup[group] = { n, noClick, noClickPct: n ? Math.round((noClick / n) * 1000) / 10 : 0 };
  }

  return { countsByGroup, perEmailSummary, noClickByGroup };
}

export function rowsToMatrixCsv(phishingEmails, rows) {
  const header = [
    "participant_id",
    "group",
    "full_name",
    ...phishingEmails.flatMap((pe) => [
      `${pe.id}_opened`,
      `${pe.id}_dv1_clicked`,
      `${pe.id}_dv2_submitted`,
      `${pe.id}_time_on_email_before_click_sec`,
    ]),
    "total_clicks",
    "any_click",
    "session_duration_seconds",
    "exclude_flag",
  ];

  const lines = [header.join(",")];
  for (const r of rows) {
    const cells = [
      r.employeeId,
      r.group,
      `"${r.fullName.replace(/"/g, '""')}"`,
      ...phishingEmails.flatMap((pe) => {
        const cell = r.perEmail[pe.id];
        return [cell.opened, cell.dv1Clicked, cell.dv2Submitted, cell.timeOnEmailBeforeClickSeconds ?? ""];
      }),
      r.totalClicks,
      r.anyClick,
      r.sessionDurationSeconds ?? "",
      r.excludeFlag ?? "",
    ];
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

export function rowsToWideCsv(phishingEmails, rows) {
  const header = [
    "participant_id",
    "group",
    "full_name",
    ...phishingEmails.map((pe) => `${pe.id}_dv1_clicked`),
    ...phishingEmails.map((pe) => `${pe.id}_dv2_submitted`),
    "total_clicks",
    "any_click",
    "session_duration_seconds",
    "exclude_flag",
  ];

  const lines = [header.join(",")];
  for (const r of rows) {
    const cells = [
      r.employeeId,
      r.group,
      `"${r.fullName.replace(/"/g, '""')}"`,
      ...phishingEmails.map((pe) => Number(r.perEmail[pe.id].dv1Clicked)),
      ...phishingEmails.map((pe) => Number(r.perEmail[pe.id].dv2Submitted)),
      r.totalClicks,
      Number(r.anyClick),
      r.sessionDurationSeconds ?? "",
      r.excludeFlag ?? "",
    ];
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

export async function getFullExportCsv() {
  const [accounts, hrEmployees, allEmails, deliveries] = await Promise.all([
    prisma.employeeAccount.findMany({ where: { role: "EMPLOYEE" } }),
    prisma.hrEmployee.findMany(),
    prisma.internalEmail.findMany({ orderBy: { sequenceNumber: "asc" } }),
    prisma.employeeEmail.findMany(),
  ]);

  const hrMap = new Map(hrEmployees.map((h) => [h.employeeId, h.fullName]));
  const deliveryMap = new Map(deliveries.map((d) => [`${d.employeeId}__${d.emailId}`, d]));

  const header = [
    "participant_id",
    "group",
    "full_name",
    "sequence_number",
    "email_id",
    "subject",
    "is_phishing",
    "phishing_level",
    "opened",
    "opened_at",
    "dv1_clicked",
    "dv1_clicked_at",
    "dv2_submitted",
    "dv2_submitted_at",
    "action_status",
  ];
  const lines = [header.join(",")];

  for (const account of accounts) {
    const group = getParticipantGroup(account.employeeId);
    const fullName = hrMap.get(account.employeeId) || account.employeeId;
    for (const email of allEmails) {
      const d = deliveryMap.get(`${account.employeeId}__${email.id}`);
      lines.push(
        [
          account.employeeId,
          group,
          `"${fullName.replace(/"/g, '""')}"`,
          email.sequenceNumber,
          email.id,
          `"${email.subject.replace(/"/g, '""')}"`,
          email.isPhishing,
          email.phishingLevel ?? "",
          Boolean(d?.isRead),
          d?.openedAt?.toISOString() ?? "",
          Boolean(d?.dv1ClickedAt),
          d?.dv1ClickedAt?.toISOString() ?? "",
          Boolean(d?.dv2SubmittedAt),
          d?.dv2SubmittedAt?.toISOString() ?? "",
          d?.actionStatus ?? "NONE",
        ].join(",")
      );
    }
  }

  return lines.join("\n");
}
