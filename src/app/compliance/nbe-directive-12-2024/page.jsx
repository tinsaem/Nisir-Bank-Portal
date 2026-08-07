"use client";

import { useState, useEffect } from "react";
import PortalPageShell from "@/components/PortalPageShell";
import { loadCurrentUser } from "@/lib/currentUser";

export default function NbeDirectivePage() {
  const [employeeId, setEmployeeId] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    loadCurrentUser().then((parsed) => {
      if (parsed) setEmployeeId(parsed.employeeId || "");
    });
  }, []);

  if (acknowledged) {
    return (
      <PortalPageShell eyebrow="Compliance · NBE Directive No. 12/2024">
        <p className="text-sm font-semibold text-emerald-700">
          Acknowledgment recorded. Reference: ACK-{employeeId || "EMP"}-12-2024.
        </p>
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell eyebrow="Compliance · NBE Directive No. 12/2024" title="Information Security Standards for Licensed Financial Institutions">
      <div className="text-sm text-gray-600 leading-relaxed space-y-3 mb-6">
        <p>
          The National Bank of Ethiopia (NBE) hereby issues this directive establishing minimum information
          security standards applicable to all licensed commercial banks operating within the Federal
          Democratic Republic of Ethiopia, effective immediately.
        </p>
        <p>
          Licensed institutions shall enforce password policies requiring a minimum of ten characters with
          mixed case, numeric, and special characters, and shall require password rotation no less frequently
          than every ninety days across all systems handling customer or institutional data.
        </p>
        <p>
          Any suspected data breach or security incident affecting customer information must be reported to
          the institution's Compliance Officer and, where applicable, to the NBE Banking Supervision
          Directorate within twenty-four hours of discovery.
        </p>
        <p>
          Personal computing devices shall not be used to access core banking systems or customer data without
          prior written approval from the institution's IT Security function. All staff shall complete annual
          information security refresher training as a condition of continued system access.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setAcknowledged(true)}
        className="bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
      >
        Submit Acknowledgment
      </button>
    </PortalPageShell>
  );
}
