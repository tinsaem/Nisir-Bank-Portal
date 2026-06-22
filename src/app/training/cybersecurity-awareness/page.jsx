"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

const SCREENS = [
  {
    title: "Recognizing Phishing Emails",
    body: "Look closely at the sender's domain, not just the display name. Nisir Bank staff only ever email from @nisirbank.com. Urgency, threats, and requests to click a link or enter your password are the classic combination used in phishing attempts.",
  },
  {
    title: "Safe Use of Bank Systems",
    body: "Only access the SETA Portal and other bank systems from authorized workstations. Never use personal USB drives or external storage on bank computers without IT Security clearance, and always lock your screen when you step away.",
  },
  {
    title: "Responding to a Suspicious Email",
    body: "Do not click any link or download any attachment. Forward the email to itsecurity@nisirbank.com, or for external regulatory-looking emails, to compliance@nisirbank.com, and wait for guidance before taking any action.",
  },
  {
    title: "Protecting Customer Data",
    body: "Customer data must never be shared over email, printed and left unattended, or discussed outside secure bank channels. Under Ethiopian data protection law, mishandling customer data carries both regulatory and personal liability.",
  },
];

export default function CybersecurityAwarenessPage() {
  const [screen, setScreen] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <PortalPageShell eyebrow="Cybersecurity Awareness Module">
        <p className="text-sm font-semibold text-emerald-700">
          Module completed. Certificate added to your training record.
        </p>
      </PortalPageShell>
    );
  }

  const isLast = screen === SCREENS.length - 1;

  return (
    <PortalPageShell eyebrow="Training · Cybersecurity Awareness Module" title={SCREENS[screen].title}>
      <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all"
          style={{ width: `${((screen + 1) / SCREENS.length) * 100}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-8">{SCREENS[screen].body}</p>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={screen === 0}
          onClick={() => setScreen((s) => s - 1)}
          className="text-sm font-bold text-gray-400 disabled:opacity-40 px-4 py-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => (isLast ? setCompleted(true) : setScreen((s) => s + 1))}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          {isLast ? "Mark Complete" : "Next"}
        </button>
      </div>
    </PortalPageShell>
  );
}
