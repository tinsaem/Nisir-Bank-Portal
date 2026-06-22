"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ACTION_TYPES = ["info", "link", "reply", "credential", "approve", "attachment"];

const EMPTY_FORM = {
  senderName: "",
  senderEmail: "",
  subject: "",
  preview: "",
  body: "",
  tag: "internal",
  actionType: "info",
  actionLabel: "",
  href: "",
  approveLabel: "",
  declineLabel: "",
  attachmentName: "",
  attachmentSize: "",
  isPhishing: false,
};

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [results, setResults] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) {
      router.replace("/");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "ADMIN") {
      router.replace("/employee_dashboard");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is unavailable during SSR, so this can only be read post-mount
    setAccount(parsed);
  }, [router]);

  function refetchAll() {
    fetch("/api/admin/internal-email")
      .then((res) => res.json())
      .then((data) => data.success && setTemplates(data.templates));

    fetch("/api/admin/results")
      .then((res) => res.json())
      .then((data) => data.success && setResults(data.results));
  }

  useEffect(() => {
    if (!account) return;
    refetchAll();
  }, [account]);

  if (!account || !templates || !results) {
    return <main className="min-h-screen bg-[#f0f4fb]" />;
  }

  const totalPhishing = templates.filter((t) => t.isPhishing).length;
  const compromisedCount = results.filter((r) => r.phishing008 || r.phishing014 || r.phishing019).length;

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(template) {
    setEditingId(template.id);
    setForm({
      senderName: template.senderName,
      senderEmail: template.senderEmail,
      subject: template.subject,
      preview: template.preview,
      body: template.body,
      tag: template.tag,
      actionType: template.actionType,
      actionLabel: template.actionLabel || "",
      href: template.href || "",
      approveLabel: template.approveLabel || "",
      declineLabel: template.declineLabel || "",
      attachmentName: template.attachmentName || "",
      attachmentSize: template.attachmentSize || "",
      isPhishing: template.isPhishing,
    });
    setFormError("");
    setFormOpen(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    setFormError("");

    if (!form.senderName.trim() || !form.senderEmail.trim() || !form.subject.trim() || !form.body.trim()) {
      setFormError("Sender name, sender email, subject, and body are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/internal-email/${editingId}` : "/api/admin/internal-email",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to save email.");
        setSaving(false);
        return;
      }
      setFormOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      refetchAll();
    } catch {
      setFormError("Could not reach the server.");
    }
    setSaving(false);
  }

  async function deleteTemplate(id) {
    if (!window.confirm("Delete this email for everyone? This cannot be undone.")) return;
    await fetch(`/api/admin/internal-email/${id}`, { method: "DELETE" });
    refetchAll();
  }

  async function resetExperiment() {
    if (
      !window.confirm(
        "Reset the experiment? This wipes every employee's read/reply/click progress on all emails."
      )
    )
      return;

    const res = await fetch("/api/admin/reset", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setResetMessage(`Reset complete — cleared ${data.deletedCount} delivery records.`);
      refetchAll();
    }
  }

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
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
          vertical-align: middle;
        }
      `}</style>

      <section className="hero-banner px-4 sm:px-6 py-10">
        <div className="hero-orb w-80 h-80 bg-blue-400" style={{ top: "-60px", right: "-40px" }} />
        <div className="hero-orb w-56 h-56 bg-indigo-300" style={{ bottom: "-40px", left: "10%" }} />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white/95 shadow shrink-0">
                <img src="/images/nisir_bank_logo.svg" alt="Nisir Bank S.C." className="h-8 w-8 object-contain" />
              </div>
              <span className="text-white/70 text-xs font-semibold">Nisir Bank S.C.</span>
            </div>
            <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
              SETA Program Administration
            </p>
            <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight">
              Experiment Control Center
            </h1>
            <p className="text-blue-200 text-sm mt-2">
              Manage the internal-mail awareness simulation and review employee results.
            </p>
            <Link
              href="/admin/research"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white mt-3"
            >
              <span className="material-symbols-outlined text-base">analytics</span>
              Open Research Dashboard
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <HeroStat value={results.length} label="Employees Enrolled" />
            <HeroStat value={templates.length} label="Total Emails" />
            <HeroStat value={totalPhishing} label="Phishing Emails" yellow />
            <HeroStat value={compromisedCount} label="Employees Compromised" yellow />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="section-card p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="hg text-lg font-bold text-gray-900">Reset Experiment</h2>
            <p className="text-gray-500 text-xs mt-1">
              Clears every employee&apos;s read/reply/click progress. Email templates are kept — each
              employee&apos;s inbox repopulates fresh next time they open it.
            </p>
          </div>
          <button
            type="button"
            onClick={resetExperiment}
            className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reset Experiment
          </button>
          {resetMessage && <p className="text-xs text-emerald-600 font-semibold w-full">{resetMessage}</p>}
        </div>

        <div className="section-card p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="hg text-lg font-bold text-gray-900">Manage Emails</h2>
            <button
              type="button"
              onClick={openAddForm}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Email
            </button>
          </div>

          {formOpen && (
            <TemplateForm
              form={form}
              setForm={setForm}
              error={formError}
              saving={saving}
              isEditing={Boolean(editingId)}
              onSubmit={submitForm}
              onCancel={() => setFormOpen(false)}
            />
          )}

          <div className="overflow-x-auto mt-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3">Sender</th>
                  <th className="py-2 pr-3">Subject</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Classification</th>
                  <th className="py-2 pr-3">Context</th>
                  <th className="py-2 pr-3">Sent</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="py-2.5 pr-3 font-semibold text-gray-800 whitespace-nowrap">{t.senderName}</td>
                    <td className="py-2.5 pr-3 text-gray-600 max-w-[280px] truncate">{t.subject}</td>
                    <td className="py-2.5 pr-3 text-gray-500 uppercase text-xs">{t.actionType}</td>
                    <td className="py-2.5 pr-3">
                      {t.isPhishing ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                          Phishing
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          Authentic Email
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <ContextBadge level={t.phishingLevel} />
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500 whitespace-nowrap">{formatDate(t.sentAt)}</td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditForm(t)}
                        className="text-blue-700 font-bold text-xs hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(t.id)}
                        className="text-rose-600 font-bold text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {templates.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No emails yet. Add one to begin.</p>
            )}
          </div>
        </div>

        <div className="section-card p-6">
          <h2 className="hg text-lg font-bold text-gray-900 mb-1">Employee Results</h2>
          <p className="text-gray-500 text-xs mb-5">
            How each employee is engaging with the inbox, and whether they acted on a simulated
            phishing email.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Read</th>
                  <th className="py-2 pr-3">
                    Phishing 1
                    <span className="block normal-case text-[10px] font-normal text-gray-400">#8 · High</span>
                  </th>
                  <th className="py-2 pr-3">
                    Phishing 2
                    <span className="block normal-case text-[10px] font-normal text-gray-400">#14 · Medium</span>
                  </th>
                  <th className="py-2 pr-3">
                    Phishing 3
                    <span className="block normal-case text-[10px] font-normal text-gray-400">#19 · Low</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...results]
                  .sort((a, b) => a.employeeId.localeCompare(b.employeeId))
                  .map((r) => (
                    <tr key={r.employeeId} className="border-b border-gray-50">
                      <td className="py-2.5 pr-3 font-semibold text-gray-800">{r.fullName}</td>
                      <td className="py-2.5 pr-3 text-gray-500">{r.employeeId}</td>
                      <td className="py-2.5 pr-3 text-gray-600">
                        {r.readCount} / {r.totalEmails}
                      </td>
                      <td className="py-2.5 pr-3">
                        <PhishingCell value={r.phishing008} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <PhishingCell value={r.phishing014} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <PhishingCell value={r.phishing019} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No employees have logged in yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ value, label, yellow = false }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
      <p className={`text-3xl font-bold hg ${yellow ? "text-yellow-300" : "text-white"}`}>{value}</p>
      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function PhishingCell({ value }) {
  if (value === 1) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
        1
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-bold">
      0
    </span>
  );
}

function ContextBadge({ level }) {
  if (!level) return <span className="text-gray-300 text-xs">—</span>;

  const palette = {
    high:   "bg-rose-50 text-rose-600",
    medium: "bg-amber-50 text-amber-600",
    low:    "bg-sky-50 text-sky-600",
  }[level.toLowerCase()] || "bg-gray-100 text-gray-500";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${palette}`}>
      {level}
    </span>
  );
}

