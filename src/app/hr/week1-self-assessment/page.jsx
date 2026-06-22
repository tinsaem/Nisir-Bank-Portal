"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

const SCALE = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function Week1SelfAssessmentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(null);
  const [checks, setChecks] = useState({ a: false, b: false, c: false });

  if (submitted) {
    return (
      <PortalPageShell eyebrow="HR · Week 1 Self-Assessment">
        <p className="text-sm font-semibold text-emerald-700">
          Self-assessment submitted. Thank you for your feedback.
        </p>
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell eyebrow="HR · Week 1 Self-Assessment" title="How was your first week?">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Overall, how would you rate your first week?</p>
        <div className="flex gap-2 flex-wrap">
          {SCALE.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setRating(label)}
              className={`text-xs font-bold px-3 py-2 rounded-lg border ${
                rating === label ? "bg-blue-700 text-white border-blue-700" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <Check
          label="Onboarding materials prepared me well for my role"
          checked={checks.a}
          onChange={() => setChecks((c) => ({ ...c, a: !c.a }))}
        />
        <Check
          label="I understand who to contact for HR, IT, and Compliance questions"
          checked={checks.b}
          onChange={() => setChecks((c) => ({ ...c, b: !c.b }))}
        />
        <Check
          label="I have no immediate concerns to raise with my line manager"
          checked={checks.c}
          onChange={() => setChecks((c) => ({ ...c, c: !c.c }))}
        />
      </div>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
      >
        Submit Self-Assessment
      </button>
    </PortalPageShell>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
      {label}
    </label>
  );
}
