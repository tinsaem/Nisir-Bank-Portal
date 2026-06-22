"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

export default function CustomerServiceWorkshopPage() {
  const [registered, setRegistered] = useState(false);

  if (registered) {
    return (
      <PortalPageShell eyebrow="Training · Workshop Registration">
        <p className="text-sm font-semibold text-emerald-700">
          Successfully registered for the 13 November workshop.
        </p>
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell eyebrow="Training · Workshop Registration" title="Customer Service Excellence Workshop">
      <dl className="grid grid-cols-2 gap-y-3 text-sm mb-6">
        <dt className="text-gray-400 font-semibold">Date</dt>
        <dd className="text-gray-800">Wednesday, 13 November 2024</dd>
        <dt className="text-gray-400 font-semibold">Time</dt>
        <dd className="text-gray-800">2:00 PM — 5:00 PM</dd>
        <dt className="text-gray-400 font-semibold">Venue</dt>
        <dd className="text-gray-800">Training Room A, 2nd Floor, Head Office</dd>
        <dt className="text-gray-400 font-semibold">Facilitator</dt>
        <dd className="text-gray-800">Ato Solomon Tefera, Senior Customer Experience Consultant</dd>
      </dl>

      <button
        type="button"
        onClick={() => setRegistered(true)}
        className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
      >
        Confirm Registration
      </button>
    </PortalPageShell>
  );
}
