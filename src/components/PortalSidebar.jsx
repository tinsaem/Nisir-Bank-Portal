"use client";

import Link from "next/link";

const LINKS = [
  { href: "/employee_dashboard",       icon: "dashboard",  label: "Dashboard" },
  { href: "/foundational_learning",    icon: "gavel",      label: "Policy Modules" },
  { href: "/challenge",               icon: "assignment", label: "Assessments" },
  { href: "/collaborative_work_space", icon: "diversity_3",label: "Community" },
  { href: "/internal_email",           icon: "mail",       label: "Internal Mail" },
];

export default function PortalSidebar({ active }) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-[rgba(195,198,209,0.4)] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 gap-1">
      <div className="mb-4 px-2">
        <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Hanken Grotesk',sans-serif" }}>
          Employee Portal
        </p>
        <p className="text-[11px] text-gray-500">ISP Compliance Training</p>
      </div>

      {LINKS.map((l) => (
        <Link
          key={l.label}
          href={l.href}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
            l.href === active
              ? "bg-[#d5e3ff] text-[#001e40] font-bold"
              : "text-[#43474f] hover:bg-[#eeedf2] hover:text-[#001e40]"
          }`}
        >
          <span className="material-symbols-outlined text-xl">{l.icon}</span>
          {l.label}
        </Link>
      ))}

      <div className="mt-auto pt-4">
        <button
          type="button"
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
        >
          + New Training
        </button>
      </div>
    </aside>
  );
}
