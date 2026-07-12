import React from "react";

export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      {eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-accent-600 mb-1">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-2xl font-bold text-text-primary">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
