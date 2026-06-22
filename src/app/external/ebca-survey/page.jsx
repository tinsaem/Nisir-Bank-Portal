"use client";

import { useState } from "react";
import { safeApiCall } from "@/lib/safeApiCall";

export default function EbcaSurveyPage() {
  const [step, setStep] = useState("intro");
  const [form, setForm] = useState({ employeeId: "", bankName: "", q1: "", q2: "", q3: "" });
  const [submitting, setSubmitting] = useState(false);

  function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    safeApiCall(() =>
      fetch("/api/internal-email/dv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: "email-014", dv: "dv2" }),
      })
    ).finally(() => {
      setSubmitting(false);
      setStep("done");
    });
  }

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#222] py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded bg-[#1d3557] text-white flex items-center justify-center text-xs font-bold">
            EBCA
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1d3557]">Ethiopian Banking Compliance Authority</p>
            <p className="text-[11px] text-gray-500">2024 Staff Awareness Survey</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 sm:p-8 font-serif">
          {step === "done" ? (
            <p className="text-sm font-semibold text-[#1d3557]">
              Thank you. Your response has been recorded.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-gray-700 mb-2">
                Please provide your details to verify your institution, then complete the brief survey below.
              </p>

              <input
                type="text"
                placeholder="Employee ID"
                required
                value={form.employeeId}
                onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans"
              />
              <input
                type="text"
                placeholder="Bank name"
                required
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans"
              />

              <hr className="border-gray-200" />

              <SurveyQuestion
                label="1. How would you rate your awareness of current phishing threats?"
                value={form.q1}
                onChange={(v) => setForm((f) => ({ ...f, q1: v }))}
              />
              <SurveyQuestion
                label="2. How familiar are you with your bank's internal compliance procedures?"
                value={form.q2}
                onChange={(v) => setForm((f) => ({ ...f, q2: v }))}
              />
              <SurveyQuestion
                label="3. How effective do you find your institution's security training?"
                value={form.q3}
                onChange={(v) => setForm((f) => ({ ...f, q3: v }))}
              />

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#1d3557] hover:bg-[#16294a] disabled:opacity-60 text-white text-sm font-bold font-sans px-5 py-2.5"
              >
                {submitting ? "Submitting…" : "Submit Survey"}
              </button>
            </form>
          )}
        </div>

        <p className="text-[11px] text-gray-400 mt-4 font-sans">
          Ethiopian Banking Compliance Authority — Addis Ababa, Ethiopia
        </p>
      </div>
    </main>
  );
}

function SurveyQuestion({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-700 mb-1.5">{label}</p>
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 text-sm font-sans"
      >
        <option value="" disabled>
          Select a rating
        </option>
        <option>Very Low</option>
        <option>Low</option>
        <option>Moderate</option>
        <option>High</option>
        <option>Very High</option>
      </select>
    </div>
  );
}
