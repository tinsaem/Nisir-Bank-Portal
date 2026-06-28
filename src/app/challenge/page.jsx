"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EmployeeNav from "@/components/EmployeeNav";

// ── Assessment catalogue ────────────────────────────────────────────────────
const ASSESSMENTS = [
  {
    key: "phishing",
    title: "Phishing Awareness Assessment",
    desc: "Test your ability to identify phishing emails, suspicious links, and social engineering attacks.",
    icon: "alternate_email",
    iconBg: "bg-red-50", iconColor: "text-red-600",
    difficulty: "Intermediate", diffCls: "bg-[#ffdbca] text-[#723610]",
    duration: "10 mins", questions: 5, tokens: "+150 ISP",
    badge: "⚠ Priority", badgeCls: "bg-[#ffdad6] text-[#93000a]",
    qs: [
      { q: "Which of the following is the most reliable indicator of a phishing email?",
        opts: ["The email was sent during business hours","The sender's display name matches a colleague","Urgent language asking you to click a link or verify credentials","The email has your name in the subject line"],
        ans: 2 },
      { q: "You receive an email asking you to reset your Nisir Bank portal password via an external link. What should you do?",
        opts: ["Click the link immediately — password resets are urgent","Delete the email and ignore it","Report it to the IT Security team and do NOT click the link","Forward it to your manager for approval"],
        ans: 2 },
      { q: "A spoofed email address is one that:",
        opts: ["Uses all uppercase letters","Appears to come from a legitimate sender but is actually from an attacker","Was sent from a mobile device","Includes an attachment larger than 5 MB"],
        ans: 1 },
      { q: "Which action best protects you when you are unsure about a link in an email?",
        opts: ["Click it quickly to see if anything happens","Hover over the link to preview the actual URL before clicking","Copy and paste it into a search engine","Ask the sender to resend the email"],
        ans: 1 },
      { q: "What is spear phishing?",
        opts: ["A phishing attack targeting fishing industry companies","A generic mass-email phishing campaign","A highly targeted phishing attack personalised for a specific individual or organisation","A type of malware distributed via USB drives"],
        ans: 2 },
    ],
  },
  {
    key: "policy",
    title: "Information Security Policy Quiz",
    desc: "Verify your understanding of Nisir Bank's ISP framework, responsibilities, and compliance obligations.",
    icon: "policy",
    iconBg: "bg-blue-50", iconColor: "text-blue-700",
    difficulty: "Beginner", diffCls: "bg-[#d5e3ff] text-[#1f477b]",
    duration: "8 mins", questions: 5, tokens: "+100 ISP",
    badge: "Recommended", badgeCls: "bg-[#d5e3ff] text-[#1f477b]",
    qs: [
      { q: "What does ISP stand for in the context of Nisir Bank's security training?",
        opts: ["Internet Service Provider","Information Security Policy","Integrated Systems Protocol","Internal Staff Programme"],
        ans: 1 },
      { q: "Who is responsible for ensuring ISP compliance in your department?",
        opts: ["Only the IT Security team","Only the CEO","Every employee, supported by their line manager","Exclusively the HR department"],
        ans: 2 },
      { q: "How often should employees complete mandatory ISP training according to Nisir Bank policy?",
        opts: ["Once at onboarding, never again","Quarterly","Annually, with refreshers when major policies change","Only when a security incident occurs"],
        ans: 2 },
      { q: "Which of the following actions violates Nisir Bank's data handling policy?",
        opts: ["Storing customer data on the bank's approved internal systems","Sharing anonymised aggregate reports with your line manager","Sending customer PII to your personal email for remote access","Using the bank's VPN to access internal systems from home"],
        ans: 2 },
      { q: "What should you do if you discover a potential data breach?",
        opts: ["Attempt to fix it yourself before reporting","Ignore it if no data appears to have been stolen","Report it immediately to IT Security and your line manager","Wait until the end of the week to include it in your report"],
        ans: 2 },
    ],
  },
  {
    key: "password",
    title: "Password & Access Control Quiz",
    desc: "Evaluate your knowledge of password hygiene, MFA, and access control best practices.",
    icon: "vpn_key",
    iconBg: "bg-purple-50", iconColor: "text-purple-600",
    difficulty: "Beginner", diffCls: "bg-[#d5e3ff] text-[#1f477b]",
    duration: "6 mins", questions: 5, tokens: "+80 ISP",
    badge: "", badgeCls: "",
    qs: [
      { q: "What is the minimum recommended length for a strong password according to current security standards?",
        opts: ["6 characters","8 characters","12 characters","Any length with a mix of upper and lower case"],
        ans: 2 },
      { q: "Which of the following is the most secure password?",
        opts: ["NisirBank2024","password123","Tr0ub4dor&3!","YourName_Birthday"],
        ans: 2 },
      { q: "What is multi-factor authentication (MFA)?",
        opts: ["Using the same password on multiple systems","Logging in with a username and a memorable word","Verifying your identity using two or more independent factors","Sharing your password with a trusted colleague"],
        ans: 2 },
      { q: "You should share your portal password with a colleague when:",
        opts: ["They need urgent access to a shared document","You are going on leave","Your manager asks you to","Never — passwords must not be shared under any circumstances"],
        ans: 3 },
      { q: "How often should you change your system passwords?",
        opts: ["Never, if the password is strong enough","Every day","As required by policy, and immediately if you suspect compromise","Only when the system forces you to"],
        ans: 2 },
    ],
  },
  {
    key: "social",
    title: "Social Engineering Awareness",
    desc: "Test your ability to recognise and resist manipulation tactics used by threat actors.",
    icon: "psychology",
    iconBg: "bg-indigo-50", iconColor: "text-indigo-600",
    difficulty: "Advanced", diffCls: "bg-[#ffdad6] text-[#93000a]",
    duration: "12 mins", questions: 5, tokens: "+150 ISP",
    badge: "Advanced", badgeCls: "bg-[#ffdad6] text-[#93000a]",
    qs: [
      { q: "A caller claims to be from NBE's IT audit team and asks for your system credentials to conduct a compliance check. What do you do?",
        opts: ["Provide the credentials — NBE has authority","Ask your manager first, then provide them if approved","Refuse and report the call to IT Security immediately","Transfer the call to your director and let them decide"],
        ans: 2 },
      { q: "What is pretexting in the context of social engineering?",
        opts: ["Sending unsolicited marketing emails","Creating a fabricated scenario to gain someone's trust and extract information","Installing malware via a phishing link","Exploiting an unpatched software vulnerability"],
        ans: 1 },
      { q: "You find a USB drive labelled 'Payroll Q3 2025' in the office car park. What should you do?",
        opts: ["Plug it into your workstation to see if the owner is identifiable","Hand it to the IT Security team without plugging it in","Leave it where you found it","Hand it to reception"],
        ans: 1 },
      { q: "A colleague under pressure asks to borrow your access badge for a few minutes. You should:",
        opts: ["Help them — it's just a few minutes","Agree but stay with them the entire time","Refuse and help them contact IT Security to resolve their access issue","Report them to HR immediately"],
        ans: 2 },
      { q: "Which of the following best describes 'vishing'?",
        opts: ["Phishing carried out via text messages","Phishing carried out via voice calls or phone","An attack on VoIP infrastructure","Malware delivered through video files"],
        ans: 1 },
    ],
  },
  {
    key: "data",
    title: "Customer Data Protection",
    desc: "Confirm your understanding of PII handling, data classification, and NBE compliance requirements.",
    icon: "account_balance_wallet",
    iconBg: "bg-orange-50", iconColor: "text-orange-600",
    difficulty: "Intermediate", diffCls: "bg-[#ffdbca] text-[#723610]",
    duration: "10 mins", questions: 5, tokens: "+120 ISP",
    badge: "", badgeCls: "",
    qs: [
      { q: "What does PII stand for?",
        opts: ["Private Internet Information","Personally Identifiable Information","Protected Internal Intelligence","Policy Implementation Index"],
        ans: 1 },
      { q: "Which of the following is NOT an example of PII?",
        opts: ["A customer's full name and date of birth","A customer's account number","Aggregated, anonymised transaction statistics","A customer's home address"],
        ans: 2 },
      { q: "Under Nisir Bank's data classification policy, customer financial records are classified as:",
        opts: ["Public","Internal Use Only","Confidential","Top Secret"],
        ans: 2 },
      { q: "A customer asks you to send their full account statement to their personal Gmail address. You should:",
        opts: ["Send it — the customer has the right to their own data","Send a password-protected file to their Gmail address","Advise them to use only the bank's official secure channels and not send PII to personal email","Ask your manager and then send it if they agree"],
        ans: 2 },
      { q: "How long does Nisir Bank's policy require customer records to be retained?",
        opts: ["1 year","5 years as per NBE directives","Until the customer closes their account","Indefinitely"],
        ans: 1 },
    ],
  },
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function ChallengePage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState({});

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) { router.replace("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "ADMIN") { router.replace("/admin_dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(parsed);
  }, [router]);

  if (!account) {
    return (
      <main className="min-h-screen bg-[#f0f4fb]">
        <EmployeeNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </main>
    );
  }

  function openAssessment(key) {
    setSelected(key);
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitQuiz(a) {
    const quiz = ASSESSMENTS.find((q) => q.key === selected);
    const correct = quiz.qs.filter((q, i) => a[i] === q.ans).length;
    setScores((prev) => ({ ...prev, [selected]: Math.round((correct / quiz.qs.length) * 100) }));
    setSubmitted(true);
  }

  const quiz = selected ? ASSESSMENTS.find((a) => a.key === selected) : null;

  const tokensEarned = Object.keys(scores).reduce((t, k) => {
    const a = ASSESSMENTS.find((x) => x.key === k);
    return t + (a ? parseInt(a.tokens) : 0);
  }, 0);

  const bestScore = Object.values(scores).length
    ? Math.max(...Object.values(scores)) + "%"
    : "—";

  const totalTokenPotential = ASSESSMENTS.reduce((t, a) => t + parseInt(a.tokens), 0);

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: 'Hanken Grotesk', sans-serif; }
        .badge-pill { display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em; }
        .hero-banner {
          background: linear-gradient(135deg,#0c1f4a 0%,#1a006e 50%,#3a0ca3 100%);
          position:relative; overflow:hidden;
        }
        .hero-banner::before {
          content:""; position:absolute; inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-orb { position:absolute;border-radius:999px;filter:blur(60px);opacity:0.2;pointer-events:none; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle; }
        .ms-filled { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>

      <EmployeeNav />

      {/* ── Hero banner ── */}
      <section className="hero-banner px-4 sm:px-6 py-10">
        <div className="hero-orb w-80 h-80 bg-purple-400" style={{ top: "-60px", right: "-40px" }} />
        <div className="hero-orb w-56 h-56 bg-blue-400" style={{ bottom: "-40px", left: "10%" }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <p className="text-purple-300 text-xs font-semibold tracking-widest uppercase mb-1">
                <span className="material-symbols-outlined ms-filled text-sm mr-1">sports_esports</span>
                Challenge Hub · SETA Training
              </p>
              <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight mb-2">
                Security Challenges
              </h1>
              <p className="text-purple-200 text-sm">
                {ASSESSMENTS.length} challenges available · up to {totalTokenPotential.toLocaleString()} ISP tokens to earn
              </p>
            </div>
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-200 hover:text-white transition-colors shrink-0 mt-1"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                All Challenges
              </button>
            )}
          </div>

          {/* Reward tier banner */}
          {!selected && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: "emoji_events", label: "Leaderboard Bonus", value: "2× multiplier for Top 3", color: "text-yellow-300" },
                { icon: "bolt",         label: "Perfect Score",      value: "+50 ISP bonus per quiz",  color: "text-purple-200" },
                { icon: "local_fire_department", label: "Streak Bonus", value: "×1.5 at 3-day streak", color: "text-orange-300" },
              ].map((r) => (
                <div key={r.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className={`material-symbols-outlined ms-filled text-2xl shrink-0 ${r.color}`}>{r.icon}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{r.value}</p>
                    <p className="text-purple-300 text-[10px]">{r.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Quiz view */}
        {selected && quiz && (
          <QuizPanel
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            submitted={submitted}
            score={scores[selected]}
            onSubmit={submitQuiz}
            onRetake={() => { setAnswers({}); setSubmitted(false); }}
            onBack={() => setSelected(null)}
          />
        )}

        {/* Assessment list */}
        {!selected && (
          <div className="space-y-8">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "sports_esports", label: "Challenges Available", value: ASSESSMENTS.length,          color: "text-purple-700", bg: "bg-purple-50" },
                { icon: "check_circle",   label: "Completed",            value: Object.keys(scores).length,  color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: "emoji_events",   label: "Best Score",           value: bestScore,                   color: "text-yellow-600", bg: "bg-yellow-50" },
                { icon: "toll",           label: "ISP Tokens Earned",    value: tokensEarned > 0 ? tokensEarned.toLocaleString() + " ISP" : "0 ISP", color: "text-blue-700", bg: "bg-blue-50" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[rgba(195,198,209,0.4)] shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ms-filled text-xl ${s.color}`}>{s.icon}</span>
                  </div>
                  <div>
                    <p className={`hg text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-gray-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assessment cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ASSESSMENTS.map((a) => {
                const done = a.key in scores;
                const score = scores[a.key];
                return (
                  <div
                    key={a.key}
                    className="bg-white rounded-[18px] border border-[rgba(195,198,209,0.4)] shadow-[0_2px_10px_rgba(0,30,64,0.05)] p-5 flex flex-col hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(0,30,64,0.12)] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-2xl ${a.iconBg} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${a.iconColor} text-2xl`}>{a.icon}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {a.badge && <span className={`badge-pill ${a.badgeCls}`}>{a.badge}</span>}
                        {done && (
                          <span className={`badge-pill ${score >= 80 ? "bg-[#d4f5e2] text-[#1a6640]" : score >= 60 ? "bg-[#ffdbca] text-[#723610]" : "bg-[#ffdad6] text-[#93000a]"}`}>
                            {score}%
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="hg text-sm font-bold text-gray-900 mb-1">{a.title}</h3>
                    <p className="text-xs text-gray-500 flex-1 mb-4 leading-relaxed">{a.desc}</p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        {a.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">quiz</span>
                        {a.questions} questions
                      </span>
                      <span className="flex items-center gap-1 text-yellow-600 font-bold">
                        <span className="material-symbols-outlined text-sm">toll</span>
                        {a.tokens}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAssessment(a.key)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
                    >
                      <span className="material-symbols-outlined text-base">{done ? "replay" : "play_arrow"}</span>
                      {done ? "Retake Assessment" : "Start Assessment"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}

// ── Quiz panel ──────────────────────────────────────────────────────────────
function QuizPanel({ quiz, answers, setAnswers, submitted, score, onSubmit, onRetake, onBack }) {
  const allAnswered = quiz.qs.every((_, i) => i in answers);

  function handleSubmit(e) {
    e.preventDefault();
    if (!allAnswered) return;
    onSubmit(answers);
  }

  if (submitted) {
    const passed = score >= 80;
    const perfect = score === 100;
    const tokensAwarded = parseInt(quiz.tokens);
    const bonusTokens = perfect ? 50 : 0;
    const totalAwarded = passed ? tokensAwarded + bonusTokens : 0;

    return (
      <div className="bg-white rounded-[20px] border border-[rgba(195,198,209,0.4)] shadow-sm overflow-hidden max-w-lg mx-auto">
        {/* Result header */}
        <div
          className="px-6 py-8 text-center relative overflow-hidden"
          style={{
            background: passed
              ? "linear-gradient(135deg,#064e3b,#065f46,#047857)"
              : "linear-gradient(135deg,#7c2d12,#9a3412,#c2410c)",
          }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg border-4 ${passed ? "bg-emerald-100 border-emerald-200" : "bg-orange-100 border-orange-200"}`}>
              {perfect ? "🏆" : passed ? "✅" : "📝"}
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{quiz.title}</p>
            <h2 className="hg text-5xl font-black text-white mb-1">{score}%</h2>
            <p className={`text-base font-bold ${passed ? "text-emerald-200" : "text-orange-200"}`}>
              {perfect ? "Perfect Score!" : passed ? "Assessment Passed!" : "Keep Practising"}
            </p>
          </div>
        </div>

        {/* Token reward */}
        {passed && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined ms-filled text-yellow-500 text-xl">toll</span>
                <div>
                  <p className="text-xs text-gray-500">Tokens Awarded</p>
                  <p className="hg text-lg font-black text-yellow-700">+{totalAwarded} ISP</p>
                </div>
              </div>
              {perfect && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-right">
                  <p className="text-[10px] text-yellow-600 font-bold uppercase">Perfect Bonus</p>
                  <p className="text-sm font-black text-yellow-700">+{bonusTokens} ISP</p>
                </div>
              )}
            </div>
            <div className="mt-3 bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined ms-filled text-blue-500 text-base">info</span>
              <p className="text-[11px] text-gray-600">Tokens recorded in your leaderboard score. First-attempt scores count for ranking.</p>
            </div>
          </div>
        )}

        {!passed && (
          <div className="px-6 py-4 border-b border-gray-100 bg-orange-50">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined ms-filled text-orange-500 text-xl shrink-0 mt-0.5">school</span>
              <div>
                <p className="text-sm font-bold text-orange-800 mb-0.5">Score below 80% — no tokens awarded</p>
                <p className="text-xs text-orange-700">Review the module in <strong>Foundational Learning</strong> then retake to earn the full token reward. Your best score is recorded.</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">replay</span>
            Retake
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#3a0ca3,#7209b7)" }}
          >
            <span className="material-symbols-outlined text-base">sports_esports</span>
            More Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(195,198,209,0.4)] shadow-sm overflow-hidden">
      <div
        className="px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,#0c1f4a,#1a006e,#3a0ca3)" }}
      >
        <div className={`w-12 h-12 rounded-2xl ${quiz.iconBg} flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined ${quiz.iconColor} text-2xl`}>{quiz.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-purple-300 text-[11px] font-bold uppercase tracking-widest">Challenge</p>
          <h2 className="hg text-base font-bold text-white leading-tight">{quiz.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`badge-pill ${quiz.diffCls}`}>{quiz.difficulty}</span>
            <span className="text-purple-300 text-[11px] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">timer</span>{quiz.duration}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-yellow-400 text-[11px] font-bold">{quiz.tokens}</p>
          <p className="text-purple-300 text-[10px]">on pass</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {quiz.qs.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-bold text-gray-900 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black mr-2">
                {qi + 1}
              </span>
              {q.q}
            </p>
            <div className="space-y-2">
              {q.opts.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    answers[qi] === oi
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${qi}`}
                    value={oi}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className="mt-0.5 accent-blue-700"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-100">
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-gray-400 font-medium">{Object.keys(answers).length} of {quiz.qs.length} answered</p>
              <p className="text-xs font-bold text-purple-700">{Math.round((Object.keys(answers).length / quiz.qs.length) * 100)}%</p>
            </div>
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.keys(answers).length / quiz.qs.length) * 100}%`,
                  background: "linear-gradient(90deg,#3a0ca3,#7209b7)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Exit
            </button>
            <button
              type="submit"
              disabled={!allAnswered}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#3a0ca3,#7209b7)" }}
            >
              <span className="material-symbols-outlined text-base">send</span>
              Submit Assessment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