function TemplateForm({ form, setForm, error, saving, isEditing, onSubmit, onCancel }) {
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Sender Name">
          <input
            value={form.senderName}
            onChange={(e) => update("senderName", e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Sender Email">
          <input
            value={form.senderEmail}
            onChange={(e) => update("senderEmail", e.target.value)}
            className="form-input"
          />
        </Field>
      </div>

      <Field label="Subject">
        <input value={form.subject} onChange={(e) => update("subject", e.target.value)} className="form-input" />
      </Field>

      <Field label="Preview (shown in the inbox list)">
        <input value={form.preview} onChange={(e) => update("preview", e.target.value)} className="form-input" />
      </Field>

      <Field label="Body">
        <textarea
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
          rows={5}
          className="form-input"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Tag">
          <input value={form.tag} onChange={(e) => update("tag", e.target.value)} className="form-input" />
        </Field>

        <Field label="Action Type">
          <select
            value={form.actionType}
            onChange={(e) => update("actionType", e.target.value)}
            className="form-input"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Action Label (link / credential)">
          <input
            value={form.actionLabel}
            onChange={(e) => update("actionLabel", e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Link href (link type only)">
          <input value={form.href} onChange={(e) => update("href", e.target.value)} className="form-input" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Approve Label (approve type)">
          <input
            value={form.approveLabel}
            onChange={(e) => update("approveLabel", e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Decline Label (approve type)">
          <input
            value={form.declineLabel}
            onChange={(e) => update("declineLabel", e.target.value)}
            className="form-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Attachment Name (attachment type)">
          <input
            value={form.attachmentName}
            onChange={(e) => update("attachmentName", e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Attachment Size (attachment type)">
          <input
            value={form.attachmentSize}
            onChange={(e) => update("attachmentSize", e.target.value)}
            className="form-input"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
        <input
          type="checkbox"
          checked={form.isPhishing}
          onChange={(e) => update("isPhishing", e.target.checked)}
          className="h-4 w-4"
        />
        Mark as a simulated phishing email (tracked in employee results, never shown to employees)
      </label>

      {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Email"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-sm font-bold px-4 py-2.5"
        >
          Cancel
        </button>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 9px 12px;
          font-size: 13.5px;
          background: white;
        }
        .form-input:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}
