// Mock Supabase Client implementation for authentication and profiles query
const mockSession = {
  user: {
    id: "mock-admin-uuid-12345",
    email: "admin@assetflow.com",
    user_metadata: {
      full_name: "Admin User",
    },
  },
};

const mockProfile = {
  id: "mock-admin-uuid-12345",
  full_name: "Admin User",
  email: "admin@assetflow.com",
  department_id: 1,
  role: "admin",
  status: "Active",
};

export const supabase = {
  auth: {
    getSession: async () => {
      return { data: { session: mockSession }, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      // Allow any login with admin details for demo
      return { data: { session: mockSession, user: mockSession.user }, error: null };
    },
    signUp: async ({ email, password, options }) => {
      return { data: { session: mockSession, user: mockSession.user }, error: null };
    },
    signOut: async () => {
      return { error: null };
    },
    onAuthStateChange: (callback) => {
      // Fire signed in state immediately to load application
      callback("SIGNED_IN", mockSession);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },
  from: (table) => {
    return {
      select: (fields) => {
        return {
          eq: (field, value) => {
            return {
              single: async () => {
                if (table === "profiles") {
                  return { data: mockProfile, error: null };
                }
                return { data: null, error: { message: "Profile not found" } };
              },
            };
          },
        };
      },
    };
  },
};

export default supabase;
