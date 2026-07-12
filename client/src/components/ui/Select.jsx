import React from "react";
import { ChevronDown } from "lucide-react";

export const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      error,
      className = "",
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={id} className="eyebrow block mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`w-full px-3 py-2 pr-9 text-sm bg-surface-1 text-text-primary border rounded-default transition-colors duration-150 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-ring/30 disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed appearance-none cursor-pointer ${
              error
                ? "border-danger focus:border-danger focus:ring-danger/30"
                : "border-border-strong"
            }`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
