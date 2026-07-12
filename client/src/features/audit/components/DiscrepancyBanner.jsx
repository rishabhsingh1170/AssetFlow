import React, { useState } from "react";
import { Info, X } from "lucide-react";

// Info banner above the audit tabs. Two modes:
// - Backend-gap mode (today): shown when the logs fetch succeeded but came
//   back empty, explaining that activity logging and audit cycles are
//   pending server work.
// - Discrepancy mode (once AUDIT_CYCLES_ENABLED flips): pass
//   `openDiscrepancyCount` and it summarizes open discrepancies instead.
export const DiscrepancyBanner = ({ show = false, openDiscrepancyCount = null }) => {
  const [dismissed, setDismissed] = useState(false);

  const discrepancyMode =
    openDiscrepancyCount !== null && openDiscrepancyCount !== undefined;

  if (dismissed) return null;
  if (!discrepancyMode && !show) return null;
  if (discrepancyMode && openDiscrepancyCount === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-default border border-info-border bg-info-bg px-4 py-3">
      <Info size={16} className="text-info mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0 text-sm text-info">
        {discrepancyMode ? (
          <p>
            <span className="font-semibold">
              {openDiscrepancyCount} open{" "}
              {openDiscrepancyCount === 1 ? "discrepancy" : "discrepancies"}
            </span>{" "}
            across active audit cycles need review.
          </p>
        ) : (
          <p>
            <span className="font-semibold">Audit data is pending backend work.</span>{" "}
            Server-side activity logging is not enabled and audit cycle endpoints are
            not mounted yet, so activity logs stay empty and audit cycles cannot be
            created. This page lights up automatically once that lands.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="p-1 rounded-default text-info hover:bg-info-border/40 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default DiscrepancyBanner;
