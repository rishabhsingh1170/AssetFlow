import React from "react";

export const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      error,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          className={`w-full px-3 py-2 bg-surface-2 text-text-primary placeholder-text-muted border rounded-default border-border transition-all duration-200 focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-danger focus:border-danger focus:ring-danger" : ""
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
