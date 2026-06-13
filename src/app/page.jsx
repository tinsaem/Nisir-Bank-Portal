"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const LOGIN_INIT    = { employeeId: "", password: "", rememberMe: false };
const REGISTER_INIT = { fullName: "", employeeId: "", phone: "" };

const ANNOUNCEMENTS = [
  {
    id: 1,
    type: "event",
    label: "Grand Opening",
    icon: "celebration",
    color: "amber",
    date: "Sep 11, 2026",
    text: "Nisir Bank officially launches at Ethiopian New Year 2019. All staff are expected at the head office for the opening ceremony. Attendance is mandatory.",
  },
  {
    id: 2,
    type: "notice",
    label: "SETA Onboarding",
    icon: "school",
    color: "sky",
    date: "Now Live",
    text: "The SETA Onboarding Module is now available on this portal. All new employees must complete it within 30 days of joining. Progress is tracked and reported to HR.",
  },
  {
    id: 3,
    type: "alert",
    label: "Security Alert",
    icon: "gpp_bad",
    color: "rose",
    date: "Active",
    text: "A phishing simulation is active this month. Do not click suspicious links or share credentials via email. Report any suspicious messages to the Security Operations team.",
  },
  {
    id: 4,
    type: "notice",
    label: "ISP Compliance",
    icon: "policy",
    color: "violet",
    date: "Due: Q1 2019",
    text: "Information Security Policy (ISP) training is mandatory for all staff. Non-completion will be flagged in your compliance record and escalated to your department head.",
  },
];

const ANNOUNCE_PALETTE = {
  amber:  { badge: "border-amber-400/40 bg-amber-500/20 text-amber-300",   bar: "bg-amber-400",   dot: "bg-amber-300" },
  sky:    { badge: "border-sky-400/40 bg-sky-500/20 text-sky-300",         bar: "bg-sky-400",     dot: "bg-sky-300" },
  rose:   { badge: "border-rose-400/40 bg-rose-500/20 text-rose-300",      bar: "bg-rose-400",    dot: "bg-rose-300" },
  violet: { badge: "border-violet-400/40 bg-violet-500/20 text-violet-300", bar: "bg-violet-400", dot: "bg-violet-300" },
};

/* ─────────────────────────────────────────────────────────────────
   Root page — orchestrates state and API calls only
───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [tab, setTab]             = useState("login");
  const [login, setLogin]         = useState(LOGIN_INIT);
  const [reg, setReg]             = useState(REGISTER_INIT);
  const [showPwd, setShowPwd]     = useState(false);
  const [loginErr, setLoginErr]   = useState("");
  const [regMsg, setRegMsg]       = useState({ type: "", text: "" });
  const [loginLoad, setLoginLoad] = useState(false);
  const [regLoad, setRegLoad]     = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => {
        const s = Math.random() * 3 + 1.5;
        return {
          id: i,
          left: `${Math.random() * 100}%`,
          width: `${s}px`,
          height: `${s}px`,
          animationDuration: `${Math.random() * 14 + 10}s`,
          animationDelay: `${Math.random() * -22}s`,
          opacity: Math.random() * 0.5 + 0.2,
        };
      })
    );
  }, []);

  function switchTab(t) {
    setTab(t);
    setLoginErr("");
    setRegMsg({ type: "", text: "" });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginErr("");
    if (!login.employeeId.trim() || !login.password) {
      setLoginErr("Please enter both Employee ID and Password.");
      return;
    }
    setLoginLoad(true);
    try {
      const res  = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: login.employeeId,
          password: login.password,
          remember_me: login.rememberMe,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginErr(data.message || "Invalid Employee ID or Password.");
        setLoginLoad(false);
        return;
      }
      sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      window.location.href = data.redirectTo;
    } catch {
      setLoginErr("Could not reach the server. Please try again.");
      setLoginLoad(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegMsg({ type: "", text: "" });
    if (!reg.fullName.trim() || !reg.employeeId.trim() || !reg.phone.trim()) {
      setRegMsg({ type: "err", text: "Please complete all required fields." });
      return;
    }
    setRegLoad(true);
    try {
      const res  = await fetch("/api/request-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:   reg.fullName,
          employeeId: reg.employeeId,
          phone:      reg.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegMsg({ type: "err", text: data.message || "Request failed. Please try again." });
      } else {
        setRegMsg({ type: "ok", text: data.message });
        setReg(REGISTER_INIT);
      }
    } catch {
      setRegMsg({ type: "err", text: "Could not reach the server. Please try again." });
    }
    setRegLoad(false);
  }

  return (
    <>
      {/* ── animated background ── */}
      <div className="bg-scene" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <ParticleField particles={particles} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <HeroSection
          tab={tab}
          switchTab={switchTab}
          login={login}
          setLogin={setLogin}
          showPwd={showPwd}
          setShowPwd={setShowPwd}
          loginErr={loginErr}
          loginLoad={loginLoad}
          handleLogin={handleLogin}
          reg={reg}
          setReg={setReg}
          regMsg={regMsg}
          regLoad={regLoad}
          handleRegister={handleRegister}
        />

        <AboutSection />
        <VmoSection />
        <SetaSection />
        <PageFooter />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ParticleField
