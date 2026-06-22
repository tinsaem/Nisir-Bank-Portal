"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ── Module catalogue ────────────────────────────────────────────────────────
const MODULES = [
  {
    key: "intro",
    title: "Introduction to Information Security Policies",
    duration: "15 mins",
    difficulty: "Beginner",
    diffCls: "bg-[#d5e3ff] text-[#1f477b]",
    category: "Foundation",
    tokens: "+100 ISP",
    icon: "policy",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    desc: "Build your foundation with an overview of Nisir Bank's information security policy framework.",
    badge: "In Progress",
    badgeCls: "bg-[#ffdbca] text-[#723610]",
    btn: "Continue",
    priority: false,
    aiNote: null,
  },
  {
    key: "phishing",
    title: "Phishing Awareness Training",
    duration: "30 mins",
    difficulty: "Intermediate",
    diffCls: "bg-[#ffdbca] text-[#723610]",
    category: "Threat Awareness",
    tokens: "+200 ISP",
    icon: "alternate_email",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    desc: "Identify advanced phishing tactics and social engineering used against bank staff.",
    badge: "⚠ Priority",
    badgeCls: "bg-[#ffdad6] text-[#93000a]",
    btn: "Priority Study",
    priority: true,
    aiNote: "Phishing is the #1 threat vector targeting bank employees — this is your most critical module.",
  },
  {
    key: "org",
    title: "Organization Security Policy",
    duration: "20 mins",
    difficulty: "Beginner",
    diffCls: "bg-[#d5e3ff] text-[#1f477b]",
    category: "Policy",
    tokens: "+120 ISP",
    icon: "policy",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    desc: "Master the high-level framework that governs Nisir Bank's information security posture.",
    badge: "Recommended",
    badgeCls: "bg-[#d5e3ff] text-[#1f477b]",
    btn: "Start Learning",
    priority: false,
    aiNote: "Policy knowledge underpins all compliance scores.",
  },
  {
    key: "data",
    title: "Customer Data Protection",
    duration: "25 mins",
    difficulty: "Intermediate",
    diffCls: "bg-[#ffdbca] text-[#723610]",
    category: "Compliance",
    tokens: "+160 ISP",
    icon: "account_balance_wallet",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    desc: "Essential guidelines for handling PII and ensuring compliance with NBE data directives.",
    badge: "",
    badgeCls: "",
    btn: "Start Learning",
    priority: false,
    aiNote: null,
  },
  {
    key: "password",
    title: "Password Security Awareness",
    duration: "10 mins",
    difficulty: "Beginner",
    diffCls: "bg-[#d5e3ff] text-[#1f477b]",
    category: "Access Control",
    tokens: "+80 ISP",
    icon: "vpn_key",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    desc: "Best practices for credential management and multi-factor authentication.",
    badge: "",
    badgeCls: "",
    btn: "Start Learning",
    priority: false,
    aiNote: null,
  },
  {
    key: "email",
    title: "Secure Email Usage",
    duration: "15 mins",
    difficulty: "Beginner",
    diffCls: "bg-[#d5e3ff] text-[#1f477b]",
    category: "Communication",
    tokens: "+100 ISP",
    icon: "shield",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    desc: "Preventing data leakage and identifying malicious attachments in daily communication.",
    badge: "Trending",
    badgeCls: "bg-[#ffdbca] text-[#723610]",
    btn: "Start Learning",
    priority: false,
    aiNote: null,
  },
  {
    key: "incident",
    title: "Incident Reporting Procedures",
    duration: "12 mins",
    difficulty: "Intermediate",
    diffCls: "bg-[#ffdbca] text-[#723610]",
    category: "Response",
    tokens: "+120 ISP",
    icon: "notification_important",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    desc: "Step-by-step workflow for reporting suspicious activities or data breaches.",
    badge: "",
    badgeCls: "",
    btn: "Start Learning",
    priority: false,
    aiNote: null,
  },
  {
    key: "social",
    title: "Social Engineering Awareness",
    duration: "18 mins",
    difficulty: "Advanced",
    diffCls: "bg-[#ffdad6] text-[#93000a]",
    category: "Threat Awareness",
    tokens: "+150 ISP",
    icon: "psychology",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    desc: "Recognize and resist manipulation tactics used by threat actors in the field.",
    badge: "AI Pick",
    badgeCls: "bg-[#d4f5e2] text-[#1a6640]",
    btn: "Start Learning",
    priority: false,
    aiNote: "Social engineering is closely linked to phishing attacks.",
  },
];

