
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  seniority?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    setLoading(true);

    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch user profile after auth state change
        if (currentSession?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
            setIsAdmin(profileData?.role === 'admin');
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then((data) => {
          setProfile(data);
          setIsAdmin(data?.role === 'admin');
        });
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      toast.success("Logged in successfully!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in. Please check your credentials.");
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Microsoft login error:", error);
      toast.error(error.message || "Failed to log in with Microsoft. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      login,
      signup,
      loginWithMicrosoft,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
