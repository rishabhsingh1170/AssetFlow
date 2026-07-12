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
    "inline-flex items-center justify-center font-medium rounded-default transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-accent-400 text-text-primary hover:bg-accent-500 active:bg-accent-600 active:text-white font-semibold shadow-sm",
    secondary:
      "bg-surface-1 border border-border-strong text-text-primary hover:bg-surface-2 active:bg-surface-3",
    danger:
      "bg-danger text-white hover:brightness-95 active:brightness-90 font-semibold shadow-sm",
    ghost:
      "text-text-secondary hover:bg-surface-2 hover:text-text-primary active:bg-surface-3",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2 border-current" />}
      {children}
    </button>
  );
};

export default Button;
