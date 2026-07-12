import React from "react";
import { getStatusMeta } from "../../utils/assetStatus";

// Static literal class map per pill token. Tailwind cannot see dynamically
// composed class names, so every combination is written out in full.
const PILL_CLASSES = {
  available: "bg-status-available-bg text-status-available border-status-available-border",
  allocated: "bg-status-allocated-bg text-status-allocated border-status-allocated-border",
  reserved: "bg-status-reserved-bg text-status-reserved border-status-reserved-border",
  maintenance: "bg-status-maintenance-bg text-status-maintenance border-status-maintenance-border",
  lost: "bg-status-lost-bg text-status-lost border-status-lost-border",
  retired: "bg-status-retired-bg text-status-retired border-status-retired-border",
  disposed: "bg-status-disposed-bg text-status-disposed border-status-disposed-border",
};

const DOT_CLASSES = {
  available: "bg-status-available",
  allocated: "bg-status-allocated",
  reserved: "bg-status-reserved",
  maintenance: "bg-status-maintenance",
  lost: "bg-status-lost",
  retired: "bg-status-retired",
  disposed: "bg-status-disposed",
};

export const StatusPill = ({ status, domain = "asset", className = "" }) => {
  const meta = getStatusMeta(domain, status);
  const pillClasses = PILL_CLASSES[meta.pill] || PILL_CLASSES.retired;
  const dotClasses = DOT_CLASSES[meta.pill] || DOT_CLASSES.retired;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] ${pillClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
};

export default StatusPill;
