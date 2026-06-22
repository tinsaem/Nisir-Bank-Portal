"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [account, setAccount] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is unavailable during SSR, so this can only be read post-mount
      setAccount(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!account || account.role === "ADMIN") return;

    let cancelled = false;

    fetch("/api/internal-email")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        const unread = data.emails.filter((email) => !email.isRead && !email.isArchived).length;
        setUnreadCount(unread);
      });

    return () => {
      cancelled = true;
    };
  }, [account, pathname]);

  if (!account) {
    if (pathname === "/") return null;

    return (
      <header className="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/images/nisir_bank_logo.svg"
              alt="Nisir Bank S.C."
              className="h-20 w-auto"
            />
          </Link>
        </div>
      </header>
    );
  }

  const user = {
    name: account.fullName,
    id: account.employeeId,
    role: account.role === "ADMIN" ? "Administrator" : "Employee",
    tokens: 2450,
  };

  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function isActive(href) {
    return pathname === href;
  }

  async function handleLogout() {
    setProfileMenuOpen(false);
    setAccount(null);
    sessionStorage.removeItem("currentUser");
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // cookie may still be cleared client-side on next login; not worth blocking the redirect
    }
    router.push("/");
  }

  return (
    <header className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/employee_dashboard" className="flex items-center gap-2 shrink-0">
            <img
              src="/images/nisir_bank_logo.svg"
              alt="Nisir Bank S.C."
              className="h-20 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              className={`nav-link ${isActive("/employee_dashboard") ? "active" : ""}`}
              href="/employee_dashboard"
            >
              Dashboard
            </Link>

            <Link
              className={`nav-link ${isActive("/internal_email") ? "active" : ""}`}
              href="/internal_email"
            >
              Inbox ({unreadCount})
            </Link>

            <Link
              className={`nav-link ${isActive("/foundational_learning") ? "active" : ""}`}
              href="/foundational_learning"
            >
              Course Library
            </Link>

            <Link
              className={`nav-link ${isActive("/challenge") ? "active" : ""}`}
              href="/challenge"
            >
              Assessments
            </Link>

            <Link
              className={`nav-link ${isActive("/collaborative_work_space") ? "active" : ""}`}
              href="/collaborative_work_space"
            >
              Community
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="token-badge hidden sm:inline-flex">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontSize: "14px" }}
            >
              toll
            </span>
            <span>{user.tokens.toLocaleString()} ISP</span>
          </div>

          <button
            type="button"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((value) => !value)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center text-white text-xs font-bold border-2 border-blue-200">
                {initials}
              </div>

              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {user.name}
                </p>
                <p className="text-[11.5px] text-gray-500 leading-tight">
                  {user.role}
                </p>
              </div>

              <span className="material-symbols-outlined text-gray-400 text-base">
                expand_more
              </span>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl py-1.5 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{user.name}</p>
                  <p className="text-[11.5px] text-gray-500">{user.id}</p>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    manage_accounts
                  </span>
                  Edit Profile
                </Link>

                <div className="my-1 border-t border-gray-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    logout
                  </span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}