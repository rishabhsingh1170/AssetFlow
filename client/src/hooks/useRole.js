import { useAuth } from "./useAuth";

export const hasRole = (role, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
};

export const useRole = () => {
  const { role, loading, profile } = useAuth();

  return {
    role,
    isLoading: loading,
    isAdmin: role === "admin",
    isAssetManager: role === "asset_manager",
    isDepartmentHead: role === "department_head",
    isEmployee: role === "employee",
    profile,
    hasRole: (allowedRoles) => hasRole(role, allowedRoles),
  };
};

export default useRole;
