"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EmployeeNav from "@/components/EmployeeNav";
import { loadCurrentUser } from "@/lib/currentUser";

const MOCK_STATS = {
  branch: "Addis Ababa",
  complianceScore: 0,
  completedModules: 0,
  totalModules: 12,
  tokens: 0,
};

const OTHER_LEADERBOARD_ENTRIES = [
  { id: "E-20187", name: "Sara Alemu", tokens: 0 },
  { id: "E-30412", name: "Nahom Bekele", tokens: 0 },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);

  useEffect(() => {
    loadCurrentUser().then((parsed) => {
      if (!parsed) {
        router.replace("/");
        return;
      }
      setAccount(parsed);
    });
  }, [router]);

  useEffect(() => {
    if (!account) return;

    let cancelled = false;

    fetch("/api/internal-email")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        const unread = data.emails.filter((email) => !email.isRead && !email.isArchived).length;
        setUnreadEmailCount(unread);
      });

    return () => {
      cancelled = true;
    };
  }, [account]);

  if (!account) {
    return <main className="min-h-screen bg-[#f0f4fb]" />;
  }

  const user = {
    name: account.fullName,
    id: account.employeeId,
    ...MOCK_STATS,
  };

  const completedModules = Number(user.completedModules);
  const totalModules = Number(user.totalModules);
  const complianceScore = Number(user.complianceScore);
  const tokens = Number(user.tokens);

  const modulePercent = Math.round((completedModules / totalModules) * 100);
  const certPercent = Math.min(Math.round((tokens / 5000) * 100), 100);
  const ringOffset = 138.2 * (1 - complianceScore / 100);

  const leaderboard = [
    ...OTHER_LEADERBOARD_ENTRIES,
    { id: user.id, name: user.name, tokens: user.tokens },
  ];
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.tokens - a.tokens);
  const currentUserRank = 0;

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

        .section-card,
        .stat-card {
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(195, 198, 209, 0.4);
          box-shadow: 0 2px 12px rgba(0, 30, 64, 0.06);
          transition: transform 0.2s, box-shadow 0.25s;
        }

        .section-card {
          display: flex;
          flex-direction: column;
        }

        .section-card:hover,
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0, 30, 64, 0.13);
        }

        .card-dark {
          background: linear-gradient(135deg, #003366 0%, #1f477b 100%);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 51, 102, 0.35);
        }

        .progress-track {
          background: #e8e8ed;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          background: linear-gradient(90deg, #3a5f94, #a7c8ff);
          border-radius: 999px;
        }

        .token-badge {
          background: linear-gradient(135deg, #ffd700, #daa520);
          color: #3d2800;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
          padding: 3px 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .challenge-row {
          background: #f4f3f8;
          border: 1px solid rgba(195, 198, 209, 0.5);
          border-radius: 12px;
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
              Welcome back
            </p>

            <h1 className="hg text-white text-3xl sm:text-4xl font-bold leading-tight">
              Good {getGreeting()}, {user.name} 👋
            </h1>

            <p className="text-blue-200 text-sm mt-2">
              Complete your first module to start building your security streak.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a7c8ff" />
                    <stop offset="100%" stopColor="#3a5f94" />
                  </linearGradient>
                </defs>

                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="5"
                />

                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="138.2"
                  strokeDashoffset={ringOffset.toFixed(1)}
                  transform="rotate(-90 28 28)"
                />

                <text
                  x="28"
                  y="33"
                  textAnchor="middle"
                  fill="white"
                  fontSize="13"
                  fontWeight="700"
                >
                  {complianceScore}%
                </text>
              </svg>

              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
                  Compliance
                </p>
                <p className="text-white text-lg font-bold leading-tight">Score</p>
              </div>
            </div>

            <HeroStat
              value={
                <>
                  {completedModules}
                  <span className="text-blue-300 text-lg">/{totalModules}</span>
                </>
              }
              label="Modules Done"
            />

            <HeroStat
              value={tokens.toLocaleString()}
              label="ISP Tokens"
              yellow
            />

            <HeroStat value={`#${currentUserRank}`} label="Global Rank" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {unreadEmailCount > 0 && <EmailAlertBanner count={unreadEmailCount} />}

        <div className="section-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg,#003366,#3a5f94)" }}
            >
              {getInitials(user.name)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="hg text-2xl font-bold text-gray-900">{user.name}</h2>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Branch {user.branch}
                </span>
              </div>

              <p className="text-gray-500 text-sm mb-3">Employee ID: {user.id}</p>

              <div className="flex flex-wrap gap-4">
                <SmallInfo icon="school" text={`${completedModules} / ${totalModules} modules`} />
                <SmallInfo icon="toll" text={`${tokens.toLocaleString()} ISP Tokens`} />
                <SmallInfo icon="verified_user" text={`${complianceScore}% Compliance`} />
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-48">
              <Progress label="Overall Compliance" value={complianceScore} />
              <div className="mt-3">
                <Progress label="Modules" value={modulePercent} orange />
              </div>
            </div>
          </div>
        </div>

        <DashboardSection
          title="Training & Development"
          icon="school"
          actionText="View Catalog"
          actionHref="/foundational_learning"
        >
          <TrainingCard
            icon="psychology"
            title="Foundational Learning"
            description="Personalized, self-paced adaptive learning driven by AI insights."
            bullets={["Dynamic lesson paths", "Knowledge gap analysis"]}
            progress={modulePercent}
            href="/foundational_learning"
            buttonText="Start Session"
          />

          <DarkTrainingCard />

          <TrainingCard
            icon="forum"
            title="Collaborative Learning"
            description="Collaborative forums and community-driven security tips."
            bullets={["Employee discussions", "Shared experiences"]}
            progress={0}
            href="/collaborative_work_space"
            buttonText="Open Communities"
            orange
          />
        </DashboardSection>

        <DashboardSection
          title="Play to Certify & Earn"
          subtitle="Win tokens for correct answers; lose tokens for security slips."
          icon="sports_esports"
          actionText="Detailed Reports"
          actionHref="/reports"
          purple
        >
          <CertificationCard certPercent={certPercent} tokens={tokens} />
          <LeaderboardCard leaderboard={sortedLeaderboard} currentUserId={user.id} userName={user.name} />
          <ChallengeCard />
        </DashboardSection>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 card-dark p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 100 }}>
                shield
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-2">
                Recommended Next
              </p>

              <h3 className="hg text-white text-xl font-bold">
                Phishing Awareness Basics
              </h3>

              <p className="text-blue-200 text-xs mt-1">
                Start here to build your phishing detection skills and earn your first ISP tokens.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-5">
              <div className="flex items-center gap-4 text-xs text-blue-200">
                <span>15 mins</span>
                <span>+200 ISP</span>
              </div>

              <Link
                href="/foundational_learning"
                className="bg-white text-blue-900 text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-50"
              >
                Start →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard icon="local_fire_department" value="0" label="Day Streak" />
            <StatCard icon="emoji_events" value="0" label="Badges Earned" />
            <StatCard icon="quiz" value="—" label="Quiz Accuracy" />
            <StatCard icon="timer" value="0h" label="Time This Week" />
          </div>
        </section>
      </section>
    </main>
  );
}

