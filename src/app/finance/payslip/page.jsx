"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

function birr(amount) {
  return `ETB ${amount.toLocaleString()}`;
}

export default function PayslipPage() {
  const [downloaded, setDownloaded] = useState(false);

  const basic = 18500;
  const transport = 1200;
  const housing = 2500;
  const gross = basic + transport + housing;
  const tax = 3120;
  const pension = 1295;
  const net = gross - tax - pension;

  return (
    <PortalPageShell eyebrow="Finance · Payslip" title="November 2024 Payslip">
      <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
        <Row label="Basic Salary" value={birr(basic)} />
        <Row label="Transport Allowance" value={birr(transport)} />
        <Row label="Housing Allowance" value={birr(housing)} />
        <Row label="Gross Pay" value={birr(gross)} bold />
        <Row label="Income Tax" value={`- ${birr(tax)}`} muted />
        <Row label="Pension Contribution" value={`- ${birr(pension)}`} muted />
        <Row label="Net Pay" value={birr(net)} bold accent />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setDownloaded(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          Download
        </button>
        <button
          type="button"
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          Print
        </button>
      </div>

      {downloaded && (
        <p className="text-sm font-semibold text-emerald-700 mt-4">Payslip saved to your downloads.</p>
      )}
    </PortalPageShell>
  );
}

function Row({ label, value, bold, accent, muted }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className={`text-sm ${muted ? "text-gray-400" : "text-gray-600"}`}>{label}</span>
      <span
        className={`text-sm ${bold ? "font-bold" : ""} ${accent ? "text-teal-700" : muted ? "text-gray-400" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
