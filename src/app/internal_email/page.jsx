"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [pendingAction, setPendingAction] = useState({});
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [credentialDraft, setCredentialDraft] = useState({ employeeId: "", password: "" });

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
        if (data.emails.length > 0) setSelectedId(data.emails[0].id);
      });

    return () => {
      cancelled = true;
    };
  }, [account]);

  if (!account || !emails) {
    return <main className="min-h-screen bg-[#f0f4fb]" />;
  }

  const visibleEmails = emails.filter((email) => !email.isArchived);
  const unreadCount = visibleEmails.filter((email) => !email.isRead).length;
  const selectedEmail = visibleEmails.find((email) => email.id === selectedId) || visibleEmails[0];

  function patchLocal(id, fields) {
    setEmails((prev) => prev.map((email) => (email.id === id ? { ...email, ...fields } : email)));
  }

  function openEmail(id) {
    setSelectedId(id);
    setReplyOpen(false);
    setReplyDraft("");
    setCredentialDraft({ employeeId: "", password: "" });

    const email = emails.find((e) => e.id === id);
    if (email && !email.isRead) {
      patchLocal(id, { isRead: true });
      patchEmail(id, { read: true }).catch(() => {});
    }
  }

  async function sendReply() {
    if (!replyDraft.trim() || !selectedEmail) return;
    const text = replyDraft.trim();
    patchLocal(selectedEmail.id, { actionStatus: "replied", actionText: text, actionAt: new Date().toISOString() });
    setReplyDraft("");
    setReplyOpen(false);
    try {
      await patchEmail(selectedEmail.id, { action: { status: "replied", text } });
    } catch {
      // local state already reflects the reply; a failed network sync isn't worth blocking the UI for
    }
  }

  function withPending(id, isPending) {
    setPendingAction((prev) => ({ ...prev, [id]: isPending }));
  }

  async function submitCredentials(e) {
    e.preventDefault();
    if (!selectedEmail) return;
    const id = selectedEmail.id;
    setCredentialDraft({ employeeId: "", password: "" });
    withPending(id, "verifying");
    setTimeout(async () => {
      withPending(id, false);
      patchLocal(id, { actionStatus: "verified", actionAt: new Date().toISOString() });
      try {
        await patchEmail(id, { action: { status: "verified" }, dv2: true });
      } catch {
        // best-effort sync
      }
    }, 900);
  }

  function downloadAttachment() {
    if (!selectedEmail) return;
    const id = selectedEmail.id;
    withPending(id, "downloading");
    setTimeout(async () => {
      withPending(id, false);
      patchLocal(id, { actionStatus: "downloaded", actionAt: new Date().toISOString() });
      try {
        await patchEmail(id, { action: { status: "downloaded" } });
      } catch {
        // best-effort sync
      }
    }, 900);
  }

  function takeLinkAction() {
    if (!selectedEmail) return;
    const id = selectedEmail.id;
    withPending(id, "opening");
    setTimeout(async () => {
      withPending(id, false);
      patchLocal(id, { actionStatus: "done", actionAt: new Date().toISOString() });
      try {
        await patchEmail(id, { action: { status: "done" }, dv1: true });
      } catch {
        // best-effort sync
      }
    }, 700);
  }

  function recordCredentialInteraction() {
    if (!selectedEmail) return;
    patchEmail(selectedEmail.id, { dv1: true }).catch(() => {
      // best-effort sync
    });
  }

  async function approveRequest(approved) {
    if (!selectedEmail) return;
    const status = approved ? "approved" : "declined";
    patchLocal(selectedEmail.id, { actionStatus: status, actionAt: new Date().toISOString() });
    try {
      await patchEmail(selectedEmail.id, { action: { status } });
    } catch {
      // best-effort sync
    }
  }

  async function archiveEmail() {
    if (!selectedEmail) return;
    const id = selectedEmail.id;
    patchLocal(id, { isArchived: true });
    const next = visibleEmails.find((email) => email.id !== id);
    if (next) openEmail(next.id);
    try {
      await patchEmail(id, { archived: true });
    } catch {
      // best-effort sync
    }
  }

  const tagStyle = selectedEmail ? TAG_STYLES[selectedEmail.tag] : null;
  const currentPending = selectedEmail ? pendingAction[selectedEmail.id] : false;

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
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
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white/95 shadow shrink-0">
                <img src="/images/nisir_bank_logo.svg" alt="Nisir Bank S.C." className="h-8 w-8 object-contain" />
              </div>
              <span className="text-white/70 text-xs font-semibold">Nisir Bank S.C.</span>
            </div>
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
                      onClick={() => setReplyOpen((open) => !open)}
                    >
                      <span className="material-symbols-outlined text-base">reply</span>
                      Reply
                    </button>
                    <button type="button" className="toolbar-btn" onClick={archiveEmail}>
                      <span className="material-symbols-outlined text-base">archive</span>
                      Archive
                    </button>
                    <button type="button" className="toolbar-btn" onClick={archiveEmail}>
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-4 mb-6 border-l-4 ${
                    !selectedEmail.isRead
                      ? "bg-blue-50/50 border-blue-400"
                      : ACTED_STATUSES.has(selectedEmail.actionStatus)
                        ? "bg-emerald-50/40 border-emerald-300"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {!selectedEmail.isRead && (
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide mb-2">
                      New message
                    </p>
                  )}

                  <p
                    className={`text-sm leading-relaxed whitespace-pre-line ${
                      !selectedEmail.isRead ? "text-gray-900 font-medium" : "text-gray-500"
                    }`}
                  >
                    {renderBody(selectedEmail, currentPending, takeLinkAction)}
                  </p>
                </div>

                <EmailActionPanel
                  email={selectedEmail}
                  pending={currentPending}
                  onApprove={approveRequest}
                  onDownload={downloadAttachment}
                  onSubmitCredentials={submitCredentials}
                  onCredentialFocus={recordCredentialInteraction}
                  credentialDraft={credentialDraft}
                  setCredentialDraft={setCredentialDraft}
                  onOpenReply={() => setReplyOpen(true)}
                />

                <div className="mt-6 pt-6 border-t border-gray-100 sm:hidden flex items-center gap-2">
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => setReplyOpen((open) => !open)}
                  >
                    <span className="material-symbols-outlined text-base">reply</span>
                    Reply
                  </button>
                  <button type="button" className="toolbar-btn" onClick={archiveEmail}>
                    <span className="material-symbols-outlined text-base">archive</span>
                    Archive
                  </button>
                </div>

                {selectedEmail.actionStatus === "replied" && (
                  <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                      You replied
                      {selectedEmail.actionAt ? ` · ${formatRelativeTime(selectedEmail.actionAt)}` : ""}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {selectedEmail.actionText}
                    </p>
                  </div>
                )}

                {replyOpen && (
                  <div className="mt-6">
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="Write your reply…"
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 p-3.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyOpen(false);
                          setReplyDraft("");
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={sendReply}
                        disabled={!replyDraft.trim()}
                        className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                      >
                        Send
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InlineAction({ email, pending, onTakeLinkAction }) {
  const isDone = email.actionStatus === "done";
  const isOpening = pending === "opening";
  const label = isOpening ? "Opening…" : isDone ? `${email.actionLabel} ✓` : email.actionLabel;

  const className = `font-semibold underline decoration-[1.5px] ${
    isDone ? "text-emerald-700" : "text-blue-700 hover:text-blue-800"
  }`;

  if (email.href && !isDone) {
    return (
      <Link href={email.href} onClick={onTakeLinkAction} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onTakeLinkAction} disabled={isOpening || isDone} className={className}>
      {label}
    </button>
  );
}

function renderBody(email, pending, onTakeLinkAction) {
  if (email.actionType !== "link" || !email.body.includes("%%LINK%%")) {
    return email.body;
  }

  const [before, after] = email.body.split("%%LINK%%");
  return (
    <>
      {before}
      <InlineAction email={email} pending={pending} onTakeLinkAction={onTakeLinkAction} />
      {after}
    </>
  );
}

function EmailActionPanel({
  email,
  pending,
  onApprove,
  onDownload,
  onSubmitCredentials,
  onCredentialFocus,
  credentialDraft,
  setCredentialDraft,
  onOpenReply,
}) {
  if (email.actionType === "info" || email.actionType === "link") return null;

  if (email.actionType === "reply") {
    if (email.actionStatus === "replied") return null;

    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-700">{email.replyPrompt}</p>
        <button
          type="button"
          onClick={onOpenReply}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-base">reply</span>
          Reply Now
        </button>
      </div>
    );
  }

  if (email.actionType === "approve") {
    if (email.actionStatus === "approved" || email.actionStatus === "declined") {
      return (
        <p className="text-sm font-semibold text-gray-700">
          {email.actionStatus === "approved" ? `✓ ${email.approveLabel}` : `✓ ${email.declineLabel}`}
        </p>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onApprove(true)}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-sm font-bold px-4 py-2 rounded-xl"
        >
          {email.approveLabel}
        </button>
        <button
          type="button"
          onClick={() => onApprove(false)}
          className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
        >
          {email.declineLabel}
        </button>
      </div>
    );
  }

  if (email.actionType === "attachment") {
    const isDownloading = pending === "downloading";
    const isDownloaded = email.actionStatus === "downloaded";

    return (
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-teal-700 text-2xl">
            description
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{email.attachmentName}</p>
          <p className="text-xs text-gray-500">{email.attachmentSize}</p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading || isDownloaded}
          className="bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-1.5 shrink-0"
        >
          {isDownloading ? "Downloading…" : isDownloaded ? "✓ Downloaded" : "Download"}
        </button>
      </div>
    );
  }

  if (email.actionType === "credential") {
    if (email.actionStatus === "verified") {
      return (
        <p className="text-sm font-semibold text-emerald-800">
          ✓ Verified — thank you for confirming your identity.
        </p>
      );
    }

    const isVerifying = pending === "verifying";

    return (
      <form onSubmit={onSubmitCredentials} className="space-y-3 max-w-sm">
        <input
          type="text"
          placeholder="Employee ID"
          value={credentialDraft.employeeId}
          onFocus={onCredentialFocus}
          onChange={(e) =>
            setCredentialDraft((prev) => ({ ...prev, employeeId: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="password"
          placeholder="Password"
          value={credentialDraft.password}
          onFocus={onCredentialFocus}
          onChange={(e) =>
            setCredentialDraft((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="submit"
          disabled={isVerifying}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          {isVerifying ? "Verifying…" : email.actionLabel}
        </button>
      </form>
    );
  }

  return null;
}