function EmailAlertBanner({ count }) {
  return (
    <Link
      href="/internal_email"
      className="section-card p-5 flex items-center gap-4 hover:border-blue-300 transition-colors"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined filled text-2xl text-amber-500">
          mail
        </span>
      </div>

      <div className="flex-1">
        <p className="font-bold text-gray-900 text-sm">
          You have {count} internal {count === 1 ? "email" : "emails"}
        </p>
        <p className="text-gray-500 text-xs mt-0.5">
          New messages from HR, IT Security, and Compliance are waiting in your inbox.
        </p>
      </div>

      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 shrink-0">
        View Inbox
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </span>
    </Link>
  );
}

function HeroStat({ value, label, yellow = false }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center">
      <p className={`text-3xl font-bold hg ${yellow ? "text-yellow-300" : "text-white"}`}>
        {value}
      </p>
      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mt-1">
        {label}
      </p>
    </div>
  );
}

function SmallInfo({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-blue-600 text-base">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{text}</span>
    </div>
  );
}

function Progress({ label, value, orange = false }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>{label}</span>
        <span className="font-bold text-blue-700">{value}%</span>
      </div>

      <div className="progress-track h-3">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: orange
              ? "linear-gradient(90deg,#f97316,#fbbf24)"
              : "linear-gradient(90deg,#3a5f94,#a7c8ff)",
          }}
        />
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  subtitle,
  icon,
  actionText,
  actionHref,
  children,
  purple = false,
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              purple ? "bg-purple-100" : "bg-blue-100"
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                purple ? "text-purple-700" : "text-blue-700"
              }`}
            >
              {icon}
            </span>
          </div>

          <div>
            <h2 className="hg text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
          </div>
        </div>

        <Link
          href={actionHref}
          className="text-xs font-bold text-blue-700 hover:underline"
        >
          {actionText} →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{children}</div>
    </section>
  );
}

function TrainingCard({
  icon,
  title,
  description,
  bullets,
  progress,
  href,
  buttonText,
  orange = false,
}) {
  return (
    <div className="section-card p-6">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          orange ? "bg-orange-50" : "bg-blue-50"
        }`}
      >
        <span
          className={`material-symbols-outlined text-2xl ${
            orange ? "text-orange-600" : "text-blue-700"
          }`}
        >
          {icon}
        </span>
      </div>

      <h3 className="hg text-lg font-bold text-gray-900 mb-1">{title}</h3>

      <p className="text-gray-500 text-xs mb-5 leading-relaxed">{description}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-2 text-xs text-gray-700">
            <span
              className={`material-symbols-outlined text-base ${
                orange ? "text-orange-500" : "text-blue-600"
              }`}
            >
              check_circle
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <Progress label="Progress" value={progress} orange={orange} />

      <Link
        href={href}
        className={`mt-5 w-full py-2.5 text-sm font-bold rounded-xl text-center block ${
          orange
            ? "bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-700"
            : "bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-700"
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}

function DarkTrainingCard() {
  return (
    <div className="card-dark p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-[0.07] pointer-events-none">
        <span className="material-symbols-outlined" style={{ fontSize: 120 }}>
          verified_user
        </span>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-blue-200 text-2xl">
            verified_user
          </span>
        </div>

        <div className="inline-flex bg-yellow-400/20 border border-yellow-400/30 rounded-full px-3 py-1 mb-3 w-fit">
          <span className="text-yellow-300 text-[11px] font-bold uppercase">
            Featured
          </span>
        </div>

        <h3 className="hg text-lg font-bold text-white mb-1">
          Role-Specific Training
        </h3>

        <p className="text-blue-200 text-xs mb-5 leading-relaxed flex-1">
          Banking scenarios and mission-based compliance tasks tailored to your role.
        </p>

        <ul className="space-y-2 mb-6">
          <li className="text-xs text-blue-100">✓ Role-specific threats</li>
          <li className="text-xs text-blue-100">✓ Daily workflow simulations</li>
        </ul>

        <Link
          href="/role_based"
          className="w-full py-2.5 bg-white text-blue-900 text-sm font-bold rounded-xl hover:bg-blue-50 text-center"
        >
          Resume Mission
        </Link>
      </div>
    </div>
  );
}

function CertificationCard({ certPercent, tokens }) {
  return (
    <div className="section-card p-6">
      <h4 className="hg font-bold text-gray-900 text-base mb-1">
        Certification Progress
      </h4>

      <p className="text-gray-500 text-xs mb-5">
        Earn certificates, badges and points.
      </p>

      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center text-[10px] font-bold">
          ISP
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-800 border-2 border-white shadow flex items-center justify-center text-[10px] font-bold text-white">
          IT
        </div>
        <div className="w-9 h-9 rounded-full bg-orange-100 border-2 border-white shadow flex items-center justify-center">
          🔒
        </div>
      </div>

      <Progress label="Overall progress" value={certPercent} />

      <p className="text-[11px] text-gray-400 mt-2 mb-5">
        {tokens.toLocaleString()} / 5,000 Points
      </p>

      <Link
        href="/certificate"
        className="mt-auto w-full py-2.5 bg-gray-50 hover:bg-blue-700 hover:text-white text-blue-700 text-sm font-bold rounded-xl text-center block"
      >
        Get Certifications
      </Link>
    </div>
  );
}

function LeaderboardCard({ leaderboard, currentUserId, userName }) {
  const PRIZES = [
    { medal: "🥇", rank: "1st Place", bonus: "2× Token Multiplier", cls: "bg-yellow-50 border-yellow-200", textCls: "text-yellow-800" },
    { medal: "🥈", rank: "2nd Place", bonus: "1.5× Multiplier + 500 ISP", cls: "bg-slate-50 border-slate-200", textCls: "text-slate-700" },
    { medal: "🥉", rank: "3rd Place", bonus: "+300 Bonus ISP Tokens", cls: "bg-orange-50 border-orange-100", textCls: "text-orange-700" },
  ];

  return (
    <div className="section-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h4 className="hg font-bold text-gray-900 text-base">Global Rankings</h4>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>
      {/* Current Standings */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Standings</p>
      <div className="space-y-1.5 mb-3">
        {["🥇", "🥈", "🥉"].map((medal, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200">
            <span className="text-base w-5 text-center">{medal}</span>
            <div className="flex-1">
              <div className="h-1.5 w-20 bg-gray-200 rounded-full" />
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">Unclaimed</span>
          </div>
        ))}
      </div>

      {/* Your position */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 mb-4">
        <span className="text-[10px] font-bold text-blue-400 w-5 text-center">—</span>
        <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {getInitials(userName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-900 truncate">You</p>
          <p className="text-[10px] text-blue-500">Unranked — complete a module to enter</p>
        </div>
        <span className="text-xs font-bold text-blue-700 shrink-0">0 ISP</span>
      </div>

      <Link
        href="/leaderboard"
        className="mt-auto w-full py-2.5 bg-gray-50 hover:bg-blue-700 hover:text-white text-blue-700 text-sm font-bold rounded-xl text-center block transition-colors"
      >
        View Full Leaderboard
      </Link>
    </div>
  );
}

function ChallengeCard() {
  const challenges = [
    { icon: "alternate_email", title: "Phishing Awareness", reward: "+150 ISP", tag: "Daily" },
    { icon: "bolt",            title: "Rapid Fire Quiz",   reward: "+250 ISP", tag: "Hot" },
    { icon: "psychology",      title: "Social Engineering", reward: "+500 ISP", tag: "Advanced" },
  ];

  return (
    <div className="section-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h4 className="hg font-bold text-gray-900 text-base">Challenge Hub</h4>
        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
          5 Challenges
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-4">Complete challenges to earn ISP tokens and climb the rankings.</p>

      {/* Challenge list */}
      <div className="space-y-2 mb-4 flex-1">
        {challenges.map((c) => (
          <div key={c.title} className="challenge-row flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-blue-600 text-lg">{c.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{c.title}</p>
                <p className="text-[10px] text-gray-400">{c.tag}</p>
              </div>
            </div>
            <span className="token-badge">{c.reward}</span>
          </div>
        ))}
      </div>

      <Link
        href="/challenge"
        className="mt-auto w-full py-2.5 text-sm font-bold rounded-xl text-white text-center flex items-center justify-center gap-2 transition-all hover:brightness-110"
        style={{ background: "linear-gradient(135deg,#3a0ca3,#7209b7)" }}
      >
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
        Play Now →
      </Link>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card p-4 flex flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-blue-600 text-2xl mb-1">
        {icon}
      </span>

      <p className="hg text-2xl font-bold text-gray-900">{value}</p>

      <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}