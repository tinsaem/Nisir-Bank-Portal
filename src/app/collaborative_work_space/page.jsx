"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeNav from "@/components/EmployeeNav";
import { loadCurrentUser } from "@/lib/currentUser";

// ── Category metadata ───────────────────────────────────────────────────────
const CATEGORY_META = {
  general:  { label: "General",            color: "text-gray-600",    bg: "bg-gray-100",    icon: "forum" },
  phishing: { label: "Phishing Awareness", color: "text-red-700",     bg: "bg-red-100",     icon: "alternate_email" },
  password: { label: "Password Safety",    color: "text-purple-700",  bg: "bg-purple-100",  icon: "vpn_key" },
  policy:   { label: "Policy Questions",   color: "text-blue-700",    bg: "bg-blue-100",    icon: "policy" },
  tips:     { label: "Tips & Tricks",      color: "text-emerald-700", bg: "bg-emerald-100", icon: "lightbulb" },
  incident: { label: "Incident Reports",   color: "text-orange-700",  bg: "bg-orange-100",  icon: "warning" },
};

const DOC_CATEGORY_META = {
  policy:    { icon: "policy",      color: "text-blue-700",    bg: "bg-blue-50" },
  training:  { icon: "school",      color: "text-emerald-700", bg: "bg-emerald-50" },
  guide:     { icon: "menu_book",   color: "text-indigo-700",  bg: "bg-indigo-50" },
  form:      { icon: "description", color: "text-orange-600",  bg: "bg-orange-50" },
  directive: { icon: "gavel",       color: "text-violet-700",  bg: "bg-violet-50" },
  general:   { icon: "folder",      color: "text-gray-600",    bg: "bg-gray-50" },
};

