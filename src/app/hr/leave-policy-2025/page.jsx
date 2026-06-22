"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

export default function LeavePolicyPage() {
  const [acknowledged, setAcknowledged] = useState(false);

  if (acknowledged) {
    return (
      <PortalPageShell eyebrow="HR · Annual Leave Policy">
        <p className="text-sm font-semibold text-emerald-700">
          Policy acknowledged. Your HR record has been updated.
        </p>
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell eyebrow="HR · Annual Leave Policy" title="Updated Annual Leave Policy — Effective 1 January 2025">
      <ul className="text-sm text-gray-600 leading-relaxed space-y-2.5 mb-6 list-disc pl-5">
        <li>Annual leave entitlement during probation increases from 10 to 14 days per year.</li>
        <li>Up to 5 unused leave days may now be carried over to the following year.</li>
        <li>Leave requests must be submitted at least 5 working days in advance through the SETA Portal leave module.</li>
        <li>Sick leave of 2 or more consecutive days now requires a medical certificate.</li>
        <li>Emergency and compassionate leave provisions now include extended family members.</li>
        <li>Leave taken without prior approval will be recorded as unauthorized absence.</li>
      </ul>

      <button
        type="button"
        onClick={() => setAcknowledged(true)}
        className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
      >
        I have read this policy
      </button>
    </PortalPageShell>
  );
}
