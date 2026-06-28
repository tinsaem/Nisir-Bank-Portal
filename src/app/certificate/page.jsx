"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EmployeeNav from "@/components/EmployeeNav";

// ── Certification catalogue ───────────────────────────────────────────────────
const CERTS = [
  {
    id: "nbe-cac",
    level: 1,
    levelLabel: "Foundation",
    levelCls: "bg-sky-100 text-sky-800",
    badge: "NBE-CAC",
    title: "Cybersecurity Awareness Certificate",
    issuer: "National Bank of Ethiopia",
    description:
      "The mandatory entry-level credential confirming proficiency in core cybersecurity principles for all banking staff. Required by NBE Directive No. 17/2024 for regulatory compliance reporting.",
    icon: "verified_user",
    accent: ["#0c1f4a", "#1a3a6b"],
    questions: 30,
    minutes: 45,
    passingScore: 75,
    validityYears: 2,
    tokenReward: 500,
    prerequisites: [
      { label: "Introduction to Information Security", done: false },
      { label: "Phishing & Social Engineering Awareness", done: false },
      { label: "Email Threat Awareness", done: false },
      { label: "Password Management & MFA", done: false },
    ],
    skills: ["Threat identification", "Safe browsing", "Password hygiene", "Incident awareness"],
    recognition: [
      "NBE Compliance Requirement — Directive 17/2024",
      "Permanent entry in your employee training record",
    ],
    sampleQuestions: [
      {
        q: "An email arrives from 'it-support@nisirbank-helpdesk.com' asking you to reset your banking portal password. What should you do?",
        options: [
          "Click the link in the email and reset your password immediately",
          "Forward the email to your manager and ignore the link",
          "Verify the sender domain, then report to IT Security via the official portal",
          "Reply to confirm whether the email is legitimate before acting",
        ],
        answer: 2,
      },
      {
        q: "Which of the following is the strongest password for a banking system?",
        options: [
          "NisirBank2024",
          "P@ssw0rd!",
          "Tr!45#kL9@mQ",
          "My name is Tinsae",
        ],
        answer: 2,
      },
      {
        q: "You notice a colleague's computer is left unlocked and unattended at the teller counter. What is the correct action?",
        options: [
          "Log the computer out yourself to protect customer data",
          "Leave it — it is not your responsibility",
          "Notify your supervisor and remind the colleague of the clear-desk policy",
          "Check if any sensitive data is visible on screen",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "pds",
    level: 2,
    levelLabel: "Practitioner",
    levelCls: "bg-emerald-100 text-emerald-800",
    badge: "PDS",
    title: "Phishing Detection Specialist",
    issuer: "Nisir Bank Security Operations Centre",
    description:
      "Demonstrates advanced skill in identifying and neutralising phishing attacks targeting banking operations and customer data. Required for all staff handling electronic communications.",
    icon: "phishing",
    accent: ["#0f3d26", "#1a5c38"],
    questions: 25,
    minutes: 35,
    passingScore: 80,
    validityYears: 1,
    tokenReward: 400,
    prerequisites: [
      { label: "NBE-CAC (Foundation Level) — required first", done: false },
      { label: "Phishing Detection for your role (Role-Specific Training)", done: false },
      { label: "Email Threat Awareness (module score ≥ 80%)", done: false },
    ],
    skills: ["Email header analysis", "Link & attachment inspection", "Social engineering defence", "Suspicious email reporting"],
    recognition: [
      "Internal Specialist Record — Security Operations",
      "Nisir Bank SETA Leaderboard badge",
    ],
    sampleQuestions: [
      {
        q: "Which email header field is most reliable for verifying the true origin of an email?",
        options: [
          "The 'From' display name",
          "The 'Reply-To' address",
          "The 'Received' header chain",
          "The 'Subject' line",
        ],
        answer: 2,
      },
      {
        q: "A link in an email reads 'https://nbe.gov.et.login.verify-account.ru/…'. Why is this suspicious?",
        options: [
          "It uses HTTPS so it must be safe",
          "The actual domain is 'verify-account.ru', not 'nbe.gov.et'",
          "Government websites never use HTTPS",
          "The URL is too long",
        ],
        answer: 1,
      },
      {
        q: "A customer calls saying they received an SMS claiming to be from Nisir Bank, asking for their PIN. What do you tell them?",
        options: [
          "It may be legitimate — ask them to provide the PIN to verify",
          "Nisir Bank will never ask for a PIN via SMS; they should delete the message and call the official helpline",
          "Tell them to reply STOP to unsubscribe",
          "Ask them to forward the SMS to you",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "dpco",
    level: 2,
    levelLabel: "Practitioner",
    levelCls: "bg-violet-100 text-violet-800",
    badge: "DPCO",
    title: "Data Privacy & Compliance Officer",
    issuer: "National Bank of Ethiopia",
    description:
      "Validates expertise in Ethiopian data protection law, NBE data security directives, and the handling of sensitive customer and financial information in compliance with FDRE proclamations.",
    icon: "policy",
    accent: ["#3b0764", "#5b21b6"],
    questions: 40,
    minutes: 60,
    passingScore: 80,
    validityYears: 2,
    tokenReward: 600,
    prerequisites: [
      { label: "NBE-CAC (Foundation Level) — required first", done: false },
      { label: "Compliance & Regulatory Awareness", done: false },
      { label: "Customer Data Privacy (Customer Relations staff)", done: false },
      { label: "Endpoint Security Essentials", done: false },
    ],
    skills: ["PII classification & handling", "NBE Directive compliance", "Data breach notification", "Retention & disposal procedures"],
    recognition: [
      "NBE Compliance Requirement — Directives 15 & 17/2024",
      "Internal Legal & Compliance record",
    ],
    sampleQuestions: [
      {
        q: "Under Ethiopian law, which category of data requires the highest level of protection?",
        options: [
          "Employee attendance records",
          "Customer transaction history and biometric data",
          "Public-facing product brochures",
          "Branch opening hours",
        ],
        answer: 1,
      },
      {
        q: "A customer requests to view all data Nisir Bank holds about them. Under the NBE data privacy directive, within how many working days must the bank respond?",
        options: [
          "3 days",
          "7 days",
          "15 days",
          "30 days",
        ],
        answer: 3,
      },
      {
        q: "You accidentally email a customer's account statement to the wrong address. What is the correct immediate action?",
        options: [
          "Wait to see if the recipient responds before taking action",
          "Delete the sent email from your outbox",
          "Immediately notify your supervisor and the Data Protection Officer",
          "Ask the recipient to delete the email",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "sir",
    level: 3,
    levelLabel: "Expert",
    levelCls: "bg-orange-100 text-orange-800",
    badge: "SIR",
    title: "Security Incident Responder",
    issuer: "Nisir Bank Security Operations Centre",
    description:
      "Advanced certification for staff serving as first-line security incident responders at branch level. Credential holders are listed in the Branch Security Contact directory.",
    icon: "emergency",
    accent: ["#431407", "#9a3412"],
    questions: 50,
    minutes: 90,
    passingScore: 85,
    validityYears: 1,
    tokenReward: 800,
    prerequisites: [
      { label: "NBE-CAC (Foundation) — required first", done: false },
      { label: "Phishing Detection Specialist (Practitioner) — required first", done: false },
      { label: "Endpoint Security Essentials", done: false },
      { label: "Incident Response Simulation (Role-Specific Training)", done: false },
    ],
    skills: ["Incident classification (P1–P4)", "Escalation procedures", "Evidence preservation", "Post-incident reporting"],
    recognition: [
      "Branch Security Contact Directory listing",
      "Internal Security Champion Career Track",
    ],
    sampleQuestions: [
      {
        q: "A teller reports that their terminal suddenly displays a ransom note. What is the FIRST action you should take?",
        options: [
          "Pay the ransom using petty cash",
          "Restart the machine to clear the message",
          "Disconnect the terminal from the network and immediately notify IT Security",
          "Continue working on a different terminal and report at end of day",
        ],
        answer: 2,
      },
      {
        q: "What does a 'P1 – Critical' incident classification mean under Nisir Bank's incident response framework?",
        options: [
          "A minor user error with no data loss",
          "A possible threat that requires investigation",
          "An active breach affecting core banking systems or customer data in real time",
          "A hardware failure with no security implications",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "sc",
    level: 4,
    levelLabel: "Master",
    levelCls: "bg-amber-100 text-amber-800",
    badge: "SC",
    title: "Security Champion",
    issuer: "National Bank of Ethiopia & Nisir Bank",
    description:
      "The highest security credential awarded by Nisir Bank. Security Champions mentor colleagues, lead branch awareness campaigns, and serve as the primary liaison with the Security Operations Centre.",
    icon: "military_tech",
    accent: ["#451a03", "#92400e"],
    questions: 60,
    minutes: 120,
    passingScore: 90,
    validityYears: 1,
    tokenReward: 2000,
    prerequisites: [
      { label: "All Foundation & Practitioner certificates (NBE-CAC, PDS, DPCO)", done: false },
      { label: "Security Incident Responder (Expert Level)", done: false },
      { label: "Peer Mentorship Programme (Role-Specific Training)", done: false },
      { label: "Advanced Threat Intelligence (Role-Specific Training)", done: false },
      { label: "Branch Manager nomination — submitted via HR portal", done: false },
    ],
    skills: ["Security leadership", "Peer coaching", "Threat intelligence briefings", "Policy development & review"],
    recognition: [
      "NBE Security Excellence Award — Annual Ceremony",
      "Permanent plaque listing in branch reception",
      "10,000 ISP Token bonus",
      "Security Operations Liaison role",
    ],
    sampleQuestions: [
      {
        q: "As a Security Champion, a junior teller reports a suspicious customer interaction but is unsure whether it constitutes social engineering. What is your role?",
        options: [
          "Tell them it is probably nothing and return to your duties",
          "Listen, assess the risk, document the incident, escalate to IT Security if warranted, and debrief the teller",
          "Conduct your own investigation by reviewing CCTV footage",
          "Report the teller to HR for wasting time",
        ],
        answer: 1,
      },
    ],
  },
];

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CertificatePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null); // { cert, tab: "overview" | "sample" | "req", qIndex }
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) { router.replace("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "ADMIN") { router.replace("/admin_dashboard"); return; }
    setUser(parsed);
  }, [router]);

  function openModal(cert) {
    setModal({ cert, tab: "overview", qIndex: 0 });
    setChosenAnswer(null);
    setRevealed(false);
  }
  function closeModal() { setModal(null); setChosenAnswer(null); setRevealed(false); }
  function setTab(tab) { setModal((m) => ({ ...m, tab })); setChosenAnswer(null); setRevealed(false); }
  function setQ(i) { setModal((m) => ({ ...m, qIndex: i })); setChosenAnswer(null); setRevealed(false); }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f0f4fb]">
        <EmployeeNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </main>
    );
  }

  const displayName = user.fullName || user.name || user.employeeId || "Employee";

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: 'Hanken Grotesk', sans-serif; }
        .cert-hero {
          background: linear-gradient(135deg,#001e40 0%,#003366 45%,#1f477b 100%);
          position: relative; overflow: hidden;
        }
        .cert-hero::before {
          content: ""; position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-orb { position: absolute; border-radius: 999px; filter: blur(60px); opacity: 0.15; pointer-events: none; }
        .cert-card { background: #fff; border-radius: 20px; border: 1px solid rgba(195,198,209,0.4); box-shadow: 0 2px 12px rgba(0,30,64,0.06); transition: box-shadow 0.2s, transform 0.2s; }
        .cert-card:hover { box-shadow: 0 12px 36px rgba(0,30,64,0.13); transform: translateY(-3px); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align: middle; }
        .ms-filled { font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
        .tab-btn { padding: 0.375rem 1rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; transition: background 0.15s, color 0.15s; }
        .tab-active { background: #003366; color: #fff; }
        .tab-inactive { background: transparent; color: #6b7280; }
        .tab-inactive:hover { background: #f3f4f6; }
        .option-btn { width: 100%; text-align: left; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid #e5e7eb; background: #fff; font-size: 0.8125rem; font-weight: 500; color: #374151; transition: all 0.15s; cursor: pointer; }
        .option-btn:hover:not(:disabled) { border-color: #3a5f94; background: #eef3fb; }
        .option-chosen { border-color: #3a5f94 !important; background: #eef3fb !important; }
        .option-correct { border-color: #16a34a !important; background: #f0fdf4 !important; color: #166534 !important; }
        .option-wrong { border-color: #dc2626 !important; background: #fef2f2 !important; color: #991b1b !important; }
      `}</style>

      <EmployeeNav />

      {/* ── Assessment modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,10,30,0.82)", backdropFilter: "blur(10px)" }}
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="rounded-t-3xl px-6 pt-6 pb-4 relative overflow-hidden shrink-0"
              style={{ background: `linear-gradient(135deg,${modal.cert.accent[0]},${modal.cert.accent[1]})` }}
            >
              <div className="absolute right-4 top-4 opacity-[0.08] pointer-events-none">
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: 80 }}>{modal.cert.icon}</span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: 26 }}>{modal.cert.icon}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${modal.cert.levelCls} mb-1`}>
                    Level {modal.cert.level} · {modal.cert.levelLabel}
                  </span>
                  <h2 className="hg text-white text-base font-bold leading-snug">{modal.cert.title}</h2>
                  <p className="text-white/65 text-[11px] mt-0.5">{modal.cert.issuer}</p>
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex items-center gap-1 mt-4 bg-white/10 rounded-full p-1 w-fit">
                {["overview", "sample", "req"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tab-btn ${modal.tab === t ? "tab-active" : "tab-inactive text-white/70 hover:!bg-white/20 hover:!text-white"}`}
                    style={modal.tab === t ? { background: "rgba(255,255,255,0.95)", color: modal.cert.accent[0] } : {}}
                    onClick={() => setTab(t)}
                  >
                    {t === "overview" ? "Overview" : t === "sample" ? "Sample Questions" : "Requirements"}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* ── OVERVIEW TAB ── */}
              {modal.tab === "overview" && (
                <>
                  {/* Locked notice */}
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined ms-filled text-amber-500 text-xl shrink-0 mt-0.5">lock</span>
                    <div>
                      <p className="text-amber-800 text-sm font-bold">Assessment Locked</p>
                      <p className="text-amber-700 text-xs mt-0.5">Complete all prerequisite training modules before sitting this assessment.</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{modal.cert.description}</p>

                  {/* Exam stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: modal.cert.questions, l: "Questions" },
                      { v: `${modal.cert.minutes}m`, l: "Time Limit" },
                      { v: `${modal.cert.passingScore}%`, l: "Pass Mark" },
                    ].map((s) => (
                      <div key={s.l} className="text-center bg-gray-50 rounded-xl py-3">
                        <p className="hg text-lg font-bold text-gray-900">{s.v}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Skills Validated</p>
                    <div className="flex flex-wrap gap-1.5">
                      {modal.cert.skills.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-full border border-blue-100">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Recognition */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Recognition</p>
                    <div className="space-y-1.5">
                      {modal.cert.recognition.map((r) => (
                        <div key={r} className="flex items-center gap-2 text-xs text-gray-700">
                          <span className="material-symbols-outlined ms-filled text-blue-500 text-base">verified</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Token reward */}
                  <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined ms-filled text-yellow-500 text-2xl">toll</span>
                    <div>
                      <p className="text-xs text-yellow-700 font-semibold">Token Reward on Pass</p>
                      <p className="hg text-lg font-bold text-yellow-800">+{modal.cert.tokenReward.toLocaleString()} ISP</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">
                    Valid for {modal.cert.validityYears} year{modal.cert.validityYears > 1 ? "s" : ""} · Renewal assessment required
                  </p>
                </>
              )}

              {/* ── SAMPLE QUESTIONS TAB ── */}
              {modal.tab === "sample" && (
                <>
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined ms-filled text-blue-500 text-xl shrink-0 mt-0.5">quiz</span>
                    <p className="text-blue-800 text-xs leading-relaxed">
                      <strong>Practice mode.</strong> These are representative questions from the actual assessment bank. Your answers here do <em>not</em> count toward a result — unlock the assessment by completing the required training first.
                    </p>
                  </div>

                  {/* Q navigator */}
                  <div className="flex items-center gap-2">
                    {modal.cert.sampleQuestions.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQ(i)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${modal.qIndex === i ? "text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        style={modal.qIndex === i ? { background: `linear-gradient(135deg,${modal.cert.accent[0]},${modal.cert.accent[1]})` } : {}}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto">Sample {modal.qIndex + 1} of {modal.cert.sampleQuestions.length}</span>
                  </div>

                  {/* Question card */}
                  {(() => {
                    const q = modal.cert.sampleQuestions[modal.qIndex];
                    return (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed mb-4">{q.q}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            let cls = "option-btn";
                            if (revealed) {
                              if (oi === q.answer) cls += " option-correct";
                              else if (oi === chosenAnswer) cls += " option-wrong";
                            } else if (oi === chosenAnswer) {
                              cls += " option-chosen";
                            }
                            return (
                              <button
                                key={oi}
                                type="button"
                                disabled={revealed}
                                className={cls}
                                onClick={() => setChosenAnswer(oi)}
                              >
                                <span className="inline-flex items-center gap-2.5">
                                  <span
                                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold"
                                    style={{
                                      borderColor: revealed && oi === q.answer ? "#16a34a"
                                        : revealed && oi === chosenAnswer ? "#dc2626"
                                        : oi === chosenAnswer ? "#3a5f94" : "#d1d5db",
                                      background: revealed && oi === q.answer ? "#16a34a"
                                        : revealed && oi === chosenAnswer ? "#dc2626"
                                        : oi === chosenAnswer ? "#3a5f94" : "transparent",
                                      color: (revealed && (oi === q.answer || oi === chosenAnswer)) || oi === chosenAnswer ? "#fff" : "#9ca3af",
                                    }}
                                  >
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  {opt}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {!revealed && chosenAnswer !== null && (
                          <button
                            type="button"
                            onClick={() => setRevealed(true)}
                            className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                            style={{ background: `linear-gradient(135deg,${modal.cert.accent[0]},${modal.cert.accent[1]})` }}
                          >
                            Submit Answer
                          </button>
                        )}

                        {revealed && (
                          <div className={`mt-4 rounded-xl px-4 py-3 flex items-start gap-3 ${chosenAnswer === q.answer ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                            <span className={`material-symbols-outlined ms-filled text-xl shrink-0 mt-0.5 ${chosenAnswer === q.answer ? "text-green-600" : "text-red-500"}`}>
                              {chosenAnswer === q.answer ? "check_circle" : "cancel"}
                            </span>
                            <div>
                              <p className={`text-sm font-bold ${chosenAnswer === q.answer ? "text-green-800" : "text-red-800"}`}>
                                {chosenAnswer === q.answer ? "Correct!" : "Incorrect"}
                              </p>
                              <p className={`text-xs mt-0.5 ${chosenAnswer === q.answer ? "text-green-700" : "text-red-700"}`}>
                                {chosenAnswer === q.answer
                                  ? "Well done — that is the correct procedure."
                                  : `The correct answer is: "${q.options[q.answer]}"`}
                              </p>
                            </div>
                          </div>
                        )}

                        {revealed && modal.qIndex < modal.cert.sampleQuestions.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setQ(modal.qIndex + 1)}
                            className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          >
                            Next Question →
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}

              {/* ── REQUIREMENTS TAB ── */}
              {modal.tab === "req" && (
                <>
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined ms-filled text-amber-500 text-xl shrink-0 mt-0.5">assignment_late</span>
                    <p className="text-amber-800 text-xs leading-relaxed">
                      You must complete <strong>all</strong> required modules before the assessment becomes available. Your progress is saved automatically.
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Required Modules — {modal.cert.prerequisites.filter((p) => !p.done).length} remaining</p>
                    <div className="space-y-2">
                      {modal.cert.prerequisites.map((req, i) => (
                        <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${req.done ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                          <span className={`material-symbols-outlined ms-filled text-xl shrink-0 mt-0.5 ${req.done ? "text-green-600" : "text-red-400"}`}>
                            {req.done ? "check_circle" : "cancel"}
                          </span>
                          <span className={`text-sm ${req.done ? "text-green-800 font-semibold" : "text-gray-700"}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-600">Prerequisites Complete</span>
                      <span className="text-xs font-bold text-gray-400">
                        {modal.cert.prerequisites.filter((p) => p.done).length} / {modal.cert.prerequisites.length}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(modal.cert.prerequisites.filter((p) => p.done).length / modal.cert.prerequisites.length) * 100}%`,
                          background: "linear-gradient(90deg,#3a5f94,#a7c8ff)",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 pt-3 border-t border-gray-100 shrink-0 flex gap-3">
              <Link
                href="/foundational_learning"
                className="flex-1 py-3 rounded-xl text-sm font-bold text-center text-white transition-all hover:brightness-110"
                style={{ background: `linear-gradient(135deg,${modal.cert.accent[0]},${modal.cert.accent[1]})` }}
                onClick={closeModal}
              >
                Go to Training
              </Link>
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="cert-hero px-4 sm:px-6 py-10">
        <div className="hero-orb w-96 h-96 bg-blue-400" style={{ top: "-80px", right: "-60px" }} />
        <div className="hero-orb w-64 h-64 bg-indigo-300" style={{ bottom: "-50px", left: "8%" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
                <span className="material-symbols-outlined ms-filled text-sm mr-1">workspace_premium</span>
                Security Certification Centre
              </p>
              <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight">
                Good {getGreeting()}, {displayName} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-2">
                Complete your training modules to unlock professional security assessments.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="hg text-3xl font-bold text-white">{CERTS.length}</p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">Certs Available</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="hg text-3xl font-bold text-yellow-300">0</p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">Certs Earned</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="hg text-3xl font-bold text-white">0</p>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">ISP Tokens</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-start gap-3 max-w-3xl">
            <span className="material-symbols-outlined ms-filled text-yellow-300 text-2xl shrink-0 mt-0.5">auto_awesome</span>
            <p className="text-blue-100 text-sm leading-relaxed">
              All assessments follow the <strong className="text-white">NBE Cybersecurity Training Directive 17/2024</strong>. Certificates are stored in your permanent employee training record and may be requested by the National Bank of Ethiopia during compliance audits.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">How to Earn Your Certifications</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "1", icon: "school", title: "Complete Training", desc: "Finish required modules in Foundational Learning & Role-Specific Training" },
              { step: "2", icon: "lock_open", title: "Unlock Assessment", desc: "The assessment unlocks automatically when all prerequisites are met" },
              { step: "3", icon: "quiz", title: "Sit the Exam", desc: "Answer timed multiple-choice questions — you must score the pass mark to earn the cert" },
              { step: "4", icon: "workspace_premium", title: "Get Certified", desc: "Your certificate is issued, stored in your record, and ISP tokens are awarded" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2 shadow-sm" style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}>
                  {s.step}
                </div>
                <span className="material-symbols-outlined ms-filled text-blue-600 text-2xl mb-1">{s.icon}</span>
                <p className="text-xs font-bold text-gray-900 mb-0.5">{s.title}</p>
                <p className="text-[11px] text-gray-500 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cert grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {CERTS.map((cert) => (
          <CertCard key={cert.id} cert={cert} onOpen={() => openModal(cert)} />
        ))}
      </div>

      {/* ── Certification pathway ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined ms-filled text-blue-700 text-xl">route</span>
            <h2 className="hg text-base font-bold text-gray-900">Certification Pathway</h2>
            <span className="text-xs text-gray-400 ml-auto">Complete in sequence to unlock each level</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            {CERTS.map((cert, i) => (
              <div key={cert.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center text-center flex-1 min-w-0 px-1">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-2 opacity-50"
                    style={{ background: `linear-gradient(135deg,${cert.accent[0]},${cert.accent[1]})` }}
                  >
                    <span className="material-symbols-outlined ms-filled text-xl">{cert.icon}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cert.levelCls} mb-1`}>
                    L{cert.level}
                  </span>
                  <p className="text-[11px] font-bold text-gray-600 leading-tight">{cert.badge}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block leading-snug px-1">{cert.title.split(" ").slice(0, 3).join(" ")}…</p>
                </div>
                {i < CERTS.length - 1 && (
                  <div className="flex items-center mx-1 sm:mx-0">
                    <span className="material-symbols-outlined text-gray-200 text-3xl">arrow_forward</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Cert card ─────────────────────────────────────────────────────────────────
function CertCard({ cert, onOpen }) {
  return (
    <div className="cert-card flex flex-col">
      {/* Header */}
      <div
        className="rounded-t-[20px] px-6 py-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${cert.accent[0]},${cert.accent[1]})` }}
      >
        <div className="absolute right-3 top-3 opacity-[0.08] pointer-events-none">
          <span className="material-symbols-outlined ms-filled" style={{ fontSize: 90 }}>{cert.icon}</span>
        </div>
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cert.levelCls} mb-2`}>
              Level {cert.level} · {cert.levelLabel}
            </span>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 w-fit">
              <span className="material-symbols-outlined text-white text-sm">lock</span>
              <span className="text-white text-[10px] font-bold uppercase tracking-wide">Locked</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: 26 }}>{cert.icon}</span>
          </div>
        </div>
        <h3 className="hg text-white text-sm font-bold mt-3 leading-tight relative z-10">{cert.title}</h3>
        <p className="text-white/65 text-[10px] mt-0.5 relative z-10">Issued by: {cert.issuer}</p>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{cert.description}</p>

        {/* Exam details row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: cert.questions, l: "Questions" },
            { v: `${cert.minutes}m`, l: "Duration" },
            { v: `${cert.passingScore}%`, l: "Pass Mark" },
          ].map((s) => (
            <div key={s.l} className="text-center bg-gray-50 rounded-xl py-2">
              <p className="hg text-sm font-bold text-gray-900">{s.v}</p>
              <p className="text-[10px] text-gray-500 font-semibold">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {cert.skills.map((s) => (
            <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-100">{s}</span>
          ))}
        </div>

        {/* Token reward */}
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
          <span className="material-symbols-outlined ms-filled text-yellow-500 text-base">toll</span>
          <span className="text-xs font-bold text-yellow-800">+{cert.tokenReward.toLocaleString()} ISP on pass</span>
        </div>

        {/* Prereqs count */}
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">checklist</span>
          {cert.prerequisites.length} prerequisite module{cert.prerequisites.length !== 1 ? "s" : ""} required
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={onOpen}
          className="mt-auto w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
          style={{ background: `linear-gradient(135deg,${cert.accent[0]},${cert.accent[1]})`, color: "#fff", opacity: 0.85 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
        >
          <span className="material-symbols-outlined text-base">quiz</span>
          View Assessment
        </button>
      </div>
    </div>
  );
}
