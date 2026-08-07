"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCurrentUser } from "@/lib/currentUser";

const GROUP_ROW_COLOR = {
  gain: "bg-emerald-50/60",
  loss: "bg-rose-50/50",
  control: "bg-gray-50",
};

const GROUP_LABEL = { gain: "Gain", loss: "Loss", control: "Control" };

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Pill({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-300">⬜</span>;
  }
  return value ? <span className="text-emerald-600 font-bold">✔</span> : <span className="text-rose-500 font-bold">✘</span>;
}

export default function ResearchDashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("matrix");

  useEffect(() => {
    loadCurrentUser().then((parsed) => {
      if (!parsed) {
        router.replace("/");
        return;
      }
      if (parsed.role !== "ADMIN") {
        router.replace("/employee_dashboard");
        return;
      }
      setAccount(parsed);
    });
  }, [router]);

  if (!account) {
    return <main className="min-h-screen bg-[#f0f4fb]" />;
  }

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <section className="px-4 sm:px-6 py-8 max-w-[1400px] mx-auto">
        <p className="text-blue-700 text-xs font-semibold tracking-widest uppercase mb-1">
          Nisir Bank SETA Portal — PhD Research Study
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Research Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">
          Individual-level participant data, group comparisons, live session status, and data export.
        </p>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            ["matrix", "Participant Matrix"],
            ["summary", "Group Summary"],
            ["live", "Live Sessions"],
            ["export", "Data Export"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px ${
                tab === key ? "border-blue-700 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "matrix" && <MatrixTab />}
        {tab === "summary" && <SummaryTab />}
        {tab === "live" && <LiveTab />}
        {tab === "export" && <ExportTab />}
      </section>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab 1: Individual Participant Matrix
────────────────────────────────────────────────────────── */
function MatrixTab() {
  const [data, setData] = useState(null);
  const [sortKey, setSortKey] = useState("employeeId");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetch("/api/admin/research/matrix")
      .then((res) => res.json())
      .then((d) => d.success && setData(d));
  }, []);

  const sortedRows = useMemo(() => {
    if (!data) return [];
    const rows = [...data.rows];
    rows.sort((a, b) => {
      const av = sortKey.startsWith("email:")
        ? Number(a.perEmail[sortKey.slice(6)]?.dv1Clicked)
        : a[sortKey];
      const bv = sortKey.startsWith("email:")
        ? Number(b.perEmail[sortKey.slice(6)]?.dv1Clicked)
        : b[sortKey];
      if (av === bv) return 0;
      const cmp = typeof av === "string" ? av.localeCompare(bv, undefined, { numeric: true }) : av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  if (!data) return <p className="text-sm text-gray-400">Loading…</p>;

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const Th = ({ k, children }) => (
    <th
      className="py-2 px-2 text-left text-[10.5px] uppercase text-gray-500 cursor-pointer select-none whitespace-nowrap hover:text-gray-800"
      onClick={() => toggleSort(k)}
    >
      {children} {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </th>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-white border-b border-gray-200">
          <tr>
            <Th k="employeeId">Participant</Th>
            <Th k="group">Group</Th>
            {data.phishingEmails.map((pe) => (
              <th key={pe.id} colSpan={3} className="py-2 px-2 text-[10.5px] uppercase text-gray-500 text-center border-l border-gray-100">
                #{pe.sequenceNumber} ({pe.phishingLevel})
              </th>
            ))}
            <Th k="totalClicks">Total Clicks</Th>
            <Th k="anyClick">Any Click</Th>
            <Th k="sessionDurationSeconds">Duration</Th>
            <Th k="excludeFlag">Exclude</Th>
          </tr>
          <tr className="text-[9.5px] uppercase text-gray-400">
            <th></th>
            <th></th>
            {data.phishingEmails.map((pe) => (
              <Fragment key={pe.id}>
                <th className="border-l border-gray-100 px-1">Open</th>
                <th className="px-1">Phished</th>
                <th className="px-1">Sec</th>
              </Fragment>
            ))}
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((r) => (
            <tr key={r.employeeId} className={`border-b border-gray-50 ${GROUP_ROW_COLOR[r.group] ?? ""}`}>
              <td className="py-1.5 px-2 font-semibold text-gray-800 whitespace-nowrap">{r.employeeId}</td>
              <td className="py-1.5 px-2 text-gray-600 whitespace-nowrap">{GROUP_LABEL[r.group] ?? r.group}</td>
              {data.phishingEmails.map((pe) => {
                const cell = r.perEmail[pe.id];
                return (
                  <Fragment key={pe.id}>
                    <td className="text-center border-l border-gray-50">
                      <Pill value={cell.opened} />
                    </td>
                    <td className="text-center">
                      <Pill value={cell.dv1Clicked} />
                    </td>
                    <td className="text-center text-gray-400 text-xs">
                      {cell.timeOnEmailBeforeClickSeconds ?? "—"}
                    </td>
                  </Fragment>
                );
              })}
              <td className="text-center font-bold text-gray-700">{r.totalClicks}</td>
              <td className="text-center">
                <Pill value={r.anyClick} />
              </td>
              <td className="text-center text-gray-500 text-xs whitespace-nowrap">{formatDuration(r.sessionDurationSeconds)}</td>
              <td className="text-center text-rose-500 text-[10px] font-semibold">{r.excludeFlag ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab 2: Per-Email Group Summary
────────────────────────────────────────────────────────── */
function SummaryTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/research/summary")
      .then((res) => res.json())
      .then((d) => d.success && setData(d));
  }, []);

  if (!data) return <p className="text-sm text-gray-400">Loading…</p>;

  const groups = ["control", "gain", "loss"];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr className="text-left text-[10.5px] uppercase text-gray-500">
              <th className="py-2 px-3">Phishing Email</th>
              <th className="py-2 px-3">Metric</th>
              {groups.map((g) => (
                <th key={g} className="py-2 px-3 text-center">
                  {GROUP_LABEL[g]} (n={data.countsByGroup[g]})
                </th>
              ))}
              <th className="py-2 px-3 text-center">Total (n=105)</th>
            </tr>
          </thead>
          <tbody>
            {data.perEmailSummary.map((pe) => (
              <Fragment key={pe.emailId}>
                <tr className="border-b border-gray-50">
                  <td rowSpan={2} className="py-2 px-3 font-semibold text-gray-800 align-top">
                    #{pe.sequenceNumber} ({pe.phishingLevel})
                    <p className="text-[11px] text-gray-400 font-normal mt-0.5 max-w-[220px]">{pe.subject}</p>
                  </td>
                  <td className="py-1.5 px-3 text-gray-600">Opened</td>
                  {groups.map((g) => (
                    <td key={g} className="py-1.5 px-3 text-center">
                      {pe.byGroup[g].opened} ({pe.byGroup[g].openedPct}%)
                    </td>
                  ))}
                  <td className="py-1.5 px-3 text-center font-semibold">
                    {pe.total.opened} ({pe.total.openedPct}%)
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 px-3 text-gray-600">Phished</td>
                  {groups.map((g) => (
                    <td key={g} className="py-1.5 px-3 text-center">
                      {pe.byGroup[g].dv1Clicked} ({pe.byGroup[g].dv1ClickedPct}%)
                    </td>
                  ))}
                  <td className="py-1.5 px-3 text-center font-semibold">
                    {pe.total.dv1Clicked} ({pe.total.dv1ClickedPct}%)
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Did NOT click any phishing link</h3>
        <div className="flex gap-6">
          {groups.map((g) => (
            <div key={g} className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data.noClickByGroup[g].noClick} <span className="text-sm text-gray-400">/ {data.noClickByGroup[g].n}</span>
              </p>
              <p className="text-xs text-gray-500 font-semibold">
                {GROUP_LABEL[g]} ({data.noClickByGroup[g].noClickPct}%)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab 3: Live Session Monitor
────────────────────────────────────────────────────────── */
function LiveTab() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch("/api/admin/research/live")
        .then((res) => res.json())
        .then((d) => {
          if (!cancelled && d.success) setRows(d.rows);
        });
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!rows) return <p className="text-sm text-gray-400">Loading…</p>;

  const STATUS_STYLE = {
    not_started: "bg-gray-100 text-gray-500",
    in_progress: "bg-amber-50 text-amber-700",
    complete: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <p className="text-xs text-gray-400 px-4 pt-3">Auto-refreshes every 15 seconds.</p>
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200">
          <tr className="text-left text-[10.5px] uppercase text-gray-500">
            <th className="py-2 px-3">Participant</th>
            <th className="py-2 px-3">Group</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Current Email #</th>
            <th className="py-2 px-3">Emails Read</th>
            <th className="py-2 px-3">Phishing Actions</th>
            <th className="py-2 px-3">Session Start</th>
            <th className="py-2 px-3">Duration</th>
            <th className="py-2 px-3">Complete?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.employeeId} className={`border-b border-gray-50 ${GROUP_ROW_COLOR[r.group] ?? ""}`}>
              <td className="py-1.5 px-3 font-semibold text-gray-800 whitespace-nowrap">{r.employeeId}</td>
              <td className="py-1.5 px-3 text-gray-600">{GROUP_LABEL[r.group] ?? r.group}</td>
              <td className="py-1.5 px-3">
                <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${STATUS_STYLE[r.status]}`}>
                  {r.status.replace("_", " ")}
                </span>
              </td>
              <td className="py-1.5 px-3 text-center">{r.currentEmailNumber || "—"}</td>
              <td className="py-1.5 px-3 text-center">{r.emailsRead} / 21</td>
              <td className="py-1.5 px-3 text-center">{r.phishingActionsTaken}</td>
              <td className="py-1.5 px-3 text-gray-500 whitespace-nowrap">{formatDate(r.sessionStartedAt)}</td>
              <td className="py-1.5 px-3 text-gray-500">{formatDuration(r.durationSeconds)}</td>
              <td className="py-1.5 px-3 text-center">
                <Pill value={r.complete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab 4: Data Export
────────────────────────────────────────────────────────── */
function ExportTab() {
  const exports = [
    {
      format: "matrix",
      title: "Matrix export",
      description: "One row per participant per phishing email — opened, DV1, DV2, and timing for each of the 3 phishing emails.",
    },
    {
      format: "wide",
      title: "Wide format (SPSS GEE)",
      description: "One row per participant, with the 3 phishing emails spread across columns — ready for repeated-measures GEE analysis.",
    },
    {
      format: "full",
      title: "Full export",
      description: "Every one of the 21 emails × every participant — opens, DV1/DV2, and action status for the complete inbox.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {exports.map((e) => (
        <div key={e.format} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 mb-1">{e.title}</h3>
          <p className="text-xs text-gray-500 flex-1 mb-4">{e.description}</p>
          <a
            href={`/api/admin/research/export?format=${e.format}`}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl text-center"
          >
            Download CSV
          </a>
        </div>
      ))}
    </div>
  );
}
