"use client";

import { useState } from "react";
import PortalPageShell from "@/components/PortalPageShell";

export default function AccountSettingsPage() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [updated, setUpdated] = useState(false);

  function submit(e) {
    e.preventDefault();
    setUpdated(true);
  }

  return (
    <PortalPageShell eyebrow="Account · Settings" title="Account Security">
      <h2 className="text-sm font-bold text-gray-800 mb-3">Change Password</h2>

      <form onSubmit={submit} className="space-y-3 max-w-sm">
        <input
          type="password"
          placeholder="Current password"
          value={form.current}
          onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <input
          type="password"
          placeholder="New password"
          value={form.next}
          onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          Update Password
        </button>
      </form>

      {updated && (
        <p className="text-sm font-semibold text-emerald-700 mt-4">
          Password updated successfully. Your new password is active.
        </p>
      )}
    </PortalPageShell>
  );
}
