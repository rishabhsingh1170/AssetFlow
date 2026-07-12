import { supabase } from "../../../../api/supabase";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  logoutSuccess,
} from "../auth.slice";

export const authService = {
  login: async (credentials, dispatch) => {
    dispatch(loginStart());
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Query profiles table from Supabase for role checks
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      // Default role fallback to employee if profile isn't populated yet
      const userProfile = profile || { role: "employee", full_name: data.user.email };

      dispatch(loginSuccess({ user: data.user, profile: userProfile }));
      return { user: data.user, profile: userProfile };
    } catch (err) {
      const errMsg = err.message || "Login failed";
      dispatch(loginFailure(errMsg));
      throw new Error(errMsg);
    }
  },

  signup: async (userData, dispatch) => {
    dispatch(loginStart());
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      });

      if (error) throw error;

      const user = data.user;
      const profile = data.session ? { role: "employee", full_name: userData.fullName } : null;

      dispatch(loginSuccess({ user: data.session ? user : null, profile }));
      return { user, session: data.session };
    } catch (err) {
      const errMsg = err.message || "Signup failed";
      dispatch(loginFailure(errMsg));
      throw new Error(errMsg);
    }
  },

  logout: async (dispatch) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase logout request error:", e);
    } finally {
      dispatch(logoutSuccess());
    }
  },

  getCurrentUser: async (dispatch) => {
    dispatch(loadUserStart());
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        dispatch(loadUserFailure());
        return null;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const userProfile = profile || { role: "employee", full_name: session.user.email };
      dispatch(loadUserSuccess({ user: session.user, profile: userProfile }));
      return { user: session.user, profile: userProfile };
    } catch (err) {
      dispatch(loadUserFailure());
      throw err;
    }
  },

  forgotPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) throw error;
    return data;
  },
};

export default authService;
