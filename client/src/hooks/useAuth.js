import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authService } from "../features/auth/services/auth.service";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, profile, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && !user && !loading) {
      authService.getCurrentUser(dispatch).catch((err) => {
        console.warn("Failed to restore session from token:", err);
      });
    }
  }, [dispatch, user, loading]);

  return {
    user,
    profile,
    loading,
    role: profile?.role || user?.role || null,
    isAuthenticated: !!user,
  };
};

export default useAuth;
