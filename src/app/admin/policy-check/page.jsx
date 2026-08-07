"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadCurrentUser } from "@/lib/currentUser";

const BLANK_CHOICE = () => ({ text: "", isCorrect: false });
const BLANK_FORM   = () => ({ question: "", explanation: "", choices: [BLANK_CHOICE(), BLANK_CHOICE(), BLANK_CHOICE(), BLANK_CHOICE()] });

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPolicyCheckPage() {
  const router = useRouter();
  const [account,    setAccount]    = useState(null);
  const [tab,        setTab]        = useState("questions"); // "questions" | "attempts"

  // — Questions tab state —
  const [questions,  setQuestions]  = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(BLANK_FORM());
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [fetchError, setFetchError] = useState("");

  // — Attempts tab state —
  const [attemptsData,   setAttemptsData]   = useState(null);
  const [attemptsError,  setAttemptsError]  = useState("");
  const [expandedEmpId,  setExpandedEmpId]  = useState(null);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    loadCurrentUser().then((parsed) => {
      if (!parsed) { router.replace("/"); return; }
      if (parsed.role !== "ADMIN") { router.replace("/employee_dashboard"); return; }
      setAccount(parsed);
    });
  }, [router]);

  useEffect(() => { if (account) fetchQuestions(); }, [account]);

  useEffect(() => {
    if (account && tab === "attempts" && !attemptsData) fetchAttempts();
  }, [tab, account]);

  // ── Questions CRUD ──────────────────────────────────────────────

  async function fetchQuestions() {
    setFetchError("");
    try {
      const r = await fetch("/api/admin/policy-check");
      if (r.status === 401) { router.replace("/"); return; }
      const d = await r.json();
      if (d.success) { setQuestions(d.questions); }
      else { setFetchError(d.message || `Server error (${r.status})`); setQuestions([]); }
    } catch { setFetchError("Network error — could not reach the server."); setQuestions([]); }
  }

  async function fetchAttempts() {
    setAttemptsError("");
    setAttemptsLoading(true);
    try {
      const r = await fetch("/api/admin/policy-check/attempts");
      if (r.status === 401) { router.replace("/"); return; }
      const d = await r.json();
      if (d.success) { setAttemptsData(d); }
      else { setAttemptsError(d.message || "Failed to load attempts."); setAttemptsData({ byEmployee: [], summary: {}, totalQuestions: 0 }); }
    } catch { setAttemptsError("Network error."); setAttemptsData({ byEmployee: [], summary: {}, totalQuestions: 0 }); }
    setAttemptsLoading(false);
  }

  function openNew() {
    setEditId(null); setForm(BLANK_FORM()); setFormError(""); setShowForm(true);
  }

  function openEdit(q) {
    setEditId(q.id);
    setForm({ question: q.question, explanation: q.explanation ?? "", choices: q.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })) });
    setFormError(""); setShowForm(true);
  }

  function setChoice(i, field, value) {
    setForm((prev) => {
      const choices = prev.choices.map((c, idx) => {
        if (idx !== i) return field === "isCorrect" ? { ...c, isCorrect: false } : c;
        return field === "isCorrect" ? { ...c, isCorrect: true } : { ...c, [field]: value };
      });
      return { ...prev, choices };
    });
  }

  function addChoice()      { setForm((p) => ({ ...p, choices: [...p.choices, BLANK_CHOICE()] })); }
  function removeChoice(i)  { setForm((p) => ({ ...p, choices: p.choices.filter((_, idx) => idx !== i) })); }

  async function save() {
    setFormError("");
    const filledChoices = form.choices.filter((c) => c.text.trim());
    if (!form.question.trim())          { setFormError("Question text is required."); return; }
    if (filledChoices.length < 2)       { setFormError("At least 2 choices are required."); return; }
    if (!filledChoices.some((c) => c.isCorrect)) { setFormError("Mark at least one answer as correct."); return; }
    setSaving(true);
    const payload = { question: form.question, explanation: form.explanation, choices: filledChoices };
    const url    = editId ? `/api/admin/policy-check/${editId}` : "/api/admin/policy-check";
    const method = editId ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    setSaving(false);
    if (!d.success) { setFormError(d.message || "Failed to save."); return; }
    setShowForm(false);
    fetchQuestions();
    setAttemptsData(null); // refresh counts on next visit
  }

  async function toggleActive(q) {
    await fetch(`/api/admin/policy-check/${q.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !q.isActive }) });
    fetchQuestions();
  }

  async function deleteQuestion(id) {
    if (!window.confirm("Delete this question? All attempt records will also be deleted.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/policy-check/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchQuestions();
    setAttemptsData(null);
  }

  if (!account || !questions) return <main className="min-h-screen bg-[#f0f4fb]" />;

  const totalAttempts = questions.reduce((s, q) => s + (q._count?.attempts ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: "Hanken Grotesk", sans-serif; }
        .material-symbols-outlined { font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24; vertical-align:middle; }
        .ms-fill { font-variation-settings:"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 24; }
      `}</style>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#001e40 0%,#003366 50%,#1f477b 100%)" }} className="px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">SETA Administration</p>
          <h1 className="hg text-3xl font-bold text-white">ISP Self-Check</h1>
          <p className="text-blue-200 text-sm mt-2">Manage questions and review employee attempt records.</p>
          <Link href="/admin_dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white mt-3">
            <span className="material-symbols-outlined text-base">arrow_back</span>Back to Admin Dashboard
          </Link>

          <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm">
            {[
              { label: "Questions", value: questions.length },
              { label: "Active",    value: questions.filter((q) => q.isActive).length },
              { label: "Attempts",  value: totalAttempts },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
                <p className="hg text-2xl font-bold text-white">{s.value}</p>
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm w-fit">
          {[
            { key: "questions", icon: "quiz",       label: "Questions" },
            { key: "attempts",  icon: "people",     label: "Employee Attempts" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              style={tab === t.key ? { background: "linear-gradient(135deg,#003366,#1f477b)" } : {}}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════ QUESTIONS TAB ══════════════════ */}
      {tab === "questions" && (
        <>
          {/* Form modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
              style={{ background: "rgba(0,15,40,0.80)", backdropFilter: "blur(6px)" }}
              onClick={() => setShowForm(false)}
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mb-10" onClick={(e) => e.stopPropagation()}>
                <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="hg text-base font-bold text-gray-900">{editId ? "Edit Question" : "Add New Question"}</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
                <div className="px-7 py-5 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Question <span className="text-red-500">*</span></label>
                    <textarea rows={3} value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} placeholder="Enter the policy question…" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Explanation <span className="text-gray-400 font-normal normal-case">(shown after employee answers)</span></label>
                    <textarea rows={2} value={form.explanation} onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))} placeholder="Why is this answer correct?" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Answer Choices <span className="text-red-500">*</span><span className="text-gray-400 font-normal normal-case ml-1">— select the correct one</span></label>
                      <button type="button" onClick={addChoice} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add_circle</span>Add choice
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.choices.map((c, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${c.isCorrect ? "bg-emerald-50 border-emerald-300" : "bg-gray-50 border-gray-200"}`}>
                          <button type="button" title="Mark correct" onClick={() => setChoice(i, "isCorrect", true)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${c.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}>
                            {c.isCorrect && <span className="material-symbols-outlined text-white ms-fill" style={{ fontSize: 13 }}>check</span>}
                          </button>
                          <input type="text" value={c.text} onChange={(e) => setChoice(i, "text", e.target.value)} placeholder={`Choice ${i + 1}…`} className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-300" />
                          {form.choices.length > 2 && (
                            <button type="button" onClick={() => removeChoice(i)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                              <span className="material-symbols-outlined text-base">remove_circle</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">Click the circle to mark the correct answer.</p>
                  </div>
                  {formError && <p className="text-sm text-red-600 font-semibold">{formError}</p>}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg,#003366,#1f477b)" }}>
                      {saving ? "Saving…" : editId ? "Save Changes" : "Add Question"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="hg text-lg font-bold text-gray-900">All Questions <span className="text-sm font-normal text-gray-400">({questions.length})</span></h2>
              <button type="button" onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#003366,#1f477b)" }}>
                <span className="material-symbols-outlined text-base">add</span>Add Question
              </button>
            </div>

            {fetchError && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <span className="material-symbols-outlined text-red-500 text-xl shrink-0 mt-0.5">error</span>
                <div>
                  <p className="text-sm font-bold text-red-700">Failed to load questions</p>
                  <p className="text-xs text-red-500 mt-0.5">{fetchError}</p>
                  <button type="button" onClick={fetchQuestions} className="mt-2 text-xs font-bold text-red-600 underline">Retry</button>
                </div>
              </div>
            )}

            {questions.length === 0 && !fetchError ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <span className="material-symbols-outlined text-gray-200 ms-fill" style={{ fontSize: 56 }}>quiz</span>
                <p className="hg text-base font-bold text-gray-400 mt-3">No questions yet</p>
                <button type="button" onClick={openNew} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#003366,#1f477b)" }}>
                  <span className="material-symbols-outlined text-base">add</span>Add Question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isExpanded = expandedId === q.id;
                  return (
                    <div key={q.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${q.isActive ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"}`}>
                      <div className="flex items-start gap-4 p-5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${q.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-snug">{q.question}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${q.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{q.isActive ? "Active" : "Inactive"}</span>
                            <span className="text-[11px] text-gray-400">{q.choices.length} choices</span>
                            <span className="text-[11px] text-gray-400">{q._count?.attempts ?? 0} attempts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button type="button" onClick={() => setExpandedId(isExpanded ? null : q.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            <span className="material-symbols-outlined text-base" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>expand_more</span>
                          </button>
                          <button type="button" onClick={() => toggleActive(q)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" title={q.isActive ? "Deactivate" : "Activate"}>
                            <span className={`material-symbols-outlined text-base ${q.isActive ? "text-emerald-500" : "text-gray-300"}`}>toggle_on</span>
                          </button>
                          <button type="button" onClick={() => openEdit(q)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><span className="material-symbols-outlined text-base">edit</span></button>
                          <button type="button" onClick={() => deleteQuestion(q.id)} disabled={deletingId === q.id} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-40 transition-colors"><span className="material-symbols-outlined text-base">delete</span></button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-gray-50 px-5 pb-4 pt-3 space-y-2">
                          {q.explanation && <p className="text-[11px] text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2 mb-3"><span className="font-bold">Explanation: </span>{q.explanation}</p>}
                          {q.choices.map((c, ci) => (
                            <div key={c.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${c.isCorrect ? "bg-emerald-50 text-emerald-800 font-semibold" : "bg-gray-50 text-gray-600"}`}>
                              <span className={`material-symbols-outlined text-base ms-fill ${c.isCorrect ? "text-emerald-500" : "text-gray-300"}`}>{c.isCorrect ? "check_circle" : "radio_button_unchecked"}</span>
                              <span>{String.fromCharCode(65 + ci)}. {c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ══════════════════ ATTEMPTS TAB ══════════════════ */}
      {tab === "attempts" && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {attemptsLoading && (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
              <span className="text-sm font-semibold">Loading attempt records…</span>
            </div>
          )}

          {attemptsError && !attemptsLoading && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
              <span className="material-symbols-outlined text-red-500 text-xl shrink-0 mt-0.5">error</span>
              <div>
                <p className="text-sm font-bold text-red-700">Failed to load attempts</p>
                <p className="text-xs text-red-500 mt-0.5">{attemptsError}</p>
                <button type="button" onClick={fetchAttempts} className="mt-2 text-xs font-bold text-red-600 underline">Retry</button>
              </div>
            </div>
          )}

          {attemptsData && !attemptsLoading && (
            <>
              {/* Summary bar */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <h2 className="hg text-lg font-bold text-gray-900">
                  Employee Attempt Records
                  <span className="text-sm font-normal text-gray-400 ml-2">({attemptsData.byEmployee.length} employee{attemptsData.byEmployee.length !== 1 ? "s" : ""})</span>
                </h2>
                <button type="button" onClick={() => { setAttemptsData(null); fetchAttempts(); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800">
                  <span className="material-symbols-outlined text-base">refresh</span>Refresh
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Employees Attempted", value: attemptsData.summary.totalEmployees, icon: "group", color: "text-blue-700", bg: "bg-blue-50" },
                  { label: "Total Answers",        value: attemptsData.summary.totalAttempts,  icon: "fact_check", color: "text-indigo-700", bg: "bg-indigo-50" },
                  { label: "1st-Attempt Accuracy", value: `${attemptsData.summary.firstAttemptCorrectPct}%`, icon: "percent", color: "text-emerald-700", bg: "bg-emerald-50" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ms-fill ${s.color}`}>{s.icon}</span>
                    </div>
                    <div>
                      <p className={`hg text-xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {attemptsData.byEmployee.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                  <span className="material-symbols-outlined text-gray-200 ms-fill" style={{ fontSize: 56 }}>person_off</span>
                  <p className="hg text-base font-bold text-gray-400 mt-3">No attempts yet</p>
                  <p className="text-sm text-gray-300 mt-1">Employees haven't taken the ISP self-check quiz yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attemptsData.byEmployee.map((emp) => {
                    const isExp = expandedEmpId === emp.employeeId;
                    const maxRun = emp.totalQuizRuns;

                    return (
                      <div key={emp.employeeId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Employee row */}
                        <div className="flex items-center gap-4 p-5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                            {emp.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                            <p className="text-[11px] text-gray-400">{emp.employeeId} · {emp.department}</p>
                          </div>

                          {/* Attempt badges */}
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {Array.from({ length: maxRun }, (_, i) => i + 1).map((run) => {
                              const correct = emp.questionRows.filter((r) => r.attempts.find((a) => a.attemptNumber === run)?.isCorrect).length;
                              const total   = emp.questionRows.filter((r) => r.attempts.some((a) => a.attemptNumber === run)).length;
                              if (total === 0) return null;
                              const pct = Math.round((correct / total) * 100);
                              const isGood = pct >= 70;
                              return (
                                <div key={run} className={`flex flex-col items-center px-3 py-1.5 rounded-xl border text-center ${isGood ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                                  <p className={`text-xs font-black ${isGood ? "text-emerald-700" : "text-amber-700"}`}>{correct}/{total}</p>
                                  <p className={`text-[9px] font-bold uppercase tracking-wide ${isGood ? "text-emerald-500" : "text-amber-500"}`}>
                                    {run === 1 ? "1st" : run === 2 ? "2nd" : run === 3 ? "3rd" : `${run}th`} try
                                  </p>
                                </div>
                              );
                            })}
                            <div className="text-[10px] text-gray-400 font-semibold ml-1">{fmt(emp.lastAttemptedAt)}</div>
                          </div>

                          <button type="button" onClick={() => setExpandedEmpId(isExp ? null : emp.employeeId)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors ml-1 shrink-0">
                            <span className="material-symbols-outlined text-base" style={{ transform: isExp ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>expand_more</span>
                          </button>
                        </div>

                        {/* Expanded: per-question breakdown */}
                        {isExp && (
                          <div className="border-t border-gray-50 px-5 py-4 overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="text-left">
                                  <th className="pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide pr-4 w-8">#</th>
                                  <th className="pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide pr-4">Question</th>
                                  {Array.from({ length: maxRun }, (_, i) => (
                                    <th key={i} className="pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide text-center px-3 whitespace-nowrap">
                                      {i === 0 ? "1st Attempt" : i === 1 ? "2nd Attempt" : `${i + 1}th Attempt`}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {emp.questionRows.map((row, qi) => (
                                  <tr key={row.questionId} className="group">
                                    <td className="py-2.5 pr-4 text-[11px] text-gray-400 font-bold align-top">{qi + 1}</td>
                                    <td className="py-2.5 pr-4 text-[12px] text-gray-700 leading-snug align-top max-w-xs">{row.questionText}</td>
                                    {Array.from({ length: maxRun }, (_, i) => {
                                      const attempt = row.attempts.find((a) => a.attemptNumber === i + 1);
                                      if (!attempt) return (
                                        <td key={i} className="py-2.5 px-3 text-center align-top">
                                          <span className="text-gray-200 text-[11px]">—</span>
                                        </td>
                                      );
                                      return (
                                        <td key={i} className="py-2.5 px-3 text-center align-top">
                                          <div className="flex flex-col items-center gap-1">
                                            <span className={`material-symbols-outlined text-lg ms-fill ${attempt.isCorrect ? "text-emerald-500" : "text-red-400"}`}>
                                              {attempt.isCorrect ? "check_circle" : "cancel"}
                                            </span>
                                            <span className="text-[9px] text-gray-400 leading-tight max-w-[90px] line-clamp-2">{attempt.choiceText}</span>
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
