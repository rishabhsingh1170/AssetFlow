import React from "react";

export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-surface-1 border border-border rounded-card p-6 shadow-md transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
