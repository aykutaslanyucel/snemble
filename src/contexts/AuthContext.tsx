
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Auth provider initializing");
    
    // Check initial session
    const checkUser = async () => {
      try {
        console.log("Checking user session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setLoading(false);
          return;
        }
        
        if (!data.session) {
          console.log("No session found");
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const currentUser = data.session.user;
        console.log("Current user from session:", currentUser?.id);
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentUser.id)
              .single();
            
            if (profileError) {
              console.error("Profile fetch error:", profileError);
              setIsAdmin(false);
            } else {
              console.log("User profile data:", profileData);
              setIsAdmin(profileData?.role === 'admin');
            }
          } catch (profileErr) {
            console.error("Profile fetch exception:", profileErr);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    // Immediately run the check
    checkUser();

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setUser(session?.user || null);
        
        if (session?.user) {
          try {
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.error("Profile fetch error on auth change:", profileError);
              setIsAdmin(false);
            } else {
              console.log("User profile on auth change:", data);
              setIsAdmin(data?.role === 'admin');
            }
          } catch (profileErr) {
            console.error("Profile fetch exception on auth change:", profileErr);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Logged in successfully!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Check if email is allowed (only @snellman.com emails)
      if (!email.endsWith("@snellman.com")) {
        throw new Error("Only @snellman.com email addresses are allowed");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Create a profile record for the new user
        const isAdmin = email === "aykut.yucel@snellman.com";
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            role: isAdmin ? 'admin' : 'user',
            seniority: isAdmin ? 'Partners' : 'Other',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: email.split('@')[0]
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
      }
      
      toast.success("Account created successfully! Please check your email for verification.");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
