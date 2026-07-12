import React from "react";

const strokeColor = "var(--color-border-strong)";
const accentColor = "var(--color-accent-400)";

const TagIllustration = () => (
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <path
      d="M46 28h34a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H46L26 48l20-20Z"
      stroke={strokeColor}
      strokeWidth="1.5"
    />
    <circle cx="44" cy="48" r="4" stroke={strokeColor} strokeWidth="1.5" />
    <path
      d="M44 48c-8-10-16-14-26-12"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeDasharray="3 4"
      strokeLinecap="round"
    />
    <rect x="56" y="42" width="24" height="3" rx="1.5" fill={accentColor} />
    <rect x="56" y="51" width="14" height="3" rx="1.5" fill={strokeColor} opacity="0.6" />
  </svg>
);

const SearchIllustration = () => (
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <path
      d="M38 34h26a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H38L24 48l14-14Z"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeDasharray="3 4"
    />
    <circle cx="72" cy="46" r="14" stroke={strokeColor} strokeWidth="1.5" fill="var(--color-surface-1)" />
    <circle cx="72" cy="46" r="14" stroke={accentColor} strokeWidth="1.5" opacity="0.6" />
    <path d="M82.5 56.5 94 68" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const InboxIllustration = () => (
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <path
      d="M34 40 42 26h36l8 14v26a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V40Z"
      stroke={strokeColor}
      strokeWidth="1.5"
    />
    <path
      d="M34 40h20c0 5 2.5 8 6 8s6-3 6-8h20"
      stroke={strokeColor}
      strokeWidth="1.5"
    />
    <circle cx="86" cy="30" r="5" fill={accentColor} />
  </svg>
);

const GenericIllustration = () => (
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <rect
      x="30"
      y="24"
      width="60"
      height="48"
      rx="8"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeDasharray="4 5"
    />
    <path
      d="M52 48l6 6 12-12"
      stroke={accentColor}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ILLUSTRATIONS = {
  assets: TagIllustration,
  search: SearchIllustration,
  inbox: InboxIllustration,
  generic: GenericIllustration,
};

export const EmptyState = ({
  illustration = "generic",
  title,
  description,
  action,
  className = "",
}) => {
  const Illustration = ILLUSTRATIONS[illustration] || GenericIllustration;

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <Illustration />
      <h3 className="font-display text-base font-semibold text-text-primary mt-4">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
