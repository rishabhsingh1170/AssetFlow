import { useAuth } from "./useAuth";

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
  };
};

export default useRole;
