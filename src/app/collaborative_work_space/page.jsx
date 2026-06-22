"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ── Static data ─────────────────────────────────────────────────────────────
const TIPS = [
  {
    id: 1, category: "Phishing", icon: "alternate_email", iconBg: "bg-red-50", iconColor: "text-red-600",
    author: "IT Security Team", time: "2 hours ago",
    title: "New phishing campaign targeting banking staff",
    body: "Our threat intelligence team has identified a wave of credential-harvesting emails impersonating NBE audit notifications. These emails contain urgent language and a link to a spoofed portal. Do NOT click any link. Report immediately via the 'Report Phishing' button in Outlook.",
    likes: 24, tag: "Alert",
  },
  {
    id: 2, category: "Password", icon: "vpn_key", iconBg: "bg-purple-50", iconColor: "text-purple-600",
    author: "Information Security Officer", time: "Yesterday",
    title: "Reminder: Q3 mandatory password rotation",
    body: "All staff are required to rotate their core system passwords before 30 June 2025. Passwords must be at least 12 characters, include a mix of uppercase, lowercase, numbers, and symbols, and must not reuse the last five passwords. Contact the helpdesk if you are locked out.",
    likes: 18, tag: "Policy",
  },
  {
    id: 3, category: "Awareness", icon: "lightbulb", iconBg: "bg-yellow-50", iconColor: "text-yellow-600",
    author: "Cyber Awareness Champion", time: "2 days ago",
    title: "5 habits that make you a hard target for attackers",
    body: "1) Verify unexpected requests via a second channel. 2) Never plug in unknown USB devices. 3) Lock your screen before stepping away. 4) Use the VPN when accessing internal systems remotely. 5) Report anything suspicious — even minor anomalies can be the first sign of a larger attack.",
    likes: 41, tag: "Tip",
  },
  {
    id: 4, category: "Incident", icon: "warning", iconBg: "bg-orange-50", iconColor: "text-orange-600",
    author: "IT Security Team", time: "3 days ago",
    title: "Reminder: How to report a security incident",
    body: "If you suspect a compromise — unusual account activity, unexpected emails sent from your address, or files you don't recognise — stop using your device and call the Security Operations Centre on ext. 4444 immediately. Do not attempt to investigate or remediate yourself.",
    likes: 15, tag: "Alert",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Test Employee 012", dept: "Risk & Compliance", score: 980, badge: "🥇", completed: 5 },
  { rank: 2, name: "Test Employee 047", dept: "IT Operations",     score: 940, badge: "🥈", completed: 5 },
  { rank: 3, name: "Test Employee 023", dept: "Customer Banking",  score: 910, badge: "🥉", completed: 5 },
  { rank: 4, name: "Test Employee 061", dept: "Finance",           score: 875, badge: "",   completed: 4 },
  { rank: 5, name: "Test Employee 008", dept: "HR",                score: 860, badge: "",   completed: 4 },
  { rank: 6, name: "Test Employee 099", dept: "Branch Operations", score: 820, badge: "",   completed: 4 },
  { rank: 7, name: "Test Employee 034", dept: "Audit",             score: 795, badge: "",   completed: 3 },
  { rank: 8, name: "Test Employee 075", dept: "Risk & Compliance", score: 780, badge: "",   completed: 3 },
];

const RESOURCES = [
  { icon: "description", label: "NBE Cybersecurity Directive 2024",  sub: "Official regulatory guidance",    color: "text-blue-700" },
  { icon: "shield",      label: "Nisir Bank ISP Handbook (v4)",       sub: "Full policy document — PDF",      color: "text-indigo-700" },
  { icon: "report",      label: "Incident Report Template",           sub: "Word document — fillable form",   color: "text-red-600" },
  { icon: "quiz",        label: "Security Awareness Quick Reference", sub: "A5 desktop guide — PDF",          color: "text-emerald-600" },
];

const TAG_STYLE = {
  Alert:  "bg-[#ffdad6] text-[#93000a]",
  Policy: "bg-[#d5e3ff] text-[#1f477b]",
  Tip:    "bg-[#d4f5e2] text-[#1a6640]",
};

// ── Page ────────────────────────────────────────────────────────────────────
export default function CollaborativeWorkSpace() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [likedIds, setLikedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) { router.replace("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "ADMIN") { router.replace("/admin_dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(parsed);
  }, [router]);

  if (!account) return <main className="min-h-screen bg-[#f0f4fb]" />;

  function toggleLike(id) {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: 'Hanken Grotesk', sans-serif; }
        .badge-pill { display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em; }
        .hero-banner {
          background: linear-gradient(135deg,#001e40 0%,#003366 45%,#1f477b 100%);
          position:relative; overflow:hidden;
        }
        .hero-banner::before {
          content:""; position:absolute; inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-orb { position:absolute;border-radius:999px;filter:blur(60px);opacity:0.15;pointer-events:none; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle; }
      `}</style>

      {/* ── Hero banner ── */}
      <section className="hero-banner px-4 sm:px-6 py-10">
        <div className="hero-orb w-80 h-80 bg-blue-400" style={{ top: "-60px", right: "-40px" }} />
        <div className="hero-orb w-56 h-56 bg-indigo-300" style={{ bottom: "-40px", left: "10%" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white/95 shadow shrink-0">
              <img src="/images/nisir_bank_logo.svg" alt="Nisir Bank S.C." className="h-8 w-8 object-contain" />
            </div>
            <span className="text-white/70 text-xs font-semibold">Nisir Bank S.C.</span>
          </div>
          <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
            Security Education, Training &amp; Awareness
          </p>
          <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight mb-2">
            Security Community
          </h1>
          <p className="text-blue-200 text-sm">
            Security bulletins · leaderboard · resources · all in one place
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[rgba(195,198,209,0.4)] shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
              </div>
              <div>
                <p className={`hg text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-[#001e40] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === "feed" && (
          <FeedPanel likedIds={likedIds} onToggleLike={toggleLike} />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardPanel currentName={account.fullName ?? account.name} />
        )}
        {activeTab === "resources" && <ResourcesPanel />}

      </div>
    </main>
  );
}