const RESOURCES = [
  { label: "Lesson Slide Deck",     meta: "PDF · 2.4 MB" },
  { label: "Policy Summary",        meta: "PDF · 1.1 MB" },
  { label: "Quick Reference Guide", meta: "PDF · 850 KB" },
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function FoundationalLearningPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [activeKey, setActiveKey] = useState("intro");
  const heroRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) { router.replace("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "ADMIN") { router.replace("/admin_dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(parsed);
  }, [router]);

  if (!account) return <main className="min-h-screen bg-[#f0f4fb]" />;

  const mod = MODULES.find((m) => m.key === activeKey) ?? MODULES[0];

  function select(key) {
    setActiveKey(key);
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: 'Hanken Grotesk', sans-serif; }
        .hero-banner {
          background: linear-gradient(135deg, #001e40 0%, #003366 45%, #1f477b 100%);
          position: relative; overflow: hidden;
        }
        .hero-banner::before {
          content: "";
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-orb {
          position: absolute; border-radius: 999px;
          filter: blur(60px); opacity: 0.15; pointer-events: none;
        }
        .section-card {
          background: white; border-radius: 20px;
          border: 1px solid rgba(195,198,209,0.4);
          box-shadow: 0 2px 12px rgba(0,30,64,0.06);
          transition: transform 0.2s, box-shadow 0.25s;
        }
        .badge-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 99px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
          vertical-align: middle;
        }
      `}</style>

      {/* ── Hero banner ── */}
      <section className="hero-banner px-4 sm:px-6 py-10" ref={heroRef}>
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
            Foundational Learning
          </h1>
          <p className="text-blue-200 text-sm">
            {MODULES.length} modules · self-paced · earn ISP tokens for every module completed
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Video + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Video card */}
          <div className="lg:col-span-2 section-card overflow-hidden">
            <div className="bg-[#0a1628] flex flex-col items-center justify-center min-h-[280px] gap-3">
              <span className="material-symbols-outlined text-[60px] text-[#3a5f94]">play_circle</span>
              <p className="text-[#a7c8ff] text-[13px] font-semibold text-center px-6">{mod.title}</p>
              <p className="text-[#5a7fa8] text-[11px]">Video module · launching soon</p>
            </div>

            <div className="p-5">
              <h2 className="hg text-lg font-bold text-gray-900 mb-3">{mod.title}</h2>

              {/* Progress */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 bg-[#e8e8ed] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: activeKey === "intro" ? "45%" : "0%", background: "linear-gradient(90deg,#3a5f94,#a7c8ff)" }}
                  />
                </div>
                <span className="text-xs font-bold text-blue-700 whitespace-nowrap">
                  {activeKey === "intro" ? "45%" : "0%"} Complete
                </span>
              </div>

              {/* Resources */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Downloadable Resources
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RESOURCES.map((r) => (
                    <a
                      key={r.label}
                      href="#"
                      className="flex items-center gap-2.5 px-3 py-2.5 border border-[rgba(195,198,209,0.5)] rounded-xl bg-[#f8f9fc] hover:border-[#3a5f94] hover:bg-[#eef3fb] transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-500 text-xl">picture_as_pdf</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{r.label}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{r.meta}</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 text-base">download</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="flex flex-col gap-4">
            {/* Course info */}
            <div className="section-card p-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Course Info</p>
              <div className="space-y-3">
                <InfoRow icon="schedule"  color="text-blue-500"   label="Duration"   value={<span className="text-xs font-bold text-gray-800">{mod.duration}</span>} />
                <InfoRow icon="bar_chart" color="text-blue-500"   label="Difficulty" value={<span className={`badge-pill ${mod.diffCls}`}>{mod.difficulty}</span>} />
                <InfoRow icon="category"  color="text-purple-500" label="Category"   value={<span className="text-xs font-bold text-gray-800">{mod.category}</span>} />
                <InfoRow icon="toll"      color="text-yellow-500" label="Reward"     value={<span className="text-xs font-bold text-yellow-600">{mod.tokens}</span>} />
              </div>
            </div>

            {/* Performance card */}
            <div
              className="rounded-2xl p-5 flex-1 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#001e40,#003366,#1f477b)", boxShadow: "0 8px 28px rgba(0,30,64,0.3)" }}
            >
              <div className="absolute top-0 right-0 opacity-[0.06] pointer-events-none select-none">
                <span className="material-symbols-outlined" style={{ fontSize: 110 }}>insights</span>
              </div>
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-4">Training Performance</p>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[11px] text-blue-300 mb-0.5">Learning Streak</p>
                  <p className="hg text-2xl font-bold text-white">7 Days 🔥</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-300 mb-1">Modules Completed</p>
                  <div className="bg-white/20 rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: "12%", background: "linear-gradient(90deg,#3a5f94,#a7c8ff)" }} />
                  </div>
                  <p className="hg text-lg font-bold text-white">
                    1 <span className="text-blue-300 text-sm font-normal">/ 8</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-blue-300 mb-0.5">Score</p>
                    <p className="hg text-xl font-bold text-white">—</p>
                  </div>
                  <div className="bg-red-500/20 rounded-xl p-3 text-center border border-red-400/30">
                    <p className="text-[10px] text-red-300 mb-0.5">Focus Area</p>
                    <p className="hg text-sm font-bold text-red-200">Phishing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Module grid ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-700 text-xl">library_books</span>
              </div>
              <h2 className="hg text-xl font-bold text-gray-900">SETA Modules</h2>
            </div>
            <span className="text-xs text-gray-400 font-semibold">{MODULES.length} modules available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {MODULES.map((m) => (
              <ModuleCard key={m.key} mod={m} active={m.key === activeKey} onSelect={select} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function InfoRow({ icon, color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`material-symbols-outlined text-base ${color}`}>{icon}</span>
        {label}
      </span>
      {value}
    </div>
  );
}

function ModuleCard({ mod, active, onSelect }) {
  return (
    <article
      className={`bg-white rounded-[18px] flex flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(0,30,64,0.12)] ${
        mod.priority
          ? "border-2 border-[rgba(186,26,26,0.3)] bg-[#fffafa]"
          : "border border-[rgba(195,198,209,0.4)] shadow-[0_2px_10px_rgba(0,30,64,0.05)]"
      } ${active ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${mod.iconBg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${mod.iconColor} text-2xl`}>{mod.icon}</span>
        </div>
        {mod.badge && <span className={`badge-pill ${mod.badgeCls}`}>{mod.badge}</span>}
      </div>

      <h3 className="hg text-sm font-bold text-gray-900 mb-1">{mod.title}</h3>

      {mod.aiNote && (
        <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-3">
          <span
            className="material-symbols-outlined text-blue-500 text-sm mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}
          >
            auto_awesome
          </span>
          <p className="text-[11px] text-blue-700 leading-relaxed">{mod.aiNote}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 flex-1 mb-3 leading-relaxed">{mod.desc}</p>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
        <span className="material-symbols-outlined text-sm">timer</span>
        {mod.duration}
      </div>

      <button
        type="button"
        onClick={() => onSelect(mod.key)}
        className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 mb-3 transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ background: mod.priority ? "linear-gradient(135deg,#ba1a1a,#e53935)" : "linear-gradient(135deg,#003366,#3a5f94)" }}
      >
        <span className="material-symbols-outlined text-base">{mod.priority ? "emergency" : "play_circle"}</span>
        {mod.btn}
      </button>

      <div className="flex gap-2">
        {[
          ["picture_as_pdf", "text-red-400",   "Policy"],
          ["menu_book",       "text-blue-400",  "Guide"],
          ["checklist",       "text-green-500", "Check"],
        ].map(([icon, cls, lbl]) => (
          <button
            key={lbl}
            type="button"
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 border border-[rgba(195,198,209,0.5)] rounded-xl bg-[#f8f9fc] hover:border-[#3a5f94] hover:bg-[#eef3fb] transition-colors"
          >
            <span className={`material-symbols-outlined ${cls} text-base`}>{icon}</span>
            <span className="text-[9px] text-gray-500 font-semibold">{lbl}</span>
          </button>
        ))}
      </div>
    </article>
  );
}
