"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

const SCREENS = [
  {
    title: "What Is Money Laundering?",
    body: "Money laundering is the process of disguising the proceeds of crime as legitimate funds. Banks are a primary target because they move large volumes of money daily, making illicit transactions easier to hide among legitimate ones.",
  },
  {
    title: "Common Techniques",
    body: "Watch for structuring (breaking large deposits into smaller ones), rapid movement of funds between unrelated accounts, and customers reluctant to explain the source of large sums. These are red flags under Nisir Bank's AML procedures.",
  },
  {
    title: "Your Responsibilities",
    body: "Every employee must file a Suspicious Activity Report (SAR) through the internal compliance system whenever a transaction looks inconsistent with a customer's known profile or business. Never ignore a red flag because a customer is in a hurry.",
  },
  {
    title: "Reporting and Consequences",
    body: "Failing to report suspicious activity can expose Nisir Bank to regulatory penalties from the National Bank of Ethiopia and expose you personally to disciplinary action. When in doubt, report — false positives are expected and welcomed.",
  },
];

export default function AmlAwarenessPage() {
  const [screen, setScreen] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <PortalPageShell eyebrow="AML Awareness Training">
        <p className="text-sm font-semibold text-emerald-700">
          Module completed. Your training record has been updated.
        </p>
      </PortalPageShell>
    );
  }

  const isLast = screen === SCREENS.length - 1;

  return (
    <PortalPageShell eyebrow="Compliance · AML Awareness Training" title={SCREENS[screen].title}>
      <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-violet-600 transition-all"
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
          className="bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          {isLast ? "Mark Complete" : "Next"}
        </button>
      </div>
    </PortalPageShell>
  );
}
