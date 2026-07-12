import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-default bg-surface-3 ${className}`} aria-hidden="true" />
);

export default Skeleton;
