"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/employee_dashboard",      icon: "home",       label: "Dashboard"  },
  { href: "/internal_email",          icon: "mail",       label: "Inbox"      },
  { href: "/foundational_learning",   icon: "school",     label: "Learning"   },
  { href: "/role_based",              icon: "psychology", label: "Training"   },
  { href: "/collaborative_work_space", icon: "forum",      label: "Community"  },
  { href: "/leaderboard",             icon: "leaderboard", label: "Rankings"   },
];

export default function EmployeeNav() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [unread,     setUnread]     = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/internal-email")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUnread(d.emails.filter((e) => !e.isRead && !e.isArchived).length);
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try { await fetch("/api/logout", { method: "POST" }); } catch { /* best-effort */ }
    sessionStorage.removeItem("currentUser");
    router.replace("/");
  }

  return (
    <nav
      style={{ background: "#001229", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      className="sticky top-0 z-40 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center h-12 gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 15, fontVariationSettings: "'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24" }}
            >
              account_balance
            </span>
          </div>
          <span className="text-white text-[11px] font-extrabold tracking-widest hidden sm:block">
            NISIR BANK
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10 shrink-0 hidden sm:block" />

        {/* Nav links */}
        <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-blue-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 15, fontVariationSettings: active ? "'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24" : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24" }}
                >
                  {item.icon}
                </span>
                <span className="hidden sm:block">{item.label}</span>

                {item.href === "/internal_email" && unread > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none"
                    style={{ background: "#ef4444" }}
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1 text-blue-300 hover:text-white text-[11px] font-semibold transition-colors shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>logout</span>
          <span className="hidden sm:block">{loggingOut ? "…" : "Sign out"}</span>
        </button>

      </div>
    </nav>
  );
}