const LEADERBOARD = [
  { rank: 1, name: "Employee 012", dept: "Retail Banking",      score: 0, badge: "🥇", completed: 0 },
  { rank: 2, name: "Employee 047", dept: "Customer Relations",  score: 0, badge: "🥈", completed: 0 },
  { rank: 3, name: "Employee 023", dept: "Branch Operations",   score: 0, badge: "🥉", completed: 0 },
  { rank: 4, name: "Employee 061", dept: "Retail Banking",      score: 0, badge: "",   completed: 0 },
  { rank: 5, name: "Employee 008", dept: "Customer Relations",  score: 0, badge: "",   completed: 0 },
  { rank: 6, name: "Employee 099", dept: "Branch Operations",   score: 0, badge: "",   completed: 0 },
  { rank: 7, name: "Employee 034", dept: "Retail Banking",      score: 0, badge: "",   completed: 0 },
  { rank: 8, name: "Employee 075", dept: "Customer Relations",  score: 0, badge: "",   completed: 0 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDocBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const CATEGORY_FILTERS = [
  { key: "all",      label: "All Topics" },
  { key: "phishing", label: "Phishing" },
  { key: "password", label: "Passwords" },
  { key: "policy",   label: "Policy" },
  { key: "tips",     label: "Tips" },
  { key: "incident", label: "Incidents" },
  { key: "general",  label: "General" },
];

const TABS = [
  { key: "discussions", label: "Discussions", icon: "forum" },
  { key: "leaderboard", label: "Leaderboard", icon: "leaderboard" },
  { key: "resources",   label: "Resources",   icon: "folder_open" },
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function CollaborativeWorkSpace() {
  const router = useRouter();
  const [account,          setAccount]          = useState(null);
  const [activeTab,        setActiveTab]        = useState("discussions");
  const [documents,        setDocuments]        = useState([]);
  const [discussions,      setDiscussions]      = useState([]);
  const [loadingList,      setLoadingList]      = useState(false);
  const [filterCategory,   setFilterCategory]   = useState("all");
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedThread,   setSelectedThread]   = useState(null);
  const [loadingThread,    setLoadingThread]    = useState(false);
  const [replyText,        setReplyText]        = useState("");
  const [submittingReply,  setSubmittingReply]  = useState(false);
  const [showNewTopic,     setShowNewTopic]     = useState(false);
  const [newTopicForm,     setNewTopicForm]     = useState({ title: "", body: "", category: "general" });
  const [submittingTopic,  setSubmittingTopic]  = useState(false);
  const [topicError,       setTopicError]       = useState("");
  const [showReport,       setShowReport]       = useState(false);
  const [reportForm,       setReportForm]       = useState({ threatType: "Phishing Email", location: "", description: "", urgency: "Medium" });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess,    setReportSuccess]    = useState(false);

  // Auth
  useEffect(() => {
    loadCurrentUser().then((parsed) => {
      if (!parsed) { router.replace("/"); return; }
      if (parsed.role === "ADMIN") { router.replace("/admin_dashboard"); return; }
      setAccount(parsed);
    });
  }, [router]);

  const fetchDiscussions = useCallback(async () => {
    setLoadingList(true);
    try {
      const r = await fetch("/api/discussions");
      const text = await r.text();
      if (!text) return;
      const d = JSON.parse(text);
      if (d.success) setDiscussions(d.discussions ?? []);
    } catch {
      // silently keep empty list on parse/network error
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!account) return;
    fetchDiscussions();
    fetch("/api/documents").then((r) => r.json()).then((d) => { if (d.success) setDocuments(d.documents); }).catch(() => {});
  }, [account, fetchDiscussions]);

  if (!account) return <main className="min-h-screen bg-[#f0f4fb]" />;

  const filtered = discussions.filter((d) => {
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || (d.body || "").toLowerCase().includes(q);
    }
    return true;
  });

  async function openThread(id) {
    setLoadingThread(true);
    setSelectedThread(null);
    try {
      const r = await fetch(`/api/discussions/${id}`);
      const d = await r.json();
      if (d.success) setSelectedThread(d.discussion);
    } finally {
      setLoadingThread(false);
    }
  }

  async function handleReact(emoji, replyId = null) {
    if (!selectedThread) return;
    try {
      const r = await fetch(`/api/discussions/${selectedThread.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, replyId: replyId || undefined }),
      });
      const data = await r.json();
      if (!data.success) return;
      setSelectedThread((prev) => {
        if (!replyId) {
          return { ...prev, reactions: data.reactions };
        }
        return {
          ...prev,
          replies: prev.replies.map((rep) =>
            rep.id === replyId ? { ...rep, reactions: data.reactions } : rep
          ),
        };
      });
    } catch { /* best-effort */ }
  }

  async function submitReply() {
    if (!replyText.trim() || !selectedThread) return;
    setSubmittingReply(true);
    try {
      await fetch(`/api/discussions/${selectedThread.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      setReplyText("");
      const r = await fetch(`/api/discussions/${selectedThread.id}`);
      const d = await r.json();
      if (d.success) { setSelectedThread(d.discussion); fetchDiscussions(); }
    } finally {
      setSubmittingReply(false);
    }
  }

  async function submitNewTopic() {
    if (!newTopicForm.title.trim() || !newTopicForm.body.trim()) {
      setTopicError("Title and content are required.");
      return;
    }
    setSubmittingTopic(true);
    setTopicError("");
    try {
      const r = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTopicForm),
      });
      const d = await r.json();
      if (d.success) {
        setShowNewTopic(false);
        setNewTopicForm({ title: "", body: "", category: "general" });
        await fetchDiscussions();
        openThread(d.discussion.id);
      } else {
        setTopicError(d.message || "Failed to post.");
      }
    } finally {
      setSubmittingTopic(false);
    }
  }

  function closeNewTopic() {
    setShowNewTopic(false);
    setTopicError("");
    setNewTopicForm({ title: "", body: "", category: "general" });
  }

  function closeReport() {
    setShowReport(false);
    setReportSuccess(false);
    setReportForm({ threatType: "Phishing Email", location: "", description: "", urgency: "Medium" });
  }

  async function submitReport() {
    if (!reportForm.description.trim()) return;
    setSubmittingReport(true);
    try {
      const title = `[${reportForm.urgency.toUpperCase()} PRIORITY] ${reportForm.threatType} Reported`;
      const body = [
        `Threat Type: ${reportForm.threatType}`,
        reportForm.location ? `Where Encountered: ${reportForm.location}` : null,
        `Urgency: ${reportForm.urgency}`,
        "",
        reportForm.description.trim(),
      ].filter((l) => l !== null).join("\n");
      await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, category: "incident" }),
      });
      setReportSuccess(true);
      await fetchDiscussions();
    } finally {
      setSubmittingReport(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <EmployeeNav />

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
        .card { background:#fff;border-radius:18px;border:1px solid rgba(195,198,209,0.4);box-shadow:0 2px 10px rgba(0,30,64,0.05); }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle; }
        .ms-filled { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
        textarea { resize:vertical; }
        textarea:focus, input:focus { outline:none; }
      `}</style>

      {/* ── New Topic Modal ── */}
      {showNewTopic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,10,30,0.75)", backdropFilter: "blur(8px)" }}
          onClick={closeNewTopic}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeNewTopic}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h2 className="hg text-lg font-bold text-gray-900 mb-5">Start a New Discussion</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="What would you like to discuss?"
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Category</label>
                <select
                  value={newTopicForm.category}
                  onChange={(e) => setNewTopicForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Content</label>
                <textarea
                  rows={5}
                  placeholder="Describe your topic, question, or insight in detail…"
                  value={newTopicForm.body}
                  onChange={(e) => setNewTopicForm((p) => ({ ...p, body: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {topicError && (
                <p className="text-xs text-red-600 font-semibold">{topicError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeNewTopic}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitNewTopic}
                  disabled={submittingTopic}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
                >
                  {submittingTopic ? "Posting…" : "Post Discussion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Threat Modal ── */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,0,0,0.80)", backdropFilter: "blur(8px)" }}
          onClick={closeReport}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-7 pt-6 pb-4" style={{ background: "linear-gradient(135deg,#7f1d1d,#b91c1c)" }}>
              <button
                type="button"
                onClick={closeReport}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white ms-filled" style={{ fontSize: 22 }}>crisis_alert</span>
                </div>
                <div>
                  <h2 className="hg text-lg font-bold text-white">Report Suspicious Threat</h2>
                  <p className="text-red-200 text-xs">Your report goes directly to the IT Security team</p>
                </div>
              </div>
            </div>

            <div className="px-7 py-5">
              {reportSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-emerald-600 ms-filled" style={{ fontSize: 36 }}>check_circle</span>
                  </div>
                  <h3 className="hg text-base font-bold text-gray-900 mb-2">Report Submitted</h3>
                  <p className="text-sm text-gray-500 mb-1">Your report has been logged and sent to the IT Security team.</p>
                  <p className="text-xs text-gray-400 mb-6">The security team will review it and follow up if needed. Thank you for keeping Nisir Bank safe.</p>
                  <button
                    type="button"
                    onClick={closeReport}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Threat Type</label>
                    <select
                      value={reportForm.threatType}
                      onChange={(e) => setReportForm((p) => ({ ...p, threatType: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white"
                    >
                      {["Phishing Email", "Suspicious Link / URL", "Social Engineering Attempt", "Malware / Suspicious Software", "Unauthorized Access", "Suspicious USB / Physical Device", "Data Breach / Data Leak", "Other"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Where did you encounter this? <span className="font-normal normal-case text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Work email inbox, company login page, USB port…"
                      value={reportForm.location}
                      onChange={(e) => setReportForm((p) => ({ ...p, location: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea
                      rows={4}
                      placeholder="Describe what you saw, received, or experienced. Include as much detail as possible."
                      value={reportForm.description}
                      onChange={(e) => setReportForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Urgency Level</label>
                    <div className="flex gap-2">
                      {[
                        { value: "Low",    color: "bg-emerald-50 border-emerald-300 text-emerald-700", active: "bg-emerald-600 border-emerald-600 text-white" },
                        { value: "Medium", color: "bg-orange-50 border-orange-300 text-orange-700",   active: "bg-orange-500 border-orange-500 text-white"   },
                        { value: "High",   color: "bg-red-50 border-red-300 text-red-700",            active: "bg-red-600 border-red-600 text-white"          },
                      ].map(({ value, color, active }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReportForm((p) => ({ ...p, urgency: value }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${reportForm.urgency === value ? active : color}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeReport}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitReport}
                      disabled={submittingReport || !reportForm.description.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#7f1d1d,#b91c1c)" }}
                    >
                      {submittingReport ? "Submitting…" : "Submit Report"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero-banner px-4 sm:px-6 py-8">
        <div className="hero-orb w-72 h-72 bg-blue-400" style={{ top: "-40px", right: "-30px" }} />
        <div className="hero-orb w-48 h-48 bg-indigo-300" style={{ bottom: "-30px", left: "8%" }} />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
              <span className="material-symbols-outlined ms-filled text-sm mr-1">forum</span>
              Security Community
            </p>
            <h1 className="hg text-white text-2xl sm:text-3xl font-bold leading-tight mb-1">
              Discussion Forum
            </h1>
            <p className="text-blue-200 text-sm">
              Discuss security topics, share insights, and learn from your colleagues
            </p>
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white border border-red-400/60 hover:bg-red-900/40 transition-colors"
              style={{ background: "rgba(185,28,28,0.35)" }}
            >
              <span className="material-symbols-outlined ms-filled text-sm">crisis_alert</span>
              Report Suspicious Threat
            </button>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center">
              <p className="hg text-2xl font-bold text-white">{discussions.length}</p>
              <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide">Topics</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center">
              <p className="hg text-2xl font-bold text-white">{discussions.length > 0 ? "Active" : "—"}</p>
              <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide">Community</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center">
              <p className="hg text-2xl font-bold text-white">
                {discussions.reduce((s, d) => s + (d._count?.replies ?? 0), 0)}
              </p>
              <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide">Replies</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setSelectedThread(null); }}
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

        {/* Tab content */}
        {activeTab === "discussions" && (
          <>
            {loadingThread && !selectedThread && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              </div>
            )}
            {selectedThread ? (
              <ThreadView
                thread={selectedThread}
                replyText={replyText}
                onReplyChange={setReplyText}
                onSubmitReply={submitReply}
                submitting={submittingReply}
                onBack={() => { setSelectedThread(null); setReplyText(""); }}
                myEmployeeId={account.employeeId}
                onReact={handleReact}
              />
            ) : (
              <DiscussionsList
                discussions={filtered}
                loading={loadingList}
                filterCategory={filterCategory}
                searchQuery={searchQuery}
                onFilterChange={setFilterCategory}
                onSearch={setSearchQuery}
                onOpen={openThread}
                onNewTopic={() => setShowNewTopic(true)}
                onReport={() => setShowReport(true)}
                myEmployeeId={account.employeeId}
              />
            )}
          </>
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardPanel currentName={account.fullName ?? account.name} />
        )}

        {activeTab === "resources" && (
          <ResourcesPanel documents={documents} />
        )}
      </div>
    </main>
  );
}

// ── Discussion list view ─────────────────────────────────────────────────────
function DiscussionsList({ discussions, loading, filterCategory, searchQuery, onFilterChange, onSearch, onOpen, onNewTopic, onReport, myEmployeeId }) {
  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search discussions…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onReport}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#7f1d1d,#b91c1c)" }}
          >
            <span className="material-symbols-outlined ms-filled text-base">crisis_alert</span>
            Report Threat
          </button>
          <button
            type="button"
            onClick={onNewTopic}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Discussion
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => {
          const active = filterCategory === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                active
                  ? "bg-[#003366] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Discussion cards */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && discussions.length === 0 && (
        <div className="card p-12 text-center">
          <span className="material-symbols-outlined text-gray-200 ms-filled" style={{ fontSize: 56 }}>forum</span>
          <p className="hg text-base font-bold text-gray-400 mt-3">No discussions yet</p>
          <p className="text-sm text-gray-300 mt-1">Be the first to start a conversation.</p>
          <button
            type="button"
            onClick={onNewTopic}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            Start a Discussion
          </button>
        </div>
      )}

      {!loading && discussions.length > 0 && (
        <div className="space-y-3">
          {discussions.map((d) => (
            <DiscussionCard key={d.id} discussion={d} onOpen={onOpen} myEmployeeId={myEmployeeId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Emoji reaction constants ─────────────────────────────────────────────────
const EMOJIS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "💡", label: "Insightful" },
  { emoji: "🔥", label: "Hot topic" },
  { emoji: "👏", label: "Applause" },
  { emoji: "😮", label: "Wow" },
];

function ReactionBar({ reactions = [], myEmployeeId, onReact }) {
  const myEmoji = reactions.find((r) => r.employeeId === myEmployeeId)?.emoji;
  const counts = {};
  reactions.forEach((r) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {EMOJIS.map(({ emoji, label }) => {
        const count = counts[emoji] || 0;
        const isActive = myEmoji === emoji;
        return (
          <button
            key={emoji}
            type="button"
            title={label}
            onClick={() => onReact(emoji)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all select-none
              ${isActive
                ? "bg-blue-100 border-blue-400 text-blue-800 shadow-sm scale-105"
                : count > 0
                  ? "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300"
                  : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:border-gray-200"
              }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-[11px] font-bold leading-none">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function DiscussionCard({ discussion, onOpen, myEmployeeId }) {
  const cat = CATEGORY_META[discussion.category] ?? CATEGORY_META.general;
  const preview = (discussion.body || "").replace(/\n+/g, " ").slice(0, 150);
  const replyCount = discussion._count?.replies ?? 0;
  const reactions = discussion.reactions ?? [];

  // Aggregate emoji counts for the card summary
  const counts = {};
  reactions.forEach((r) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
  const topReactions = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const myEmoji = reactions.find((r) => r.employeeId === myEmployeeId)?.emoji;

  return (
    <button
      type="button"
      onClick={() => onOpen(discussion.id)}
      className="card w-full text-left p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,30,64,0.1)] cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined ms-filled text-lg ${cat.color}`}>{cat.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.bg} ${cat.color}`}>
              {cat.label}
            </span>
            <span className="text-[11px] text-gray-400">{timeAgo(discussion.createdAt)}</span>
          </div>

          <p className="hg text-sm font-bold text-gray-900 mb-1 leading-snug">{discussion.title}</p>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{preview}{preview.length < (discussion.body || "").length ? "…" : ""}</p>

          <div className="flex items-center justify-between gap-3 mt-2.5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
                >
                  {initials(discussion.authorName)}
                </div>
                <span className="text-[11px] text-gray-500 font-medium">{discussion.authorName}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
                {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </div>
            </div>

            {/* Reaction summary chips (read-only on the card) */}
            {topReactions.length > 0 && (
              <div className="flex items-center gap-1">
                {topReactions.map(([emoji, count]) => (
                  <span
                    key={emoji}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] border
                      ${myEmoji === emoji ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-100 text-gray-500"}`}
                  >
                    {emoji} <span className="font-bold">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Thread view ──────────────────────────────────────────────────────────────
function ThreadView({ thread, replyText, onReplyChange, onSubmitReply, submitting, onBack, myEmployeeId, onReact }) {
  const cat = CATEGORY_META[thread.category] ?? CATEGORY_META.general;

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to discussions
      </button>

      {/* Original post */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cat.bg} ${cat.color}`}>
            <span className="material-symbols-outlined ms-filled text-sm">{cat.icon}</span>
            {cat.label}
          </span>
        </div>

        <h2 className="hg text-lg font-bold text-gray-900 mb-4 leading-snug">{thread.title}</h2>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
          >
            {initials(thread.authorName)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{thread.authorName}</p>
            <p className="text-xs text-gray-400">{timeAgo(thread.createdAt)}</p>
          </div>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4 mb-4">
          {thread.body}
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">React</p>
          <ReactionBar
            reactions={thread.reactions ?? []}
            myEmployeeId={myEmployeeId}
            onReact={(emoji) => onReact(emoji, null)}
          />
        </div>
      </div>

      {/* Replies */}
      {thread.replies && thread.replies.length > 0 && (
        <div className="card divide-y divide-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {thread.replies.length} {thread.replies.length === 1 ? "Reply" : "Replies"}
            </p>
          </div>
          {thread.replies.map((reply) => (
            <div key={reply.id} className="p-5 flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg,#1f477b,#5b8fc7)" }}
              >
                {initials(reply.authorName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-gray-900">{reply.authorName}</p>
                  <span className="text-[11px] text-gray-400">{timeAgo(reply.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{reply.body}</p>
                <ReactionBar
                  reactions={reply.reactions ?? []}
                  myEmployeeId={myEmployeeId}
                  onReact={(emoji) => onReact(emoji, reply.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div className="card p-5">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Your Reply</p>
        <textarea
          rows={4}
          placeholder="Share your thoughts, answer, or insight…"
          value={replyText}
          onChange={(e) => onReplyChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all mb-3"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSubmitReply}
            disabled={submitting || !replyText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
          >
            <span className="material-symbols-outlined text-base">send</span>
            {submitting ? "Posting…" : "Post Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
function LeaderboardPanel({ currentName }) {
  return (
    <div className="card overflow-hidden">
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg,#001e40,#003366,#1f477b)" }}
      >
        <span className="material-symbols-outlined ms-filled text-yellow-400 text-2xl">emoji_events</span>
        <div>
          <h2 className="hg text-base font-bold text-white">ISP Compliance Leaderboard</h2>
          <p className="text-blue-300 text-[11px]">Ranked by ISP tokens earned · Training not yet started</p>
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
                  : <span className="hg text-sm font-bold text-gray-300">{entry.rank}</span>}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                {entry.name.split(" ").slice(-1)[0].slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`hg text-sm font-bold truncate ${isMe ? "text-blue-700" : "text-gray-900"}`}>
                  {entry.name}
                  {isMe && <span className="text-[10px] font-normal text-blue-400 ml-1">(you)</span>}
                </p>
                <p className="text-[11px] text-gray-400">{entry.dept}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="hg text-sm font-bold text-gray-400">0 ISP</p>
                <p className="text-[11px] text-gray-300">0 modules</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 text-center">
          Complete training modules to earn ISP tokens and appear on the leaderboard.
        </p>
      </div>
    </div>
  );
}

// ── Resources ────────────────────────────────────────────────────────────────
const CONTACTS = [
  { icon: "support_agent", label: "IT Helpdesk",         sub: "Ext. 4000 — 24/7",     color: "text-blue-700",    bg: "bg-blue-50" },
  { icon: "security",      label: "Security Operations", sub: "Ext. 4444 — Incidents", color: "text-red-600",     bg: "bg-red-50" },
  { icon: "mail",          label: "Report Phishing",     sub: "security@nisirbank.et", color: "text-emerald-600", bg: "bg-emerald-50" },
];

function ResourcesPanel({ documents }) {
  const hasDocs = documents && documents.length > 0;
  return (
    <div className="space-y-4">
      <div className="bg-[#001e40] rounded-2xl p-5 flex items-start gap-4">
        <span className="material-symbols-outlined ms-filled text-blue-300 text-3xl shrink-0">info</span>
        <div>
          <p className="hg text-sm font-bold text-white mb-1">Official Security Resources</p>
          <p className="text-blue-200 text-xs leading-relaxed">
            Documents below are official Nisir Bank and NBE security references. Contact the IT Security team if you cannot access a resource.
          </p>
        </div>
      </div>

      {hasDocs ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const meta = DOC_CATEGORY_META[doc.category] ?? DOC_CATEGORY_META.general;
            return (
              <a
                key={doc.id}
                href={`/documents/${doc.storedName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group no-underline"
              >
                <div className={`w-11 h-11 rounded-2xl ${meta.bg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ms-filled text-xl ${meta.color}`}>{meta.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="hg text-sm font-bold text-gray-900 truncate">{doc.title}</p>
                  <p className="text-[11px] text-gray-400">{doc.description || doc.fileName} · {formatDocBytes(doc.fileSize)}</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-600 transition-colors text-xl shrink-0">download</span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <span className="material-symbols-outlined text-gray-200 ms-filled" style={{ fontSize: 48 }}>folder_open</span>
          <p className="hg text-sm font-bold text-gray-400 mt-3">No documents available yet</p>
          <p className="text-xs text-gray-300 mt-1">Documents will appear here once uploaded by the IT Security team.</p>
        </div>
      )}

      <div className="card p-5">
        <h3 className="hg text-sm font-bold text-gray-900 mb-4">Quick Contacts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CONTACTS.map((c, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${c.bg}`}>
              <span className={`material-symbols-outlined ms-filled ${c.color} text-xl`}>{c.icon}</span>
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