// ── Static constants (avoid re-allocation on every render) ──────────────────
const STATS = [
  { icon: "group",        label: "Active Members",      value: "105",     color: "text-blue-700" },
  { icon: "campaign",     label: "Bulletins This Month", value: TIPS.length, color: "text-red-600" },
  { icon: "emoji_events", label: "Top Score",            value: "980 ISP", color: "text-yellow-600" },
  { icon: "verified",     label: "Fully Compliant",      value: "3",       color: "text-emerald-600" },
];

const TABS = [
  { key: "feed",        label: "Security Bulletins", icon: "campaign" },
  { key: "leaderboard", label: "Leaderboard",        icon: "leaderboard" },
  { key: "resources",   label: "Resources",          icon: "folder_open" },
];

// ── Tab panels ──────────────────────────────────────────────────────────────
function FeedPanel({ likedIds, onToggleLike }) {
  return (
    <div className="space-y-4">
      {TIPS.map((tip) => (
        <div
          key={tip.id}
          className="bg-white rounded-[18px] border border-[rgba(195,198,209,0.4)] shadow-[0_2px_10px_rgba(0,30,64,0.05)] p-5"
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-2xl ${tip.iconBg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined ${tip.iconColor} text-xl`}>{tip.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`badge-pill ${TAG_STYLE[tip.tag] || "bg-gray-100 text-gray-600"}`}>
                  {tip.tag}
                </span>
                <span className="text-[11px] text-gray-400">{tip.author} · {tip.time}</span>
              </div>
              <h3 className="hg text-sm font-bold text-gray-900 mb-1.5">{tip.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{tip.body}</p>
              <div className="flex items-center gap-4 mt-3">
                <button
                  type="button"
                  onClick={() => onToggleLike(tip.id)}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                    likedIds.includes(tip.id) ? "text-blue-700" : "text-gray-400 hover:text-blue-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {likedIds.includes(tip.id) ? "thumb_up" : "thumb_up_off_alt"}
                  </span>
                  {tip.likes + (likedIds.includes(tip.id) ? 1 : 0)} helpful
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardPanel({ currentName }) {
  return (
    <div className="bg-white rounded-[20px] border border-[rgba(195,198,209,0.4)] shadow-sm overflow-hidden">
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg,#001e40,#003366,#1f477b)" }}
      >
        <span className="material-symbols-outlined text-yellow-400 text-2xl">emoji_events</span>
        <div>
          <h2 className="hg text-base font-bold text-white">ISP Compliance Leaderboard</h2>
          <p className="text-blue-300 text-[11px]">Ranked by total ISP tokens earned · June 2025</p>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {LEADERBOARD.map((entry) => {
          const isMe = entry.name === currentName;
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 px-6 py-3 transition-colors ${isMe ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <div className="w-8 text-center">
                {entry.badge
                  ? <span className="text-xl">{entry.badge}</span>
                  : <span className="hg text-sm font-bold text-gray-400">{entry.rank}</span>}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white text-xs font-black shrink-0">
                {entry.name.split(" ").slice(-1)[0].slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`hg text-sm font-bold truncate ${isMe ? "text-blue-700" : "text-gray-900"}`}>
                  {entry.name}
                  {isMe && <span className="text-[10px] font-normal text-blue-500 ml-1">(you)</span>}
                </p>
                <p className="text-[11px] text-gray-400">{entry.dept}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="hg text-sm font-bold text-gray-900">{entry.score} ISP</p>
                <p className="text-[11px] text-gray-400">{entry.completed}/5 modules</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 text-center">
          Complete all 5 assessment modules to qualify for the final leaderboard ranking.
        </p>
      </div>
    </div>
  );
}

function ResourcesPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-[#001e40] rounded-2xl p-5 flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-300 text-3xl shrink-0">info</span>
        <div>
          <p className="hg text-sm font-bold text-white mb-1">Official Security Resources</p>
          <p className="text-blue-200 text-xs leading-relaxed">
            The documents below are official Nisir Bank and NBE security references. Access is logged for audit
            purposes. Contact the IT Security team if you cannot access a resource.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RESOURCES.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-[18px] border border-[rgba(195,198,209,0.4)] shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
              <span className={`material-symbols-outlined text-2xl ${r.color}`}>{r.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="hg text-sm font-bold text-gray-900 truncate">{r.label}</p>
              <p className="text-[11px] text-gray-400">{r.sub}</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-600 transition-colors text-xl shrink-0">
              download
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[18px] border border-[rgba(195,198,209,0.4)] shadow-sm p-5">
        <h3 className="hg text-sm font-bold text-gray-900 mb-4">Quick Contacts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CONTACTS.map((c, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${c.bg}`}>
              <span className={`material-symbols-outlined ${c.color} text-xl`}>{c.icon}</span>
              <div>
                <p className={`hg text-xs font-bold ${c.color}`}>{c.label}</p>
                <p className="text-[11px] text-gray-500">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CONTACTS = [
  { icon: "support_agent", label: "IT Helpdesk",         sub: "Ext. 4000 — 24/7",       color: "text-blue-700",   bg: "bg-blue-50" },
  { icon: "security",      label: "Security Operations", sub: "Ext. 4444 — Incidents",   color: "text-red-600",    bg: "bg-red-50" },
  { icon: "mail",          label: "Report Phishing",     sub: "security@nisirbank.et",   color: "text-emerald-600", bg: "bg-emerald-50" },
];
