"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  if (!account) return <main className="min-h-screen bg-[#f0f4fb]" />;

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
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
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
              Assessments
            </h1>
            <p className="text-blue-200 text-sm">
              {ASSESSMENTS.length} assessments · earn ISP tokens for every passing score
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              All Assessments
            </button>
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
          />
        )}

        {/* Assessment list */}
        {!selected && (
          <div className="space-y-8">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "assignment",   label: "Total Assessments", value: ASSESSMENTS.length,                color: "text-blue-700" },
                { icon: "check_circle", label: "Completed",          value: Object.keys(scores).length,       color: "text-emerald-600" },
                { icon: "emoji_events", label: "Best Score",         value: bestScore,                        color: "text-yellow-600" },
                { icon: "toll",         label: "Tokens Earned",      value: tokensEarned + " ISP",            color: "text-purple-600" },
              ].map((s) => (
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
function QuizPanel({ quiz, answers, setAnswers, submitted, score, onSubmit, onRetake }) {
  const allAnswered = quiz.qs.every((_, i) => i in answers);

  function handleSubmit(e) {
    e.preventDefault();
    if (!allAnswered) return;
    onSubmit(answers);
  }

  if (submitted) {
    const passed = score >= 80;
    return (
      <div className="bg-white rounded-[20px] border border-[rgba(195,198,209,0.4)] shadow-sm p-8 text-center max-w-lg mx-auto">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl ${passed ? "bg-emerald-100" : "bg-amber-100"}`}>
          {passed ? "🏆" : "📝"}
        </div>
        <h2 className="hg text-2xl font-bold text-gray-900 mb-1">{score}%</h2>
        <p className={`text-sm font-semibold mb-1 ${passed ? "text-emerald-600" : "text-amber-600"}`}>
          {passed ? "Assessment Passed!" : "Keep Practising"}
        </p>
        <p className="text-xs text-gray-500 mb-6">
          {passed
            ? "Excellent work. Your score has been recorded and tokens have been added to your account."
            : "Review the module and try again to improve your score and earn the full token reward."}
        </p>
        <button
          type="button"
          onClick={onRetake}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
        >
          Retake
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(195,198,209,0.4)] shadow-sm overflow-hidden">
      <div
        className="px-6 py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,#001e40,#003366,#1f477b)" }}
      >
        <div className={`w-12 h-12 rounded-2xl ${quiz.iconBg} flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined ${quiz.iconColor} text-2xl`}>{quiz.icon}</span>
        </div>
        <div>
          <p className="text-blue-300 text-[11px] font-bold uppercase tracking-widest">Assessment</p>
          <h2 className="hg text-lg font-bold text-white">{quiz.title}</h2>
        </div>
        <div className="ml-auto text-right">
          <p className="text-blue-300 text-[11px]">Questions</p>
          <p className="hg text-2xl font-bold text-white">{quiz.qs.length}</p>
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

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {Object.keys(answers).length} / {quiz.qs.length} answered
          </p>
          <button
            type="submit"
            disabled={!allAnswered}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
          >
            Submit Assessment
          </button>
        </div>
      </form>
    </div>
  );
}
