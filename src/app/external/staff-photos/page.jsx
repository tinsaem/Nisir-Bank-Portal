"use client";

import { useEffect, useState } from "react";
import { safeApiCall } from "@/lib/safeApiCall";

const PHOTOS = [
  "Team building games",
  "Lunch at the park",
  "Winning team celebration 🏆",
  "Group photo",
  "Tug of war",
  "Closing remarks",
];

export default function StaffPhotosPage() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    safeApiCall(() =>
      fetch("/api/internal-email/dv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: "email-019", dv: "dv1" }),
      })
    );
  }, []);

  function downloadAll() {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDone(true);
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Nisir Bank Team Day — November 2024 📸</h1>
        <p className="text-sm text-gray-500 mb-6">Shared by the Staff Association · No login required</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {PHOTOS.map((caption) => (
            <div
              key={caption}
              className="aspect-square rounded-xl bg-gradient-to-br from-amber-200 to-rose-200 flex items-center justify-center p-3 text-center"
            >
              <span className="text-[11px] font-semibold text-gray-700">{caption}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={downloadAll}
          disabled={downloading || done}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          {downloading ? "Downloading…" : done ? "✓ Downloaded" : "Download All Photos"}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Want to join the organizing committee? Reply to the original email to get involved.
        </p>
      </div>
    </main>
  );
}
