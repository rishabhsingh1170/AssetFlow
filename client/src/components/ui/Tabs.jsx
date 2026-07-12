import React from "react";

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = "pills",
  className = "",
}) => {
  if (variant === "line") {
    return (
      <div className={`flex border-b border-border ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer -mb-[2px] ${
                isActive
                  ? "border-accent-400 text-accent-400 font-semibold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant matching Screen 3 wireframes
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[rgba(232,163,61,0.15)] text-accent-400 border-accent-400 shadow-sm"
                : "bg-surface-1 border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
