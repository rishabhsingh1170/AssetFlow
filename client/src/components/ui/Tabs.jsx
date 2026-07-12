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
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer -mb-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-t-default ${
                isActive
                  ? "border-accent-500 text-accent-600 font-semibold"
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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
              isActive
                ? "bg-accent-100 text-accent-800 border-accent-300"
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