───────────────────────────────────────────────────────────────── */
function ParticleField({ particles }) {
  return (
    <div className="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="fade-left flex items-center gap-6 px-6 md:px-12 xl:px-14 pt-8 pb-4 shrink-0">
      {/* ── left: logo + bank identity + status pills ── */}
      <div className="flex items-center gap-4 shrink-0">
        <BankLogo />

        <div>
          <p className="text-sm font-bold text-white leading-tight">Nisir Bank S.C.</p>
          <p className="text-[11px] font-semibold text-white/60">Est. Ethiopian Year 2019</p>
        </div>

        <div className="mx-2 h-6 w-px bg-white/20 hidden sm:block" />

        <NavPill icon="check_circle" color="emerald" label="NBE Licensed" />
        <NavPill icon="celebration"  color="amber"   label="Launching E.Y. 2019" />
      </div>

      {/* ── right: announcement board, same column width as login card ── */}
      <div className="ml-auto shrink-0 hidden md:block w-[320px] xl:w-[360px]">
        <AnnouncementBoard />
      </div>
    </nav>
  );
}

function BankLogo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-xl font-black text-white backdrop-blur-sm shadow-lg">
      N
    </div>
  );
}

function NavPill({ icon, color, label }) {
  const colors = {
    emerald: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    amber:   "border-amber-400/30 bg-amber-500/15 text-amber-300",
  };
  return (
    <div className={`hidden sm:flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${colors[color]}`}>
      <span className={`material-symbols-outlined filled text-sm ${colors[color].split(" ")[2]}`}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/85">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Hero Section  (hero copy + login card side by side)
───────────────────────────────────────────────────────────────── */
function HeroSection(props) {
  return (
    <section className="flex flex-col lg:flex-row items-start gap-8 px-6 md:px-12 xl:px-14 pt-8 pb-12">
      <HeroCopy />
      <div className="card-in w-full lg:shrink-0 lg:w-[320px] xl:w-[360px]">
        <LoginCard {...props} />
      </div>
    </section>
  );
}

function HeroCopy() {
  const pills = [
    { icon: "verified",        label: "NBE Approved",         color: "text-emerald-300 border-emerald-400/40 bg-emerald-500/15" },
    { icon: "account_balance", label: "Commercial Bank S.C.", color: "text-sky-300 border-sky-400/40 bg-sky-500/15" },
    { icon: "calendar_month",  label: "Launch: E.Y. 2019",    color: "text-amber-300 border-amber-400/40 bg-amber-500/15" },
    { icon: "diversity_3",     label: "Inclusive Banking",    color: "text-violet-300 border-violet-400/40 bg-violet-500/15" },
  ];

  return (
    <div className="fade-left flex-1 pt-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 mb-6 backdrop-blur-sm">
        <span className="material-symbols-outlined filled text-sm text-sky-300">shield</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
          SETA Employee Training Portal
        </span>
      </div>

      <h1 className="hg text-hero text-5xl xl:text-6xl font-bold text-white mb-6">
        Nisir Bank S.C.
        <br />
        <span className="gradient-text">Opens Its Doors</span>
      </h1>

      <p className="body-copy max-w-2xl text-[1.05rem] mb-4">
        Nisir Bank Share Company has received its official operating licence from the{" "}
        <strong className="text-white font-semibold">National Bank of Ethiopia</strong> and is set
        to officially launch at the dawn of{" "}
        <strong className="text-white font-semibold">Ethiopian New Year 2019</strong> — a proud
        milestone marking a new era in Ethiopian banking.
      </p>

      <p className="body-copy-sm max-w-xl mb-8">
        Built on integrity, innovation, and inclusion, Nisir Bank is committed to delivering
        modern, accessible, and secure financial services to every Ethiopian.
      </p>

      <div className="flex flex-wrap gap-3">
        {pills.map(({ icon, label, color }) => (
          <HeroPill key={label} icon={icon} label={label} color={color} />
        ))}
      </div>
    </div>
  );
}

function HeroPill({ icon, label, color }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-sm ${color}`}>
      <span className="material-symbols-outlined filled text-base">{icon}</span>
      {label}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Announcement Board
───────────────────────────────────────────────────────────────── */
function AnnouncementBoard() {
  const [idx, setIdx]       = useState(0);
  const [fading, setFading] = useState(false);

  function goTo(i) {
    if (i === idx) return;
    setFading(true);
    setTimeout(() => { setIdx(i); setFading(false); }, 300);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ANNOUNCEMENTS.length);
        setFading(false);
      }, 300);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const a = ANNOUNCEMENTS[idx];
  const p = ANNOUNCE_PALETTE[a.color];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 backdrop-blur-md"
         style={{ background: "rgba(0, 15, 45, 0.72)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined filled text-base text-amber-300">campaign</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
            Notices &amp; Announcements
          </span>
        </div>

        {/* dot navigation */}
        <div className="flex items-center gap-1.5">
          {ANNOUNCEMENTS.map((an, i) => (
            <button
              key={an.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Announcement ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === idx
                  ? `h-2 w-5 ${p.dot}`
                  : "h-1.5 w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Content (fades on change) ── */}
      <div
        className="px-4 pb-4 pt-3 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {/* badge row */}
        <div className="mb-2.5 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${p.badge}`}>
            <span className="material-symbols-outlined filled text-sm">{a.icon}</span>
            {a.label}
          </span>
          <span className="text-[10px] font-semibold text-white/40">{a.date}</span>
        </div>

        {/* announcement text */}
        <p className="text-[12.5px] leading-relaxed text-white/80">{a.text}</p>
      </div>

      {/* ── coloured progress bar at bottom ── */}
      <div className={`h-[3px] w-full ${p.bar}`} style={{ opacity: 0.7 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Login Card
───────────────────────────────────────────────────────────────── */
function LoginCard({ tab, switchTab, login, setLogin, showPwd, setShowPwd, loginErr, loginLoad, handleLogin, reg, setReg, regMsg, regLoad, handleRegister }) {
  return (
    <div>
      <div className="card-shadow flex flex-col overflow-hidden rounded-3xl bg-white backdrop-blur-2xl">

        {/* Gradient header with tab switcher */}
        <CardHeader tab={tab} switchTab={switchTab} />

        {/* Form area — card-form restores dark text on white bg */}
        <div className="card-form px-5 pb-5 pt-4">
          {tab === "login" ? (
            <SignInForm
              login={login}
              setLogin={setLogin}
              showPwd={showPwd}
              setShowPwd={setShowPwd}
              loginErr={loginErr}
              loginLoad={loginLoad}
              handleLogin={handleLogin}
            />
          ) : (
            <RegisterForm
              reg={reg}
              setReg={setReg}
              regMsg={regMsg}
              regLoad={regLoad}
              handleRegister={handleRegister}
              switchTab={switchTab}
            />
          )}
        </div>

        <CardFooter />
      </div>
    </div>
  );
}

function CardHeader({ tab, switchTab }) {
  return (
    <div className="card-header relative overflow-hidden px-5 py-5">
      {/* decorative orbs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-4 top-4 h-16 w-16 rounded-full bg-white/5" />

      {/* Bank identity */}
      <div className="relative flex items-center gap-4 mb-5">
        <div className="logo-pulse flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-2xl font-black text-white shadow-lg backdrop-blur-sm">
          N
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/80">
            Nisir Bank S.C.
          </p>
          <p className="hg text-lg font-bold text-white leading-tight">Employee Portal</p>
          <p className="text-[11px] text-white/60 mt-0.5">SETA Training &amp; Compliance</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="relative flex gap-1 rounded-xl bg-white/10 p-1">
        <TabButton active={tab === "login"} icon="login" label="Sign In" onClick={() => switchTab("login")} />
        <TabButton active={tab === "register"} icon="person_add" label="New Employee" onClick={() => switchTab("register")} />
      </div>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tab-btn flex-1 flex items-center justify-center gap-2 rounded-lg py-2 transition-all ${active ? "tab-btn-active" : "text-white/60 hover:text-white/90"}`}
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
      {label}
    </button>
  );
}

function CardFooter() {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
      <p className="text-[11px] text-gray-400">© 2026 Nisir Bank S.C.</p>
      <div className="flex gap-3 text-[11px]">
        <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">Privacy</a>
        <span className="text-gray-300">·</span>
        <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">Terms</a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sign-In Form
───────────────────────────────────────────────────────────────── */
function SignInForm({ login, setLogin, showPwd, setShowPwd, loginErr, loginLoad, handleLogin }) {
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {loginErr && <StatusMessage type="err" text={loginErr} />}

      <FormField label="Employee ID" htmlFor="employee-id" icon="badge">
        <input
          id="employee-id"
          type="text"
          placeholder="e.g. E-10234"
          className="inp"
          value={login.employeeId}
          onChange={(e) => setLogin({ ...login, employeeId: e.target.value })}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" icon="lock">
        <div className="relative">
          <input
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            className="inp"
            style={{ paddingRight: "48px" }}
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            onPointerDown={() => setShowPwd(true)}
            onPointerUp={() => setShowPwd(false)}
            onPointerCancel={() => setShowPwd(false)}
            onPointerLeave={() => setShowPwd(false)}
          >
            <span className="material-symbols-outlined text-xl">
              {showPwd ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </FormField>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={login.rememberMe}
            onChange={(e) => setLogin({ ...login, rememberMe: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500">Remember me</span>
        </label>
        <a href="#" className="text-xs font-bold text-blue-700 hover:underline">
          Forgot password?
        </a>
      </div>

      <PrimaryButton loading={loginLoad} loadLabel="Signing in…" icon="arrow_forward">
        Sign In
      </PrimaryButton>

      <p className="text-center text-[11px] text-gray-400 pt-1">
        Need help?{" "}
        <a href="#" className="font-bold text-blue-700 hover:underline">
          Contact Security Operations
        </a>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Register / Get Credentials Form
───────────────────────────────────────────────────────────────── */
function RegisterForm({ reg, setReg, regMsg, regLoad, handleRegister, switchTab }) {
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* How it works */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[12px] text-sky-800 leading-relaxed space-y-1">
        <p className="font-bold text-sky-900">How credential issuance works</p>
        <ol className="list-decimal list-inside space-y-1 text-sky-800">
          <li>Enter the Employee ID assigned to you by HR.</li>
          <li>Provide your full name and registered phone number for identity verification.</li>
          <li>The system dispatches a temporary password to your organizational email (<span className="font-semibold">name@nisirbank.com</span>).</li>
          <li>Sign in using your Employee ID and the temporary password, then set a new one.</li>
        </ol>
      </div>

      {regMsg.text && <StatusMessage type={regMsg.type} text={regMsg.text} />}

      <FormField label="Full Name *" htmlFor="full-name" icon="person">
        <input
          id="full-name"
          type="text"
          placeholder="e.g. Abebe Girma"
          className="inp"
          autoComplete="name"
          value={reg.fullName}
          onChange={(e) => setReg({ ...reg, fullName: e.target.value })}
        />
      </FormField>

      <FormField label="Employee ID *" htmlFor="reg-emp-id" icon="badge">
        <input
          id="reg-emp-id"
          type="text"
          placeholder="As shown on your HR appointment letter"
          className="inp"
          autoComplete="off"
          value={reg.employeeId}
          onChange={(e) => setReg({ ...reg, employeeId: e.target.value })}
        />
      </FormField>

      <FormField label="Phone Number *" htmlFor="reg-phone" icon="phone">
        <input
          id="reg-phone"
          type="tel"
          placeholder="e.g. +251 91 234 5678"
          className="inp"
          autoComplete="tel"
          value={reg.phone}
          onChange={(e) => setReg({ ...reg, phone: e.target.value })}
        />
      </FormField>

      {/* Security note */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] text-amber-800 leading-relaxed">
        <span className="material-symbols-outlined filled text-base text-amber-500 shrink-0 mt-0.5">lock</span>
        <span>
          Your temporary password will be sent <strong>only</strong> to your pre-registered
          Nisir Bank organizational email. Never share your credentials with anyone.
        </span>
      </div>

      <PrimaryButton loading={regLoad} loadLabel="Sending credentials…" icon="mark_email_read">
        Send My Credentials
      </PrimaryButton>

      <p className="text-center text-[11px] text-gray-400 pt-1">
        Already have credentials?{" "}
        <button
          type="button"
          onClick={() => switchTab("login")}
          className="font-bold text-blue-700 hover:underline"
        >
          Sign in here
        </button>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   About the Bank Section
───────────────────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section className="px-6 md:px-12 xl:px-14 py-10 section-divider">
      <p className="section-label">About the Bank</p>
      <h2 className="section-h2">A New Chapter in Ethiopian Banking</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="body-copy text-[1.05rem] mb-4">
            Nisir Bank Share Company is a newly established commercial bank in Ethiopia.
            After a rigorous review process, the bank received its full operating licence from
            the{" "}
            <strong className="text-white font-semibold">National Bank of Ethiopia (NBE)</strong>{" "}
            — the country&apos;s apex regulatory authority — clearing the way for its historic launch.
          </p>
          <p className="body-copy-sm">
            The bank is set to open its doors to the public at the start of{" "}
            <strong className="text-white/90 font-semibold">Ethiopian New Year 2019</strong>{" "}
            (September 2026), bringing modern, accessible, and secure banking services to
            individuals, businesses, and institutions across Ethiopia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoTile icon="gavel"       color="blue"   title="Fully Licensed"     detail="Operating licence granted by the National Bank of Ethiopia" />
          <InfoTile icon="celebration" color="amber"  title="Launch: E.Y. 2019"  detail="Official public opening at Ethiopian New Year, September 2026" />
          <InfoTile icon="groups"      color="green"  title="Share Company"      detail="Owned by a broad base of Ethiopian shareholders and investors" />
          <InfoTile icon="smartphone"  color="purple" title="Digital-First Bank" detail="Built from the ground up around modern, technology-enabled banking" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Vision · Mission · Objectives Section
───────────────────────────────────────────────────────────────── */
function VmoSection() {
  const objectives = [
    "Provide inclusive, accessible banking for all Ethiopians",
    "Achieve full compliance with all NBE regulatory directives",
    "Cultivate a security-aware and continuously learning workforce",
    "Leverage technology to deliver superior customer experiences",
    "Drive growth through responsible lending and financial inclusion",
  ];

  return (
    <section className="px-6 md:px-12 xl:px-14 py-10 section-divider">
      <p className="section-label">Strategic Direction</p>
      <h2 className="section-h2">Vision, Mission &amp; Objectives</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <VmoCard
          color="sky"
          icon="visibility"
          tag="Vision"
          headline="Ethiopia's Premier Digital-First Commercial Bank"
          body="To be a leading, trusted, and technology-driven commercial bank in Ethiopia — championing inclusive financial services, responsible banking, and lasting value for every customer and community we serve."
        />

        <VmoCard
          color="emerald"
          icon="flag"
          tag="Mission"
          headline="Accessible, Secure & Technology-Enabled Finance"
          body="To deliver reliable, accessible, and innovative financial services to all Ethiopians while fostering a culture of compliance, integrity, and continuous growth among our people and communities."
        />

        <ObjectivesCard objectives={objectives} />
      </div>
    </section>
  );
}

function VmoCard({ color, icon, tag, headline, body }) {
  const palette = {
    sky:     { wrapper: "border-sky-400/25 bg-sky-500/10",     icon: "border-sky-400/30 bg-sky-500/20 text-sky-300",     label: "text-sky-300" },
    emerald: { wrapper: "border-emerald-400/25 bg-emerald-500/10", icon: "border-emerald-400/30 bg-emerald-500/20 text-emerald-300", label: "text-emerald-300" },
  }[color];

  return (
    <div className={`vmo-card rounded-2xl p-6 flex flex-col gap-4 border ${palette.wrapper}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${palette.icon}`}>
        <span className={`material-symbols-outlined filled text-2xl ${palette.icon.split(" ")[2]}`}>{icon}</span>
      </div>
      <div>
        <p className={`dark-label ${palette.label} mb-2`}>{tag}</p>
        <p className="hg text-[1.15rem] font-bold text-white leading-snug mb-3">{headline}</p>
        <p className="body-copy-sm">{body}</p>
      </div>
    </div>
  );
}

function ObjectivesCard({ objectives }) {
  return (
    <div className="vmo-card rounded-2xl p-6 flex flex-col gap-4 border border-violet-400/25 bg-violet-500/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/20">
        <span className="material-symbols-outlined filled text-2xl text-violet-300">target</span>
      </div>
      <div>
        <p className="dark-label text-violet-300 mb-2">Objectives</p>
        <ul className="space-y-2.5">
          {objectives.map((obj) => (
            <li key={obj} className="flex items-start gap-2.5 body-copy-sm">
              <span className="material-symbols-outlined filled text-base text-violet-300 shrink-0 mt-0.5">
                check_circle
              </span>
              {obj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SETA Portal Section
───────────────────────────────────────────────────────────────── */
function SetaSection() {
  const accessTags = ["All Branches", "All Departments", "All Seniority Levels", "Onboarding & Ongoing"];

  return (
    <section className="px-6 md:px-12 xl:px-14 py-10 section-divider">
      <p className="section-label">About This Portal</p>
      <h2 className="section-h2">What is the SETA Portal?</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="body-copy text-[1.05rem] mb-4">
            This portal is an{" "}
            <strong className="text-white font-semibold">internal, employees-only</strong>{" "}
            platform dedicated to Nisir Bank&apos;s{" "}
            <strong className="text-white font-semibold">
              Security Education, Training &amp; Awareness (SETA)
            </strong>{" "}
            programme — the primary tool through which every staff member is equipped to protect
            customer data and uphold the bank&apos;s Information Security Policy from day one.
          </p>
          <p className="body-copy-sm">
            Powered by an{" "}
            <strong className="text-white/90 font-semibold">AI-agentic mediation system</strong>,
            the training is never static or one-size-fits-all. An AI agent continuously assesses
            each employee&apos;s knowledge gaps, role-specific risks, and learning pace to deliver
            a tailored, adaptive security training experience.
          </p>
        </div>

        <AccessCard tags={accessTags} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <FeatureCard icon="smart_toy"        color="blue"   title="AI-Agentic Mediation"    description="An intelligent AI agent personalises every training session based on your role, responsibilities, and assessed risk profile." />
        <FeatureCard icon="psychology"       color="green"  title="Adaptive Scenario Engine" description="Real-world security scenarios dynamically generated to match your knowledge level and identified learning gaps." />
        <FeatureCard icon="workspace_premium" color="yellow" title="ISP Compliance Tracking" description="Your progress against Nisir Bank's Information Security Policy is tracked automatically and reported to management." />
        <FeatureCard icon="military_tech"    color="purple" title="Gamified Progression"     description="Earn ISP tokens, unlock badges, and earn professional certifications as you complete SETA training modules." />
      </div>
    </section>
  );
}

function AccessCard({ tags }) {
  return (
    <div className="aim-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <span className="material-symbols-outlined filled text-2xl text-amber-300">info</span>
        <p className="font-bold text-white">Access &amp; Eligibility</p>
      </div>
      <p className="body-copy-sm">
        Access is strictly limited to authorised Nisir Bank employees. Each employee is assigned a
        unique Employee ID upon onboarding. Use the{" "}
        <strong className="text-white/90">New Employee</strong> tab on the login card above to
        request your credentials.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page Footer
───────────────────────────────────────────────────────────────── */
function PageFooter() {
  return (
    <footer className="px-6 md:px-12 xl:px-14 py-6 section-divider mt-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-white/50">
          © 2026 Nisir Bank S.C. · Licensed by the National Bank of Ethiopia · All rights reserved
        </p>
        <div className="flex gap-5 text-xs text-white/40">
          <a href="#" className="hover:text-white/80 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white/80 transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-white/80 transition-colors">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Reusable primitive components
───────────────────────────────────────────────────────────────── */

function FormField({ label, htmlFor, icon, children }) {
  return (
    <div>
      <label className="card-label mb-1.5 block" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </span>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ loading, loadLabel, icon, children }) {
  return (
    <button type="submit" className="btn-primary mt-1" disabled={loading}>
      {loading ? (
        <>
          <span className="material-symbols-outlined spin text-base">progress_activity</span>
          <span>{loadLabel}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <span className="material-symbols-outlined text-base">{icon}</span>
        </>
      )}
    </button>
  );
}

function StatusMessage({ type, text }) {
  return (
    <div className={type === "ok" ? "success-msg show" : "error-msg show"}>
      <span className="material-symbols-outlined text-base">
        {type === "ok" ? "check_circle" : "error"}
      </span>
      <span>{text}</span>
    </div>
  );
}

function InfoBanner({ children }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800 leading-relaxed">
      {children}
    </div>
  );
}

function InfoTile({ icon, color, title, detail }) {
  const palette = {
    blue:   { border: "border-sky-400/25",     bg: "bg-sky-500/15",     icon: "text-sky-300" },
    amber:  { border: "border-amber-400/25",   bg: "bg-amber-500/15",   icon: "text-amber-300" },
    green:  { border: "border-emerald-400/25", bg: "bg-emerald-500/15", icon: "text-emerald-300" },
    purple: { border: "border-violet-400/25",  bg: "bg-violet-500/15",  icon: "text-violet-300" },
  }[color];

  return (
    <div className={`info-tile rounded-xl border ${palette.border} ${palette.bg} p-4 flex flex-col gap-2 backdrop-blur-sm`}>
      <span className={`material-symbols-outlined filled text-xl ${palette.icon}`}>{icon}</span>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="body-copy-sm text-xs">{detail}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  const palette = {
    blue:   { border: "border-sky-400/30",     bg: "bg-sky-500/20",     icon: "text-sky-300" },
    green:  { border: "border-emerald-400/30", bg: "bg-emerald-500/20", icon: "text-emerald-300" },
    yellow: { border: "border-amber-400/30",   bg: "bg-amber-500/20",   icon: "text-amber-300" },
    purple: { border: "border-violet-400/30",  bg: "bg-violet-500/20",  icon: "text-violet-300" },
  }[color];

  return (
    <div className="feature-card rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3 backdrop-blur-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${palette.border} ${palette.bg}`}>
        <span className={`material-symbols-outlined filled text-xl ${palette.icon}`}>{icon}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-white mb-1.5">{title}</p>
        <p className="text-[13px] leading-relaxed text-white/75">{description}</p>
      </div>
    </div>
  );
}
