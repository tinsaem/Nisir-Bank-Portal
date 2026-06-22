"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ── Role profiles (keyed by employee group) ─────────────────────────────────
const ROLE_PROFILES = {
  teller: {
    role: "Bank Teller", dept: "Retail Banking", branch: "Addis Ababa",
    riskLevel: "Medium", weakArea: "Social Engineering", focusArea: "Transaction Security",
    aiConfidence: 94, maturityLevel: "Level 4 (Advanced)", streak: 7,
    aiNudge: "Employees in your role who completed 'Secure Banking' reduced phishing susceptibility by 64%. Your next priority module is ready.",
    benchmarkNote: "You are outperforming 85% of your peers in Compliance, but fall 12% below the department average in Social Engineering defense.",
    radarScores: [92, 78, 65, 80, 55, 88],
    modules: [
      { tag: "AI Priority", tagCls: "bg-blue-100 text-blue-800",   title: "Secure Banking Transactions",     level: "Advanced",     time: "45 min", tokens: 50,  progress: 15, note: "Critical for Teller role",                btn: "Start Learning", btnStyle: "primary"   },
      { tag: "Recommended", tagCls: "bg-green-100 text-green-800", title: "Phishing Detection for Tellers",  level: "Intermediate", time: "30 min", tokens: 30,  progress: 0,  note: "Focus on social engineering tactics",    btn: "Enroll Now",     btnStyle: "outline"   },
      { tag: "Mandatory",   tagCls: "bg-red-100 text-red-800",     title: "Compliance Regulatory Awareness", level: "Standard",     time: "60 min", tokens: 40,  progress: 60, note: "Required by NBE regulation",             btn: "Resume Path",    btnStyle: "secondary" },
    ],
    roadmap: [
      { label: "Digital ID",    status: "completed" },
      { label: "Teller Safety", status: "active"    },
      { label: "Advanced Risk", status: "locked"    },
      { label: "Champion",      status: "locked"    },
    ],
  },
  service: {
    role: "Customer Service", dept: "Customer Relations", branch: "Addis Ababa",
    riskLevel: "Medium", weakArea: "Endpoint Security", focusArea: "Data Privacy",
    aiConfidence: 88, maturityLevel: "Level 3 (Intermediate)", streak: 4,
    aiNudge: "Customer service staff who completed the Data Privacy module reduced PII exposure incidents by 71%. Your learning path is personalised for your role.",
    benchmarkNote: "You excel in customer-facing security protocols but endpoint security and password hygiene remain your weakest domains.",
    radarScores: [80, 85, 45, 90, 70, 75],
    modules: [
      { tag: "AI Priority", tagCls: "bg-blue-100 text-blue-800",   title: "Customer Data Privacy",       level: "Intermediate", time: "25 min", tokens: 40, progress: 0,  note: "PII handling is your weakest area",             btn: "Start Learning", btnStyle: "primary"   },
      { tag: "Recommended", tagCls: "bg-green-100 text-green-800", title: "Password Hygiene & MFA",      level: "Beginner",     time: "12 min", tokens: 20, progress: 0,  note: "Strengthen authentication practices",           btn: "Enroll Now",     btnStyle: "outline"   },
      { tag: "Mandatory",   tagCls: "bg-red-100 text-red-800",     title: "Endpoint Security Essentials",level: "Intermediate", time: "25 min", tokens: 35, progress: 20, note: "Required for customer-facing roles",            btn: "Resume Path",    btnStyle: "secondary" },
    ],
    roadmap: [
      { label: "Digital ID",    status: "completed" },
      { label: "Privacy Shield",status: "active"    },
      { label: "Data Guardian", status: "locked"    },
      { label: "Champion",      status: "locked"    },
    ],
  },
  officer: {
    role: "Branch Officer", dept: "Branch Operations", branch: "Addis Ababa",
    riskLevel: "Low", weakArea: "None", focusArea: "Threat Intelligence",
    aiConfidence: 98, maturityLevel: "Level 5 (Expert)", streak: 14,
    aiNudge: "You are in the top 2% of branch officers. Completing the Advanced Threat Intelligence series will unlock the Security Vanguard certification.",
    benchmarkNote: "Outstanding performance across all security domains. You are a role model for your branch.",
    radarScores: [98, 96, 95, 97, 94, 99],
    modules: [
      { tag: "Final Step",  tagCls: "bg-emerald-100 text-emerald-800", title: "Advanced Threat Intelligence",   level: "Advanced", time: "35 min", tokens: 100, progress: 60, note: "Last module for Security Vanguard cert",      btn: "Complete Now",    btnStyle: "primary"   },
      { tag: "Leadership",  tagCls: "bg-purple-100 text-purple-800",   title: "Peer Mentorship Programme",       level: "Expert",   time: "30 min", tokens: 50,  progress: 0,  note: "Earn 200 bonus tokens per session",          btn: "Start Leading",   btnStyle: "outline"   },
      { tag: "Advanced",    tagCls: "bg-blue-100 text-blue-800",       title: "Incident Response Simulation",    level: "Expert",   time: "45 min", tokens: 80,  progress: 0,  note: "Live-fire ransomware tabletop exercise",     btn: "Start Simulation",btnStyle: "secondary" },
    ],
    roadmap: [
      { label: "Digital ID",    status: "completed" },
      { label: "Teller Safety", status: "completed" },
      { label: "Advanced Risk", status: "active"    },
      { label: "Vanguard",      status: "locked"    },
    ],
  },
};

