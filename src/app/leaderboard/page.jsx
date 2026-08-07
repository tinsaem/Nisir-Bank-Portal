"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeNav from "@/components/EmployeeNav";
import { loadCurrentUser } from "@/lib/currentUser";

const DEPARTMENTS = [
  { key: "it",         label: "IT & Digital",      color: "#6366f1", bg: "#eef2ff" },
  { key: "compliance", label: "Risk & Compliance",  color: "#0891b2", bg: "#ecfeff" },
  { key: "retail",     label: "Retail Banking",     color: "#059669", bg: "#ecfdf5" },
  { key: "corporate",  label: "Corporate Banking",  color: "#d97706", bg: "#fffbeb" },
  { key: "finance",    label: "Finance & Accounts", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "operations", label: "Operations",         color: "#dc2626", bg: "#fef2f2" },
  { key: "hr",         label: "Human Resources",    color: "#db2777", bg: "#fdf2f8" },
];

const ALL_ENTRIES = [
  { rank: 1,  name: "Natnael Fikadu",   dept: "it",         tokens: 3120 },
  { rank: 2,  name: "Eyasu Yohannes",   dept: "it",         tokens: 2950 },
  { rank: 3,  name: "Fiker Mulugeta",   dept: "compliance", tokens: 2890 },
  { rank: 4,  name: "Kidus Tesfaye",    dept: "retail",     tokens: 2840 },
  { rank: 5,  name: "Hana Tadesse",     dept: "corporate",  tokens: 2780 },
  { rank: 6,  name: "Liya Desta",       dept: "it",         tokens: 2720 },
  { rank: 7,  name: "Elsa Girma",       dept: "finance",    tokens: 2710 },
  { rank: 8,  name: "Berhane Gebre",    dept: "compliance", tokens: 2640 },
  { rank: 9,  name: "Meron Haile",      dept: "retail",     tokens: 2615 },
  { rank: 10, name: "Biniam Alemu",     dept: "corporate",  tokens: 2560 },
  { rank: 11, name: "Sara Bekele",      dept: "corporate",  tokens: 2490 },
  { rank: 12, name: "Tesfaye Mulat",    dept: "finance",    tokens: 2490 },
  { rank: 13, name: "Asmara Mengistu",  dept: "compliance", tokens: 2410 },
  { rank: 14, name: "Yonas Wolde",      dept: "operations", tokens: 2380 },
  { rank: 15, name: "Dawit Girma",      dept: "retail",     tokens: 2390 },
  { rank: 16, name: "Bethlehem Haile",  dept: "finance",    tokens: 2270 },
  { rank: 17, name: "Selam Kebede",     dept: "hr",         tokens: 2320 },
  { rank: 18, name: "Tigist Abebe",     dept: "operations", tokens: 2230 },
  { rank: 19, name: "Abebe Assefa",     dept: "hr",         tokens: 2150 },
  { rank: 20, name: "Robel Tesfaw",     dept: "operations", tokens: 1980 },
  { rank: 21, name: "Miriam Desta",     dept: "hr",         tokens: 1890 },
];

const MEDALS = ["🥇", "🥈", "🥉"];
const DEPT_MAP = Object.fromEntries(DEPARTMENTS.map((d) => [d.key, d]));
const TOP_SCORE = ALL_ENTRIES[0].tokens;

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function deptTop3(key) {
  return ALL_ENTRIES.filter((e) => e.dept === key).slice(0, 3);
}

function deptAvg(key) {
  const entries = ALL_ENTRIES.filter((e) => e.dept === key);
  if (!entries.length) return 0;
  return Math.round(entries.reduce((s, e) => s + e.tokens, 0) / entries.length);
}

