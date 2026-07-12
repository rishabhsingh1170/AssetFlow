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
          <label htmlFor={id} className="eyebrow block mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          className={`w-full px-3 py-2 text-sm bg-surface-1 text-text-primary placeholder:text-text-muted border rounded-default transition-colors duration-150 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-ring/30 disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/30"
              : "border-border-strong"
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
