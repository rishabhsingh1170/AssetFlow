import React from "react";

export const Badge = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    // Status available maps to Active
    active: "bg-status-available-bg text-status-available border border-status-available-border",
    // Status retired maps to Inactive
    inactive: "bg-status-retired-bg text-status-retired border border-status-retired-border",
    // Role styling
    admin: "bg-accent-100 text-accent-800 border border-accent-200",
    asset_manager: "bg-info-bg text-info border border-info-border",
    department_head: "bg-status-reserved-bg text-status-reserved border border-status-reserved-border",
    employee: "bg-surface-2 text-text-secondary border border-border",
    // General alerts
    success: "bg-success-bg text-success border border-success-border",
    warning: "bg-warning-bg text-warning border border-warning-border",
    danger: "bg-danger-bg text-danger border border-danger-border",
    info: "bg-info-bg text-info border border-info-border",
    neutral: "bg-surface-2 text-text-secondary border border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold tracking-[0.06em] uppercase ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
