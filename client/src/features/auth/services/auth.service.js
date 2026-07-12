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

const getAuthErrorMessage = (err, fallback, context = "signup") => {
  const message = err?.message || "";
  const status = err?.status || err?.code;
  const normalizedMessage = message.toLowerCase();

  if (status === 429 || normalizedMessage.includes("rate limit")) {
    return context === "signup"
      ? "Too many signup emails were requested. Please wait a few minutes before trying again."
      : "Too many attempts. Please wait a few minutes before trying again.";
  }

  if (normalizedMessage.includes("already registered") || normalizedMessage.includes("already exists")) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (normalizedMessage.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }

  return message || fallback;
};

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
      const errMsg = getAuthErrorMessage(err, "Login failed", "login");
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

      // With email confirmation enabled, signUp for an already-registered email
      // returns a stub user with no identities instead of an error.
      if (data.user && !data.session && data.user.identities?.length === 0) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      }

      const user = data.user;
      const profile = data.session ? { role: "employee", full_name: userData.fullName } : null;

      dispatch(loginSuccess({ user: data.session ? user : null, profile }));
      return { user, session: data.session };
    } catch (err) {
      const errMsg = getAuthErrorMessage(err, "Signup failed", "signup");
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
