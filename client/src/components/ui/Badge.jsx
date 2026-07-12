import React from "react";

export const Badge = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    // Status available maps to Active
    active: "bg-[rgba(93,202,165,0.08)] text-status-available border border-[rgba(93,202,165,0.25)]",
    // Status retired maps to Inactive
    inactive: "bg-[rgba(106,110,120,0.08)] text-status-retired border border-[rgba(106,110,120,0.25)]",
    // Role styling
    admin: "bg-[rgba(232,163,61,0.08)] text-accent-400 border border-[rgba(232,163,61,0.25)]",
    asset_manager: "bg-[rgba(127,156,232,0.08)] text-info border border-[rgba(127,156,232,0.25)]",
    department_head: "bg-[rgba(201,168,76,0.08)] text-status-reserved border border-[rgba(201,168,76,0.25)]",
    employee: "bg-[rgba(244,244,242,0.04)] text-text-secondary border border-border",
    // General alerts
    success: "bg-[rgba(93,202,165,0.08)] text-success border border-[rgba(93,202,165,0.25)]",
    warning: "bg-[rgba(232,163,61,0.08)] text-warning border border-[rgba(232,163,61,0.25)]",
    danger: "bg-[rgba(224,100,90,0.08)] text-danger border border-[rgba(224,100,90,0.25)]",
    info: "bg-[rgba(127,156,232,0.08)] text-info border border-[rgba(127,156,232,0.25)]",
    neutral: "bg-surface-2 text-text-secondary border border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
