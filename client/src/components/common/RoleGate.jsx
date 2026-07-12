import React from "react";
import { useRole, hasRole } from "../../hooks/useRole";

export const RoleGate = ({ allowedRoles = [], fallback = null, children }) => {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return null;
  }

  if (hasRole(role, allowedRoles)) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGate;
