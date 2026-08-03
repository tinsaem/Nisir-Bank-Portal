"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EmployeeNav from "@/components/EmployeeNav";

const TAG_STYLES = {
  security: { bg: "bg-rose-50", text: "text-rose-600", icon: "shield" },
  hr: { bg: "bg-blue-50", text: "text-blue-700", icon: "groups" },
  compliance: { bg: "bg-violet-50", text: "text-violet-700", icon: "gavel" },
  training: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "school" },
  system: { bg: "bg-gray-100", text: "text-gray-600", icon: "settings" },
  internal: { bg: "bg-amber-50", text: "text-amber-600", icon: "store" },
  finance: { bg: "bg-teal-50", text: "text-teal-700", icon: "payments" },
};

const ACTED_STATUSES = new Set([
  "replied",
  "done",
  "approved",
  "declined",
  "downloaded",
  "verified",
  "forwarded",
]);

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

async function patchEmail(id, payload) {
  const res = await fetch(`/api/internal-email/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
  return data.email;
}

export default function InternalEmailPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [emails, setEmails] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [policyDocs, setPolicyDocs] = useState([]);
  const [policyOpen, setPolicyOpen] = useState(false);

  // Reply state
  const [replyOpen,       setReplyOpen]       = useState(false);
  const [replyText,       setReplyText]       = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Forward state
  const [forwardOpen,       setForwardOpen]       = useState(false);
  const [forwardTo,         setForwardTo]         = useState("");
  const [forwardNote,       setForwardNote]       = useState("");
  const [forwardSubmitting, setForwardSubmitting] = useState(false);

  // Quiz state
  const [quizOpen,       setQuizOpen]       = useState(false);
  const [quizQuestions,  setQuizQuestions]  = useState([]);
  const [quizIdx,        setQuizIdx]        = useState(0);
  const [quizChoice,     setQuizChoice]     = useState(null);
  const [quizResult,     setQuizResult]     = useState(null);
  const [quizScore,      setQuizScore]      = useState(0);
  const [quizDone,       setQuizDone]       = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizLoading,    setQuizLoading]    = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is unavailable during SSR, so this can only be read post-mount
    setAccount(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!account) return;

    let cancelled = false;

    fetch("/api/internal-email")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setEmails(data.emails);
      });

    fetch("/api/documents?categories=policy")
      .then((res) => res.json())
      .then((data) => { if (!cancelled && data.success) setPolicyDocs(data.documents); })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [account]);

  async function openQuiz() {
    setQuizLoading(true);
    try {
      const r = await fetch("/api/policy-check");
      const d = await r.json();
      if (d.success && d.questions.length > 0) {
        setQuizQuestions(d.questions);
        setQuizIdx(0);
        setQuizChoice(null);
        setQuizResult(null);
        setQuizScore(0);
        setQuizDone(false);
        setQuizOpen(true);
      } else {
        alert("No self-check questions are available at this time.");
      }
    } catch {
      alert("Could not load self-check questions. Please try again later.");
    }
    setQuizLoading(false);
  }

  async function submitQuizAnswer() {
    if (!quizChoice || quizSubmitting) return;
    setQuizSubmitting(true);
    const q = quizQuestions[quizIdx];
    try {
      const r = await fetch("/api/policy-check/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, choiceId: quizChoice }),
      });
      const d = await r.json();
      if (d.success) {
        setQuizResult({ isCorrect: d.isCorrect, explanation: d.explanation });
        if (d.isCorrect) setQuizScore((s) => s + 1);
      }
    } catch { /* best-effort */ }
    setQuizSubmitting(false);
  }

  function nextQuestion() {
    if (quizIdx + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setQuizIdx((i) => i + 1);
      setQuizChoice(null);
      setQuizResult(null);
    }
  }

  function closeQuiz() {
    setQuizOpen(false);
    setQuizResult(null);
    setQuizChoice(null);
  }

  if (!account || !emails) {
    return <main className="min-h-screen bg-[#f0f4fb]" />;
  }

  const visibleEmails = emails.filter((email) => !email.isArchived);
  const unreadCount = visibleEmails.filter((email) => !email.isRead).length;
  const selectedEmail = selectedId ? visibleEmails.find((email) => email.id === selectedId) : null;

  function patchLocal(id, fields) {
    setEmails((prev) => prev.map((email) => (email.id === id ? { ...email, ...fields } : email)));
  }

  function openEmail(id) {
    if (selectedId && selectedId !== id) {
      const previous = emails.find((e) => e.id === selectedId);
      if (previous && !previous.isRead) {
        patchLocal(selectedId, { isRead: true });
        patchEmail(selectedId, { read: true }).catch(() => {});
      }
    }
    setSelectedId(id);
  }

  function openReplyModal() {
    if (!selectedEmail || selectedEmail.actionStatus === "replied") return;
    setReplyText("");
    setReplyOpen(true);
  }

  function closeReplyModal() {
    if (replySubmitting) return;
    setReplyOpen(false);
    setReplyText("");
  }

  async function submitReply(e) {
    e.preventDefault();
    if (!selectedEmail || replySubmitting || !replyText.trim()) return;
    setReplySubmitting(true);
    const id = selectedEmail.id;
    const text = replyText.trim();
    patchLocal(id, { actionStatus: "replied", actionAt: new Date().toISOString() });
    try {
      await patchEmail(id, { action: { status: "replied", text } });
    } catch {
      // best-effort sync
    }
    setReplySubmitting(false);
    setReplyOpen(false);
    setReplyText("");
  }

  function handleUnavailableClick() {
    alert("Not available this time.");
  }

  function takeLinkAction() {
    if (!selectedEmail) return;
    const id = selectedEmail.id;
    patchLocal(id, { actionStatus: "done", actionAt: new Date().toISOString() });
    patchEmail(id, { action: { status: "done" }, dv1: true }).catch(() => {});
  }

  function openForwardModal() {
    if (!selectedEmail || selectedEmail.actionStatus === "forwarded") return;
    setForwardTo("it-security@nisirbank.com");
    setForwardNote("");
    setForwardOpen(true);
  }

  function closeForwardModal() {
    if (forwardSubmitting) return;
    setForwardOpen(false);
  }

  async function submitForward(e) {
    e.preventDefault();
    if (!selectedEmail || forwardSubmitting || !forwardTo.trim()) return;
    setForwardSubmitting(true);
    const id = selectedEmail.id;
    const text = `Forwarded to: ${forwardTo.trim()}${forwardNote.trim() ? `\nNote: ${forwardNote.trim()}` : ""}`;
    patchLocal(id, { actionStatus: "forwarded", actionAt: new Date().toISOString() });
    try {
      await patchEmail(id, { action: { status: "forwarded", text } });
    } catch {
      // best-effort sync
    }
    setForwardSubmitting(false);
    setForwardOpen(false);
  }

  const tagStyle = selectedEmail ? TAG_STYLES[selectedEmail.tag] : null;

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <EmployeeNav />
      <style jsx global>{`
        .hg {
          font-family: "Hanken Grotesk", sans-serif;
        }

        .hero-banner {
          background: linear-gradient(135deg, #001e40 0%, #003366 45%, #1f477b 100%);
          position: relative;
          overflow: hidden;
        }

        .hero-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.15;
          pointer-events: none;
        }

        .section-card {
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(195, 198, 209, 0.4);
          box-shadow: 0 2px 12px rgba(0, 30, 64, 0.06);
        }

        .email-row {
          border-bottom: 1px solid rgba(195, 198, 209, 0.35);
          background: #ffffff;
          transition: background 0.15s;
          cursor: pointer;
        }

        .email-row:hover {
          background: #f6f8fc;
        }

        .email-row.read {
          background: #fafbfd;
        }

        .email-row.acted {
          background: #f4fbf7;
        }

        .email-row.active {
          background: #eaf1ff !important;
          border-left: 3px solid #2563eb;
        }

        .email-row.unread .email-subject {
          font-weight: 700;
          color: #0b1220;
        }

        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          color: #374151;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          transition: background 0.15s;
        }

        .toolbar-btn:hover {
          background: #e5e7eb;
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar-btn:disabled:hover {
          background: #f3f4f6;
        }

        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
          vertical-align: middle;
        }
      `}</style>

      <section className="hero-banner px-4 sm:px-6 py-10">
        <div
          className="hero-orb w-80 h-80 bg-blue-400"
          style={{ top: "-60px", right: "-40px" }}
        />
        <div
          className="hero-orb w-56 h-56 bg-indigo-300"
          style={{ bottom: "-40px", left: "10%" }}
        />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
              Internal Mail
            </p>
            <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight">
              Inbox
            </h1>
            <p className="text-blue-200 text-sm mt-2">
              Messages from HR, IT Security, Compliance, and your branch.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-bold hg text-white">{visibleEmails.length}</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">
                Total Messages
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-3xl font-bold hg text-yellow-300">{unreadCount}</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">
                Unread
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/employee_dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline mb-5"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* ── Policy & Reference Documents ── */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-indigo-100" style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#f8faff 60%,#fff 100%)" }}>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-indigo-100 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>policy</span>
                </div>
                <div>
                  <h2 className="hg text-sm font-bold text-indigo-900">Information Security Policies (ISP)</h2>
                  <p className="text-[11px] text-indigo-400">
                    {policyDocs.length > 0 ? `${policyDocs.length} policy document${policyDocs.length !== 1 ? "s" : ""} · Click any to open` : "Policy library"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={openQuiz}
                  disabled={quizLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "linear-gradient(135deg,#4338ca,#6366f1)" }}
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                  {quizLoading ? "Loading…" : "Take ISP Self-Check"}
                </button>
                {policyDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPolicyOpen((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    {policyOpen ? "Collapse" : "Expand"}
                    <span className="material-symbols-outlined text-sm" style={{ transform: policyOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      expand_more
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Document grid */}
            {policyOpen && policyDocs.length > 0 && (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {policyDocs.map((doc) => {
                  const CAT = {
                    policy:    { icon: "policy",      color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100"   },
                    directive: { icon: "gavel",        color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100" },
                    guide:     { icon: "menu_book",    color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100" },
                    training:  { icon: "school",       color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-100"},
                    form:      { icon: "description",  color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                    general:   { icon: "folder",       color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-100"   },
                  }[doc.category] ?? { icon: "description", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" };

                  return (
                    <a
                      key={doc.id}
                      href={`/documents/${doc.storedName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start gap-3 p-3.5 rounded-xl border ${CAT.border} bg-white hover:shadow-md hover:-translate-y-0.5 transition-all`}
                    >
                      <div className={`w-9 h-9 rounded-lg ${CAT.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <span className={`material-symbols-outlined text-lg ${CAT.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                          {CAT.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                          {doc.title}
                        </p>
                        {doc.description && (
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{doc.description}</p>
                        )}
                        <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT.bg} ${CAT.color}`}>
                          {doc.category}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-sm text-gray-300 group-hover:text-indigo-500 shrink-0 mt-0.5 transition-colors">
                        open_in_new
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

        <div className="section-card grid grid-cols-1 lg:grid-cols-[360px_1fr] overflow-hidden">
          <div className="border-b lg:border-b-0 lg:border-r border-gray-100 max-h-[640px] overflow-y-auto">
            {visibleEmails.map((email) => {
              const isUnread = !email.isRead;
              const isActed = ACTED_STATUSES.has(email.actionStatus);
              const isActive = selectedEmail && email.id === selectedEmail.id;
              const style = TAG_STYLES[email.tag];

              const rowClass = [
                "email-row w-full text-left px-4 py-3.5 flex items-start gap-3",
                isUnread ? "unread" : "read",
                isActed ? "acted" : "",
                isActive ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button key={email.id} type="button" onClick={() => openEmail(email.id)} className={rowClass}>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${style.bg} ${style.text}`}
                  >
                    {getInitials(email.sender)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {email.sender}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatRelativeTime(email.sentAt)}
                      </span>
                    </div>

                    <p className="email-subject text-[13px] text-gray-700 truncate mt-0.5">
                      {email.subject}
                    </p>

                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {email.preview}
                    </p>
                  </div>

                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  )}
                  {!isUnread && (
                    <span
                      className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                        isActed ? "text-emerald-500" : "text-gray-300"
                      }`}
                    >
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}

            {visibleEmails.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">Your inbox is empty.</p>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {!selectedEmail && visibleEmails.length > 0 && (
              <div className="flex flex-col items-center justify-center text-center py-14 px-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-blue-600">mark_email_unread</span>
                </div>
                <h2 className="hg text-xl font-bold text-gray-900 mb-5">
                  You have {visibleEmails.length} email{visibleEmails.length !== 1 ? "s" : ""} to review
                </h2>

                <div
                  className="w-full max-w-xl rounded-2xl border border-blue-100 p-6 sm:p-7 text-left"
                  style={{ background: "linear-gradient(160deg, #f5f9ff 0%, #ffffff 55%, #fbfdff 100%)" }}
                >
                  <p className="text-base text-gray-600 leading-relaxed" style={{ textAlign: "justify" }}>
                    This inbox tests how well you recognize and respond to everyday internal communications.
                    Treat every message as though you were an actual employee of Nisir Bank S.C. — read each
                    one carefully and act on it appropriately, in accordance with the Nisir Bank Information
                    Security Policies (ISP). You can find the Nisir Bank ISP in the top section for reference.
                    We also recommend completing the self-check before acting on any of the emails.
                  </p>

                  <div className="h-px bg-gray-100 my-5" />

                  <p
                    lang="am"
                    className="text-base text-gray-600 leading-loose"
                    style={{ textAlign: "justify" }}
                  >
                    እነዚ መልክቶች የንስር ባንክ ሰራተኞች ይሄን ፖርታል ከመጠቀም ጋር የተያያዙ ናቸው። ለእያንዳንዱን መልእክት እራስዎን ልክ እንደ
                    ንስር ባንክ ሰራተኛ አድርገው በመውስድ በጥንቃቄ ያንብቡ እና በንስር ባንክ የመረጃ ደህንነት ፖሊሲዎች መሠረት በአግባቡ ተገቢውን
                    ምላሽ ይስጡ ፡፡ ለማጣቀሻ ከላይኛው ክፍል የኒሲር ባንክ የኢንፎርሜሽኝ ሴኩሪቲ ፖሊሲ ማግኘት ይችላሉ። እንዲሁም በማንኛውም
                    ኢሜይሎች ላይ እርምጃ ከመውሰድዎ በፊት ከፖሊሲ ጋር የተያያዙ ጥያቄዎችን እንዲያጠናቅቁ እንመክራለን።
                  </p>
                </div>

                <p className="text-xs text-gray-400 mt-5">
                  Select a message from the list on the left to begin.
                </p>
              </div>
            )}

            {selectedEmail && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${tagStyle.bg} ${tagStyle.text}`}
                  >
                    <span className="material-symbols-outlined text-sm">{tagStyle.icon}</span>
                    {selectedEmail.tag}
                  </span>

                  <span className="text-xs text-gray-400">{formatRelativeTime(selectedEmail.sentAt)}</span>
                </div>

                <h2 className="hg text-2xl font-bold text-gray-900 mb-4 leading-snug">
                  {selectedEmail.subject}
                </h2>

                <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tagStyle.bg} ${tagStyle.text}`}
                    >
                      {getInitials(selectedEmail.sender)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedEmail.sender}</p>
                      <p className="text-xs text-gray-500">{selectedEmail.senderEmail}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      type="button"
                      className="toolbar-btn"
                      disabled={selectedEmail.actionStatus === "replied"}
                      onClick={openReplyModal}
                    >
                      <span className="material-symbols-outlined text-base">reply</span>
                      {selectedEmail.actionStatus === "replied" ? "Replied ✓" : "Reply"}
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn"
                      disabled={selectedEmail.actionStatus === "forwarded"}
                      onClick={openForwardModal}
                    >
                      <span className="material-symbols-outlined text-base">forward</span>
                      {selectedEmail.actionStatus === "forwarded" ? "Forwarded ✓" : "Forward"}
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn opacity-50 cursor-not-allowed"
                      onClick={handleUnavailableClick}
                    >
                      <span className="material-symbols-outlined text-base">archive</span>
                      Archive
                    </button>
                    <button
                      type="button"
                      className="toolbar-btn opacity-50 cursor-not-allowed"
                      onClick={handleUnavailableClick}
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </div>
                </div>

                <div
                  className={`relative overflow-hidden rounded-xl p-4 mb-6 border-l-4 ${
                    !selectedEmail.isRead
                      ? "bg-blue-50/50 border-blue-400"
                      : ACTED_STATUSES.has(selectedEmail.actionStatus)
                        ? "bg-emerald-50/40 border-emerald-300"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {selectedEmail.isRead && (
                    <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center z-0">
                      <span
                        className="text-emerald-900/10 font-black uppercase tracking-widest whitespace-nowrap"
                        style={{ fontSize: "2.75rem", transform: "rotate(-22deg)" }}
                      >
                        Already Read
                      </span>
                    </div>
                  )}

                  {!selectedEmail.isRead && (
                    <p className="relative z-10 text-[11px] font-bold text-blue-600 uppercase tracking-wide mb-2">
                      New message
                    </p>
                  )}

                  <p
                    className={`relative z-10 text-sm leading-relaxed whitespace-pre-line ${
                      !selectedEmail.isRead ? "text-gray-900 font-medium" : "text-gray-500"
                    }`}
                  >
                    {renderBody(selectedEmail, takeLinkAction)}
                  </p>
                </div>

              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Reply Modal ── */}
      {replyOpen && selectedEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,15,40,0.55)", backdropFilter: "blur(3px)" }}
          onClick={closeReplyModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reply to</p>
                <p className="text-sm font-bold text-gray-900">{selectedEmail.sender}</p>
              </div>
              <button
                type="button"
                onClick={closeReplyModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={submitReply} className="p-6">
              <p className="text-xs text-gray-500 mb-3">
                Re: <span className="font-semibold text-gray-700">{selectedEmail.subject}</span>
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                autoFocus
                placeholder="Write your reply…"
                style={{ display: "block", width: "100%", maxWidth: "100%", minWidth: "100%", boxSizing: "border-box" }}
                className="rounded-xl border border-gray-200 px-3.5 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="submit"
                  disabled={replySubmitting || !replyText.trim()}
                  className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
                >
                  {replySubmitting ? "Sending…" : "Send Reply"}
                </button>
                <button
                  type="button"
                  onClick={closeReplyModal}
                  className="text-gray-500 hover:text-gray-700 text-sm font-bold px-4 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Forward Modal ── */}
      {forwardOpen && selectedEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,15,40,0.55)", backdropFilter: "blur(3px)" }}
          onClick={closeForwardModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Forward</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-xs">{selectedEmail.subject}</p>
              </div>
              <button
                type="button"
                onClick={closeForwardModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={submitForward} className="p-6 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Forward to
                </label>
                <input
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  autoFocus
                  placeholder="name@nisirbank.com"
                  style={{ display: "block", width: "100%", maxWidth: "100%", minWidth: "100%", boxSizing: "border-box" }}
                  className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Suspect this message? Forward it to IT Security for review rather than clicking anything in it.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  rows={4}
                  placeholder="Add a note for the recipient…"
                  style={{ display: "block", width: "100%", maxWidth: "100%", minWidth: "100%", boxSizing: "border-box" }}
                  className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm leading-relaxed resize-y focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={forwardSubmitting || !forwardTo.trim()}
                  className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
                >
                  {forwardSubmitting ? "Forwarding…" : "Forward"}
                </button>
                <button
                  type="button"
                  onClick={closeForwardModal}
                  className="text-gray-500 hover:text-gray-700 text-sm font-bold px-4 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ISP Self-Check Quiz Modal ── */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,15,40,0.82)", backdropFilter: "blur(6px)" }}
          onClick={closeQuiz}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-7 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#312e81,#4338ca)" }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                <div>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">ISP Self-Check</p>
                  <p className="text-sm font-bold text-white">
                    {quizDone ? "Results" : `Question ${quizIdx + 1} of ${quizQuestions.length}`}
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeQuiz} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Progress bar */}
            {!quizDone && (
              <div className="h-1 bg-indigo-100">
                <div
                  className="h-1 bg-indigo-500 transition-all duration-500"
                  style={{ width: `${((quizIdx + (quizResult ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                />
              </div>
            )}

            <div className="px-7 py-6">
              {quizDone ? (
                /* ── Final score screen ── */
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${quizScore >= quizQuestions.length * 0.7 ? "bg-emerald-100" : "bg-amber-100"}`}>
                    <span className={`material-symbols-outlined text-4xl ms-fill ${quizScore >= quizQuestions.length * 0.7 ? "text-emerald-500" : "text-amber-500"}`}>
                      {quizScore >= quizQuestions.length * 0.7 ? "verified" : "emoji_events"}
                    </span>
                  </div>
                  <p className="hg text-2xl font-bold text-gray-900">{quizScore} / {quizQuestions.length}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {quizScore === quizQuestions.length
                      ? "Perfect score! Excellent policy knowledge."
                      : quizScore >= Math.ceil(quizQuestions.length * 0.7)
                      ? "Good job! Keep reviewing the policies."
                      : "Keep studying — review the ISP documents above."}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={closeQuiz} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => { setQuizIdx(0); setQuizChoice(null); setQuizResult(null); setQuizScore(0); setQuizDone(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#4338ca,#6366f1)" }}
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Question screen ── */
                <>
                  <p className="text-base font-bold text-gray-900 leading-snug mb-5">
                    {quizQuestions[quizIdx].question}
                  </p>

                  <div className="space-y-2.5 mb-6">
                    {quizQuestions[quizIdx].choices.map((c, ci) => {
                      const isSelected = quizChoice === c.id;
                      const isAnswered = quizResult !== null;

                      let borderColor = "border-gray-200";
                      let bgColor     = "bg-gray-50 hover:bg-gray-100";
                      let textColor   = "text-gray-800";

                      if (isAnswered) {
                        bgColor     = "bg-gray-50";
                        borderColor = "border-gray-100";
                      }
                      if (isSelected && isAnswered) {
                        if (quizResult.isCorrect) {
                          borderColor = "border-emerald-400";
                          bgColor     = "bg-emerald-50";
                          textColor   = "text-emerald-800";
                        } else {
                          borderColor = "border-red-400";
                          bgColor     = "bg-red-50";
                          textColor   = "text-red-800";
                        }
                      } else if (isSelected) {
                        borderColor = "border-indigo-400";
                        bgColor     = "bg-indigo-50";
                        textColor   = "text-indigo-800";
                      }

                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => setQuizChoice(c.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all ${borderColor} ${bgColor} ${textColor} disabled:cursor-default`}
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-black transition-colors ${isSelected ? (isAnswered ? (quizResult.isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-red-500 bg-red-500 text-white") : "border-indigo-500 bg-indigo-500 text-white") : "border-gray-300"}`}>
                            {String.fromCharCode(65 + ci)}
                          </span>
                          {c.text}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {quizResult && (
                    <div className={`rounded-xl p-4 mb-5 ${quizResult.isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`material-symbols-outlined text-lg ms-fill ${quizResult.isCorrect ? "text-emerald-500" : "text-red-500"}`}>
                          {quizResult.isCorrect ? "check_circle" : "cancel"}
                        </span>
                        <p className={`text-sm font-bold ${quizResult.isCorrect ? "text-emerald-800" : "text-red-800"}`}>
                          {quizResult.isCorrect ? "Correct!" : "Incorrect"}
                        </p>
                      </div>
                      {quizResult.explanation && (
                        <p className="text-xs text-gray-600 leading-relaxed">{quizResult.explanation}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!quizResult ? (
                      <button
                        type="button"
                        onClick={submitQuizAnswer}
                        disabled={!quizChoice || quizSubmitting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
                        style={{ background: "linear-gradient(135deg,#4338ca,#6366f1)" }}
                      >
                        {quizSubmitting ? "Checking…" : "Submit Answer"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextQuestion}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#4338ca,#6366f1)" }}
                      >
                        {quizIdx + 1 >= quizQuestions.length ? "See Results" : "Next Question →"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InlineAction({ email, onTakeLinkAction }) {
  const isDone = email.actionStatus === "done";
  const label = isDone ? `${email.actionLabel} ✓` : email.actionLabel;
  const className = `font-semibold underline decoration-[1.5px] ${
    isDone ? "text-emerald-700" : "text-blue-700 hover:text-blue-800"
  }`;

  if (email.href && !isDone) {
    return (
      <Link
        href={email.href}
        onClick={onTakeLinkAction}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onTakeLinkAction} disabled={isDone} className={className}>
      {label}
    </button>
  );
}

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;

function linkifyText(text, keyPrefix) {
  return text.split(URL_REGEX).map((part, i) => {
    if (i % 2 === 0) return part;
    const href = part.startsWith("www.") ? `https://${part}` : part;
    return (
      <a
        key={`${keyPrefix}-${i}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blue-700 underline decoration-[1.5px] hover:text-blue-800"
      >
        {part}
      </a>
    );
  });
}

function renderBody(email, onTakeLinkAction) {
  if (email.actionType !== "link" || !email.body.includes("%%LINK%%")) {
    return linkifyText(email.body, "body");
  }
  const [before, after] = email.body.split("%%LINK%%");
  return (
    <>
      {linkifyText(before, "before")}
      <InlineAction email={email} onTakeLinkAction={onTakeLinkAction} />
      {linkifyText(after, "after")}
    </>
  );
}