const MOCK_STATS = { complianceScore: 86, completedModules: 8, totalModules: 12, tokens: 2450 };

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function radarPoints(scores) {
  const cx = 100, cy = 100, r = 70;
  const angles = [-90, -30, 30, 90, 150, 210];
  return scores
    .map((s, i) => {
      const a = (angles[i] * Math.PI) / 180;
      const d = (s / 100) * r;
      return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`;
    })
    .join(" ");
}

function riskBadgeCls(level) {
  const l = (level || "").toLowerCase();
  if (l === "low")    return "bg-green-100 text-green-800";
  if (l === "medium") return "bg-amber-100 text-amber-800";
  if (l === "high")   return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function RoleBasedPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) { router.replace("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "ADMIN") { router.replace("/admin_dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(parsed);
  }, [router]);

  if (!account) return <main className="min-h-screen bg-[#f0f4fb]" />;

  const empNum = parseInt((account.employeeId || "EMP-001").split("-")[1] || "1", 10);
  const groupKey = empNum <= 35 ? "teller" : empNum <= 70 ? "service" : "officer";
  const profile = ROLE_PROFILES[groupKey];

  const complianceScore = MOCK_STATS.complianceScore;
  const ringOffset = (138.2 * (1 - complianceScore / 100)).toFixed(1);

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: 'Hanken Grotesk', sans-serif; }
        .hero-banner {
          background: linear-gradient(135deg,#001e40 0%,#003366 45%,#1f477b 100%);
          position:relative; overflow:hidden;
        }
        .hero-banner::before {
          content:""; position:absolute; inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-orb { position:absolute;border-radius:999px;filter:blur(60px);opacity:0.15;pointer-events:none; }
        .card { background:#fff;border-radius:20px;border:1px solid rgba(195,198,209,0.4);box-shadow:0 2px 12px rgba(0,30,64,0.06); }
        .card-dark { background:linear-gradient(135deg,#001e40 0%,#003366 50%,#1f477b 100%);border-radius:20px;box-shadow:0 8px 32px rgba(0,51,102,0.3); }
        .prog-track { background:#e8e8ed;border-radius:99px;overflow:hidden; }
        .prog-fill { background:linear-gradient(90deg,#3a5f94,#a7c8ff);border-radius:99px; }
        .tok-badge { background:linear-gradient(135deg,#FFD700,#DAA520);color:#3d2800;border-radius:99px;font-weight:700;font-size:12px;padding:3px 10px;display:inline-flex;align-items:center;gap:4px; }
        .ring-bg   { stroke:rgba(255,255,255,0.2); }
        .ring-fill { stroke:url(#roleRingGrad);stroke-linecap:round; }
        .radar-polygon { fill:rgba(58,95,148,0.18);stroke:#3a5f94;stroke-width:1.5; }
        .radar-grid    { fill:none;stroke:rgba(195,198,209,0.5);stroke-width:1; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle; }
        .ms-filled { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>

      {/* ── Hero banner ── */}
      <section className="hero-banner px-4 sm:px-6 py-10">
        <div className="hero-orb w-80 h-80 bg-blue-400" style={{ top: "-60px", right: "-40px" }} />
        <div className="hero-orb w-56 h-56 bg-indigo-300" style={{ bottom: "-40px", left: "10%" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            {/* Left: greeting */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white/95 shadow shrink-0">
                  <img src="/images/nisir_bank_logo.svg" alt="Nisir Bank S.C." className="h-8 w-8 object-contain" />
                </div>
                <span className="text-white/70 text-xs font-semibold">Nisir Bank S.C.</span>
              </div>
              <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
                <span className="material-symbols-outlined ms-filled text-sm mr-1">psychology</span>
                Role-Specific Training
              </p>
              <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight">
                Good {getGreeting()}, {account.fullName ?? account.name} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-2">
                {profile.role} · Branch {profile.branch}
              </p>
            </div>

            {/* Right: stat pills */}
            <div className="flex flex-wrap gap-3">
              {/* Compliance ring */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="roleRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a7c8ff" />
                      <stop offset="100%" stopColor="#3a5f94" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-bg" cx="28" cy="28" r="22" fill="none" strokeWidth="5" />
                  <circle
                    className="ring-fill" cx="28" cy="28" r="22" fill="none" strokeWidth="5"
                    strokeDasharray="138.2" strokeDashoffset={ringOffset}
                    transform="rotate(-90 28 28)"
                  />
                  <text x="28" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
                    {complianceScore}%
                  </text>
                </svg>
                <div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Compliance</p>
                  <p className="text-white text-lg font-bold leading-tight">Score</p>
                </div>
              </div>
              {/* Modules */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="hg text-3xl font-bold text-white">
                  {MOCK_STATS.completedModules}
                  <span className="text-blue-300 text-lg">/{MOCK_STATS.totalModules}</span>
                </p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">Modules Done</p>
              </div>
              {/* Tokens */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="hg text-3xl font-bold text-yellow-300">{MOCK_STATS.tokens.toLocaleString()}</p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">ISP Tokens</p>
              </div>
            </div>
          </div>

          {/* AI insight box */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-start gap-3 max-w-3xl">
            <span className="material-symbols-outlined ms-filled text-yellow-300 text-2xl shrink-0 mt-0.5">auto_awesome</span>
            <p className="text-blue-100 text-sm leading-relaxed">{profile.aiNudge}</p>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-12 gap-6">

          {/* ── Left sidebar ── */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <RoleIntelligenceCard account={account} profile={profile} />
            <PerformanceBenchmarkCard profile={profile} />
          </aside>

          {/* ── Right content ── */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined ms-filled text-blue-700 text-2xl">auto_awesome</span>
                <h2 className="hg text-xl font-bold text-gray-900">Adaptive Learning Paths</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">AI-curated for your role</span>
            </div>

            {/* Module cards */}
            <div className="space-y-4">
              {profile.modules.map((mod, i) => (
                <ModuleCard
                  key={i}
                  mod={mod}
                  active={activeModule === i}
                  onOpen={() => setActiveModule(activeModule === i ? null : i)}
                />
              ))}
            </div>

            {/* Video placeholder (shows when a module is active) */}
            {activeModule !== null && (
              <VideoPlaceholder
                mod={profile.modules[activeModule]}
                onClose={() => setActiveModule(null)}
              />
            )}

            {/* AI Mentor + Gamification row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AiMentorCard profile={profile} />
              <GamificationCard profile={profile} tokens={MOCK_STATS.tokens} />
            </div>

            {/* Roadmap */}
            <RoadmapCard roadmap={profile.roadmap} />
          </div>

        </div>
      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function RoleIntelligenceCard({ account, profile }) {
  const name = account.fullName ?? account.name ?? "—";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined ms-filled text-blue-700 text-xl">badge</span>
        <h2 className="hg text-base font-bold text-gray-900">Role Intelligence</h2>
      </div>
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md"
          style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
        >
          {initials}
        </div>
        <div>
          <p className="hg text-lg font-bold text-gray-900 leading-tight">{name}</p>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>
      </div>
      {/* Details */}
      <div className="space-y-3 text-sm">
        <InfoPair icon="corporate_fare" label="Department" value={profile.dept} />
        <InfoPair icon="location_on" label="Branch" value={profile.branch} />
        <div className="flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">shield</span> Risk Level
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${riskBadgeCls(profile.riskLevel)}`}>
            {profile.riskLevel}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-start gap-2 mb-2">
            <span className="material-symbols-outlined text-red-500 text-base shrink-0 mt-0.5">warning</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weak Area</p>
              <p className="text-sm font-semibold text-red-600">{profile.weakArea}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 text-base shrink-0 mt-0.5">target</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Focus Area</p>
              <p className="text-sm font-semibold text-blue-700">{profile.focusArea}</p>
            </div>
          </div>
        </div>
        {/* AI Confidence */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined ms-filled text-sm">psychology</span> AI Confidence
            </span>
            <span className="text-xs font-bold text-blue-700">{profile.aiConfidence}%</span>
          </div>
          <div className="prog-track h-2">
            <div className="prog-fill h-2" style={{ width: `${profile.aiConfidence}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{profile.maturityLevel}</p>
        </div>
        {/* Streak */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="text-gray-500 flex items-center gap-1.5 text-sm">
            <span className="material-symbols-outlined ms-filled text-orange-500 text-base">local_fire_department</span>
            Learning Streak
          </span>
          <span className="font-bold text-orange-500 text-sm">{profile.streak} days</span>
        </div>
      </div>
    </div>
  );
}

function InfoPair({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-base">{icon}</span> {label}
      </span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function PerformanceBenchmarkCard({ profile }) {
  const pts = radarPoints(profile.radarScores);
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined ms-filled text-blue-700 text-xl">radar</span>
        <h2 className="hg text-base font-bold text-gray-900">Performance Benchmark</h2>
      </div>
      <div className="flex justify-center mb-4">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <polygon className="radar-grid" points="100,30 162,65 162,135 100,170 38,135 38,65" />
          <polygon className="radar-grid" points="100,52 143,75 143,125 100,148 57,125 57,75" />
          <polygon className="radar-grid" points="100,74 124,85 124,115 100,126 76,115 76,85" />
          <line x1="100" y1="30" x2="100" y2="170" stroke="rgba(195,198,209,0.5)" strokeWidth="1" />
          <line x1="38"  y1="65" x2="162" y2="135" stroke="rgba(195,198,209,0.5)" strokeWidth="1" />
          <line x1="162" y1="65" x2="38"  y2="135" stroke="rgba(195,198,209,0.5)" strokeWidth="1" />
          <polygon className="radar-polygon" points={pts} />
          <text x="100" y="22"  textAnchor="middle" fontSize="9" fill="#43474f" fontFamily="Inter" fontWeight="600">Compliance</text>
          <text x="172" y="62"  textAnchor="start"  fontSize="9" fill="#43474f" fontFamily="Inter" fontWeight="600">Phishing</text>
          <text x="172" y="142" textAnchor="start"  fontSize="9" fill="#43474f" fontFamily="Inter" fontWeight="600">Endpoint</text>
          <text x="100" y="184" textAnchor="middle" fontSize="9" fill="#43474f" fontFamily="Inter" fontWeight="600">Data Privacy</text>
          <text x="28"  y="142" textAnchor="end"    fontSize="9" fill="#43474f" fontFamily="Inter" fontWeight="600">Social Eng.</text>
          <text x="28"  y="62"  textAnchor="end"    fontSize="9" fill="#43474f" fontFamily="Inter" fontWeight="600">Risk Mgmt</text>
        </svg>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed text-center">{profile.benchmarkNote}</p>
    </div>
  );
}

function ModuleCard({ mod, active, onOpen }) {
  const btnBase = "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-36 shrink-0";
  const btnCls =
    mod.btnStyle === "primary"   ? `${btnBase} text-white hover:brightness-110`
    : mod.btnStyle === "outline" ? `${btnBase} text-[#003366] border-2 border-[#3a5f94] hover:bg-[#d5e3ff]`
    :                              `${btnBase} text-[#43474f] bg-[#e8e8ed] hover:bg-[#d5d5de]`;
  const btnStyle =
    mod.btnStyle === "primary" ? { background: "linear-gradient(135deg,#003366,#3a5f94)" } : {};

  return (
    <div className={`card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,30,64,0.13)] ${active ? "ring-2 ring-blue-500" : ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${mod.tagCls}`}>{mod.tag}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>{mod.level}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              <span className="material-symbols-outlined text-sm">schedule</span>{mod.time}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
              <span className="material-symbols-outlined ms-filled text-sm">toll</span>+{mod.tokens} ISP
            </span>
          </div>
          <h3 className="hg text-base font-bold text-gray-900 mb-1">{mod.title}</h3>
          <p className="text-xs text-gray-500 mb-3">{mod.note}</p>
          {mod.progress > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs font-semibold text-blue-700">{mod.progress}%</span>
              </div>
              <div className="prog-track h-2 mb-1">
                <div className="prog-fill h-2" style={{ width: `${mod.progress}%` }} />
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={onOpen} className={btnCls} style={btnStyle}>
          <span className="material-symbols-outlined text-base">play_arrow</span>
          {mod.btn}
        </button>
      </div>
    </div>
  );
}

function VideoPlaceholder({ mod, onClose }) {
  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
        style={{ background: "linear-gradient(135deg,#001e40,#003366)" }}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined ms-filled text-blue-300 text-xl">play_circle</span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{mod.title}</p>
            <p className="text-[11px] text-blue-300">Role-Specific Training</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
      {/* Placeholder (no video files in project) */}
      <div className="bg-[#0a1628] flex flex-col items-center justify-center min-h-[280px] gap-3">
        <span className="material-symbols-outlined text-[60px] text-[#3a5f94]">play_circle</span>
        <p className="text-[#a7c8ff] text-[13px] font-semibold text-center px-6">{mod.title}</p>
        <p className="text-[#5a7fa8] text-[11px]">Video module · launching soon</p>
      </div>
      {/* Progress + token row */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 prog-track h-2">
            <div className="prog-fill h-2" style={{ width: `${mod.progress}%` }} />
          </div>
          <span className="text-xs font-bold text-blue-700 whitespace-nowrap">{mod.progress}% Complete</span>
        </div>
        <div className="tok-badge">
          <span className="material-symbols-outlined ms-filled" style={{ fontSize: 13 }}>toll</span>
          +{mod.tokens} ISP on completion
        </div>
      </div>
    </div>
  );
}

function AiMentorCard({ profile }) {
  return (
    <div className="card-dark p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined ms-filled text-yellow-300 text-xl">auto_awesome</span>
        <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">AI Security Mentor</span>
      </div>
      <p className="text-blue-100 text-sm leading-relaxed flex-1">{profile.aiNudge}</p>
      <span className="inline-flex items-center gap-1.5 text-yellow-300 text-sm font-semibold mt-auto">
        See Role Insights
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </span>
    </div>
  );
}

function GamificationCard({ profile, tokens }) {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined ms-filled text-orange-500 text-xl">emoji_events</span>
        <h3 className="hg text-base font-bold text-gray-900">Your Progress</h3>
      </div>
      <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined ms-filled text-orange-500 text-2xl">local_fire_department</span>
          <div>
            <p className="text-xs text-gray-500 font-medium">Learning Streak</p>
            <p className="hg text-lg font-bold text-orange-600">{profile.streak} days</p>
          </div>
        </div>
        <span className="text-xs text-orange-400 font-semibold">Keep it up!</span>
      </div>
      <div className="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined ms-filled text-yellow-500 text-2xl">toll</span>
          <div>
            <p className="text-xs text-gray-500 font-medium">ISP Tokens</p>
            <p className="hg text-lg font-bold text-yellow-700">{tokens.toLocaleString()}</p>
          </div>
        </div>
        <span className="tok-badge">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>toll</span> ISP
        </span>
      </div>
      <div className="flex items-center gap-2 px-1">
        <span className="material-symbols-outlined ms-filled text-blue-600 text-base">military_tech</span>
        <p className="text-sm font-semibold text-gray-700">{profile.maturityLevel}</p>
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined ms-filled text-blue-700 text-xl">route</span>
        <h2 className="hg text-base font-bold text-gray-900">Certification Roadmap</h2>
      </div>
      <div className="relative flex items-center justify-between px-2">
        {roadmap.map((step, i) => {
          const isLast = i === roadmap.length - 1;
          const isCompleted = step.status === "completed";
          const isActive = step.status === "active";
          const circleCls = isCompleted
            ? "bg-green-100 border-2 border-green-600"
            : isActive
            ? "bg-blue-100 border-2 border-blue-700"
            : "bg-gray-100 border-2 border-dashed border-gray-300";
          const labelCls = isCompleted
            ? "text-green-700"
            : isActive
            ? "text-blue-700"
            : "text-gray-400";
          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {!isLast && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${isCompleted ? "bg-green-400" : "bg-gray-200"}`}
                  style={{ transform: "translateY(-50%)", zIndex: 0 }}
                />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${circleCls}`}>
                {isCompleted
                  ? <span className="material-symbols-outlined ms-filled text-green-700 text-lg">check_circle</span>
                  : isActive
                  ? <span className="material-symbols-outlined ms-filled text-blue-700 text-lg">radio_button_checked</span>
                  : <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                }
              </div>
              <p className={`text-xs font-semibold mt-2 text-center ${labelCls}`}>{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
