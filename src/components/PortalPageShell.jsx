"use client";

import Link from "next/link";

export default function PortalPageShell({ eyebrow, title, children, backHref = "/internal_email", backLabel = "Back to Inbox" }) {
  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <img src="/images/nisir_bank_logo.svg" alt="Nisir Bank S.C." className="h-10 w-auto" />
          <div>
            <p className="text-[11px] font-bold text-gray-700 leading-tight">Nisir Bank S.C.</p>
            <p className="text-[10px] text-gray-400 leading-tight">Employee Portal</p>
          </div>
        </div>

        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline mb-5"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          {backLabel}
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          {eyebrow && (
            <p className="text-blue-700 text-[10.5px] font-bold uppercase tracking-widest mb-1">{eyebrow}</p>
          )}
          {title && <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">{title}</h1>}
          {children}
        </div>
      </div>
    </main>
  );
}
