import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../api/supabase";
import {
  loginSuccess,
  logoutSuccess,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
} from "../features/auth/auth.slice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, profile, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      if (!user) {
        dispatch(loadUserStart());
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session && mounted) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const userProfile = profile || { role: "employee", full_name: session.user.email };
          dispatch(loadUserSuccess({ user: session.user, profile: userProfile }));
        } else if (mounted) {
          dispatch(loadUserFailure());
        }
      } catch (err) {
        if (mounted) {
          dispatch(loadUserFailure());
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const userProfile = profile || { role: "employee", full_name: session.user.email };
          dispatch(loginSuccess({ user: session.user, profile: userProfile }));
        } catch (err) {
          dispatch(loginSuccess({ user: session.user, profile: { role: "employee" } }));
        }
      } else {
        dispatch(logoutSuccess());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return {
    user,
    profile,
    loading,
    role: profile?.role || user?.role || null,
    isAuthenticated: !!user,
  };
};

export default useAuth;