function RankRow({ entry, isUser }) {
  const dept = DEPT_MAP[entry.dept];
  const pct = Math.round((entry.tokens / TOP_SCORE) * 100);
  const medal = entry.rank <= 3 ? MEDALS[entry.rank - 1] : null;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        isUser ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="w-7 text-center shrink-0">
        {medal ? (
          <span className="text-lg">{medal}</span>
        ) : (
          <span className="text-xs font-bold text-gray-400">#{entry.rank}</span>
        )}
      </div>

      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
        style={{ background: isUser ? "#1d4ed8" : (dept?.color ?? "#64748b") }}
      >
        {getInitials(entry.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate ${isUser ? "text-blue-900" : "text-gray-900"}`}>
          {entry.name}
          {isUser && <span className="text-blue-400 font-normal"> (You)</span>}
        </p>
        <span
          className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
          style={{ background: dept?.bg ?? "#f1f5f9", color: dept?.color ?? "#64748b" }}
        >
          {dept?.label ?? entry.dept}
        </span>
      </div>

      <div className="text-right shrink-0 min-w-[80px]">
        <p className={`text-sm font-black ${isUser ? "text-blue-700" : "text-gray-900"}`}>
          {entry.tokens.toLocaleString()}
          <span className="text-[10px] font-semibold text-gray-400 ml-0.5">ISP</span>
        </p>
        <div className="w-20 h-1 bg-gray-100 rounded-full mt-1 ml-auto">
          <div
            className="h-1 rounded-full"
            style={{
              width: `${pct}%`,
              background: isUser ? "#1d4ed8" : (dept?.color ?? "#64748b"),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DeptCard({ dept }) {
  const entries = deptTop3(dept.key);
  const avg = deptAvg(dept.key);
  const top = entries[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: dept.bg }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: dept.color }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
          >
            corporate_fare
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 truncate">{dept.label}</p>
          <p className="text-[10px] text-gray-500">Dept. avg: {avg.toLocaleString()} ISP</p>
        </div>
        {top && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400">Leader</p>
            <p className="text-xs font-bold" style={{ color: dept.color }}>
              {top.tokens.toLocaleString()} ISP
            </p>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {entries.map((e, i) => (
          <div key={e.name} className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-base w-5 text-center shrink-0">{MEDALS[i]}</span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
              style={{ background: dept.color }}
            >
              {getInitials(e.name)}
            </div>
            <p className="text-xs font-semibold text-gray-800 flex-1 truncate">{e.name}</p>
            <p className="text-xs font-bold text-gray-700 shrink-0">
              {e.tokens.toLocaleString()}
              <span className="text-[9px] text-gray-400 ml-0.5">ISP</span>
            </p>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-gray-400 text-xs py-4">No entries yet</p>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("overall");

  useEffect(() => {
    loadCurrentUser().then((parsed) => {
      if (!parsed) { router.replace("/"); return; }
      setAccount(parsed);
    });
  }, [router]);

  if (!account) {
    return (
      <main className="min-h-screen bg-[#f0f4fb]">
        <EmployeeNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      </main>
    );
  }

  const userName = account.fullName ?? "You";

  const userRow = (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
      <div className="w-7 text-center shrink-0">
        <span className="text-xs font-bold text-blue-400">—</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
        {getInitials(userName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-blue-900 truncate">
          {userName} <span className="text-blue-400 font-normal">(You)</span>
        </p>
        <p className="text-[10px] text-blue-500">Complete a module to enter the rankings</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-blue-700">
          0 <span className="text-[10px] font-semibold text-gray-400">ISP</span>
        </p>
        <div className="w-20 h-1 bg-blue-100 rounded-full mt-1 ml-auto" />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <EmployeeNav />

      <style jsx global>{`
        .hg { font-family: "Hanken Grotesk", sans-serif; }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0c1f4a 0%,#1a006e 55%,#3a0ca3 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-yellow-300"
                style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}
              >
                emoji_events
              </span>
            </div>
            <div>
              <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">
                SETA Security Program
              </p>
              <h1 className="hg text-2xl font-black text-white">Global Rankings</h1>
            </div>
          </div>
          <p className="text-indigo-200 text-sm max-w-xl">
            Live ISP token standings across all departments. Scores update as employees complete training modules and security challenges.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: "workspace_premium", label: "Top Score",   value: `${TOP_SCORE.toLocaleString()} ISP` },
              { icon: "corporate_fare",    label: "Departments", value: `${DEPARTMENTS.length} Active`       },
              { icon: "trending_up",       label: "Your Rank",   value: "Unranked"                          },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl px-3 py-3 text-center">
                <span
                  className="material-symbols-outlined text-indigo-300"
                  style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
                <p className="text-white text-sm font-black mt-1">{s.value}</p>
                <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit mb-6">
          {[
            { key: "overall", icon: "leaderboard",   label: "Overall Rankings" },
            { key: "dept",    icon: "corporate_fare", label: "By Department"    },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === t.key
                  ? "bg-indigo-700 text-white shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 15,
                  fontVariationSettings: tab === t.key ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overall tab */}
        {tab === "overall" && (
          <div className="space-y-2 pb-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Top Performers — All Departments
            </p>
            {ALL_ENTRIES.map((entry) => (
              <RankRow key={entry.name} entry={entry} isUser={false} />
            ))}

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-dashed border-gray-200" />
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                Your Position
              </span>
              <div className="flex-1 border-t border-dashed border-gray-200" />
            </div>

            {userRow}
          </div>
        )}

        {/* By-department tab */}
        {tab === "dept" && (
          <div className="pb-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Top 3 Earners Per Department
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {DEPARTMENTS.map((dept) => (
                <DeptCard key={dept.key} dept={dept} />
              ))}
            </div>

            {/* Department averages bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Department Averages
              </p>
              <div className="space-y-3">
                {[...DEPARTMENTS]
                  .map((d) => ({ ...d, avg: deptAvg(d.key) }))
                  .sort((a, b) => b.avg - a.avg)
                  .map((d) => (
                    <div key={d.key} className="flex items-center gap-3">
                      <p className="text-xs text-gray-700 w-36 truncate shrink-0">{d.label}</p>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.round((d.avg / TOP_SCORE) * 100)}%`,
                            background: d.color,
                          }}
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-700 shrink-0 w-20 text-right">
                        {d.avg.toLocaleString()} ISP
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
