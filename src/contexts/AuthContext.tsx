
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
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          
          if (data) {
            setIsAdmin(data.role === 'admin');
          }
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        
        if (data) {
          setIsAdmin(data.role === 'admin');
        }
      }
      
      setLoading(false);
    };

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
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
    }
  };

  const signup = async (email: string, password: string) => {
    try {
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
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
