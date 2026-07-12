import React from "react";

export const Card = ({ children, className = "", padding = "default", ...props }) => {
  const paddings = {
    default: "p-6",
    none: "p-0 overflow-hidden",
  };

  return (
    <div
      className={`bg-surface-1 border border-border rounded-card shadow-card ${paddings[padding] || paddings.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
