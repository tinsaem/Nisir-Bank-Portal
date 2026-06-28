"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { value: "policy",    label: "Policy",    icon: "policy",      color: "text-blue-700",    bg: "bg-blue-50" },
  { value: "training",  label: "Training",  icon: "school",      color: "text-emerald-700", bg: "bg-emerald-50" },
  { value: "guide",     label: "Guide",     icon: "menu_book",   color: "text-indigo-700",  bg: "bg-indigo-50" },
  { value: "form",      label: "Form",      icon: "description", color: "text-orange-600",  bg: "bg-orange-50" },
  { value: "directive", label: "Directive", icon: "gavel",       color: "text-violet-700",  bg: "bg-violet-50" },
  { value: "general",   label: "General",   icon: "folder",      color: "text-gray-600",    bg: "bg-gray-50" },
];

function getCategoryMeta(cat) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[CATEGORIES.length - 1];
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "policy" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) { router.replace("/"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "ADMIN") { router.replace("/employee_dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(parsed);
  }, [router]);

  useEffect(() => {
    if (!account) return;
    fetchDocuments();
  }, [account]);

  function fetchDocuments() {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((data) => setDocuments(data.success ? data.documents : []))
      .catch(() => setDocuments([]));
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError("");

    if (!file) { setUploadError("Please select a file."); return; }
    if (!form.title.trim()) { setUploadError("Title is required."); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("category", form.category);

    try {
      const res = await fetch("/api/admin/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUploadError(data.message || "Upload failed.");
        setUploading(false);
        return;
      }
      setForm({ title: "", description: "", category: "policy" });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setUploadOpen(false);
      fetchDocuments();
    } catch {
      setUploadError("Could not reach the server.");
    }
    setUploading(false);
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    setDeletingId(doc.id);
    await fetch(`/api/admin/documents/${doc.id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchDocuments();
  }

  if (!account || !documents) {
    return <main className="min-h-screen bg-[#f0f4fb]" />;
  }

  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f]">
      <style jsx global>{`
        .hg { font-family: "Hanken Grotesk", sans-serif; }
        .hero-banner {
          background: linear-gradient(135deg,#001e40 0%,#003366 45%,#1f477b 100%);
          position:relative; overflow:hidden;
        }
        .hero-orb { position:absolute;border-radius:999px;filter:blur(60px);opacity:0.15;pointer-events:none; }
        .section-card {
          background:#fff;border-radius:24px;
          border:1px solid rgba(195,198,209,0.4);
          box-shadow:0 2px 10px rgba(0,30,64,0.05);
        }
        .material-symbols-outlined { font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24;vertical-align:middle; }
      `}</style>

      {/* Hero */}
      <section className="hero-banner px-4 sm:px-6 py-10">
        <div className="hero-orb w-80 h-80 bg-blue-400" style={{ top: "-60px", right: "-40px" }} />
        <div className="hero-orb w-56 h-56 bg-indigo-300" style={{ bottom: "-40px", left: "10%" }} />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
              SETA Program Administration
            </p>
            <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight">
              Document Library
            </h1>
            <p className="text-blue-200 text-sm mt-2">
              Upload and manage policies, training materials, guides, and forms for employees.
            </p>
            <Link
              href="/admin_dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white mt-3"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Admin Dashboard
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="hg text-3xl font-bold text-white">{documents.length}</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">Total Documents</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
              <p className="hg text-3xl font-bold text-white">{documents.filter((d) => d.isActive).length}</p>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">Active</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Upload section */}
        <div className="section-card p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="hg text-lg font-bold text-gray-900">Upload Document</h2>
              <p className="text-gray-400 text-xs mt-0.5">PDF, DOCX, XLSX, and other formats are supported.</p>
            </div>
            <button
              type="button"
              onClick={() => { setUploadOpen((v) => !v); setUploadError(""); }}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-base">{uploadOpen ? "close" : "upload_file"}</span>
              {uploadOpen ? "Cancel" : "Upload New Document"}
            </button>
          </div>

          {uploadOpen && (
            <form onSubmit={handleUpload} className="border-t border-gray-100 pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Nisir Bank Information Security Policy v4"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Description (optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description for employees"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">File *</label>
                <input
                  ref={fileRef}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                  <p className="text-xs text-gray-400 mt-1">{file.name} — {formatBytes(file.size)}</p>
                )}
              </div>

              {uploadError && (
                <p className="text-sm text-rose-600 font-semibold">{uploadError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setUploadOpen(false); setUploadError(""); }}
                  className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                      Uploading…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">cloud_upload</span>
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Category filter pills */}
        <div className="section-card p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="hg text-lg font-bold text-gray-900">
              All Documents
              <span className="ml-2 text-sm font-normal text-gray-400">({documents.length})</span>
            </h2>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-300 text-4xl">folder_open</span>
              </div>
              <p className="hg text-base font-bold text-gray-400">No documents uploaded yet</p>
              <p className="text-sm text-gray-300 mt-1">Use the upload button above to add your first document.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const meta = getCategoryMeta(doc.category);
                const isDeleting = deletingId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className="relative border border-[rgba(195,198,209,0.4)] rounded-2xl p-4 bg-[#fafbfd] flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined ${meta.color} text-2xl`}>{meta.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{doc.title}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>

                    {doc.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">{doc.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">insert_drive_file</span>
                        {doc.fileName}
                      </span>
                      <span className="shrink-0">{formatBytes(doc.fileSize)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">{formatDate(doc.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/documents/${doc.storedName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                          Preview
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          {isDeleting ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category summary */}
        {documents.length > 0 && (
          <div className="section-card p-6">
            <h2 className="hg text-sm font-bold text-gray-900 mb-4">By Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORIES.map((cat) => {
                const count = documents.filter((d) => d.category === cat.value).length;
                return (
                  <div key={cat.value} className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl ${cat.bg}`}>
                    <span className={`material-symbols-outlined ${cat.color} text-2xl`}>{cat.icon}</span>
                    <p className={`hg text-xl font-bold ${cat.color}`}>{count}</p>
                    <p className="text-[11px] text-gray-500 font-semibold text-center">{cat.label}</p>
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
