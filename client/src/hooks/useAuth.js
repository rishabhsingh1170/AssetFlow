import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSessionAndProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (session && mounted) {
          setUser(session.user);
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!error && mounted) {
            setProfile(data);
          }
        }
      } catch (err) {
        console.error("Error fetching session and profile:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session) {
        setUser(session.user);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    role: profile?.role || null,
    isAuthenticated: !!user,
  };
};

export default useAuth;
