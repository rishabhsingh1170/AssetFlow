import React from "react";
import Spinner from "./Spinner";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-surface-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-accent-400 text-surface-0 hover:bg-accent-200 active:bg-accent-600 font-semibold shadow-sm",
    secondary:
      "border border-border text-text-primary bg-surface-2 hover:bg-surface-3 hover:border-border-strong active:bg-surface-1",
    danger:
      "bg-danger text-text-primary hover:bg-red-400 active:bg-red-600 font-semibold shadow-sm",
    ghost:
      "text-text-secondary hover:bg-surface-2 hover:text-text-primary active:bg-surface-1",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-default",
    md: "px-4 py-2 text-sm rounded-default",
    lg: "px-5 py-2.5 text-base rounded-default",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2 border-current" />}
      {children}
    </button>
  );
};

export default Button;
