
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole, AuthContextType } from "@/types/AuthTypes";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createTeamMemberCard, getUserProfile } from "@/utils/authUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to format user data from Supabase
  const formatUserData = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "",
      role: (supabaseUser.user_metadata?.role as UserRole) || "user",
      position: supabaseUser.user_metadata?.position || "",
    };
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession) {
          const formattedUser = formatUserData(currentSession.user);
          setUser(formattedUser);
          
          // Check if user exists in profiles table
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error);
              }
              
              if (data) {
                // Update user with profile data
                setUser(prev => prev ? {
                  ...prev,
                  name: data.name || prev.name,
                  role: (data.role as UserRole) || prev.role,
                  position: data.seniority || prev.position,
                  avatar_url: data.avatar_url
                } : prev);
              }
            } catch (err) {
              console.error("Error checking profile:", err);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession) {
        const formattedUser = formatUserData(currentSession.user);
        setUser(formattedUser);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, name: string, position: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            position,
            role: email.includes("snellman.com") ? "admin" : "user",
          }
        }
      });
      
      if (error) throw error;
      
      // Create profile entry if it doesn't exist
      if (data.user) {
        await createTeamMemberCard(data.user.id, name, position, email.includes("snellman.com") ? "admin" : "user");
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Signup error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      console.error("Login error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      console.error("Logout error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          position: data.position,
          role: data.role
        }
      });
      
      if (error) throw error;
      
      // Also update the profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          seniority: data.position,
          role: data.role
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      setUser(prev => prev ? { ...prev, ...data } : prev);
    } catch (err: any) {
      console.error("Update user error:", err);
      throw err;
    }
  };

  const setAsAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) throw error;
    } catch (err) {
      console.error("Set admin error:", err);
      throw err;
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      // Convert to our User type
      const formattedUsers = data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || "",
        role: (user.role as UserRole) || "user",
        position: user.seniority || "",
        seniority: user.seniority,
        avatar_url: user.avatar_url
      }));

      return formattedUsers;
    } catch (err) {
      console.error("Get users error:", err);
      return [];
    }
  };

  const createUser = async (email: string, password: string, name: string, position: string, role: UserRole = "user") => {
    setLoading(true);
    setError(null);
    
    try {
      // Admin creating a user - need to use admin functions through the backend
      // For now, just create via signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            position,
            role
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create a profile entry for the new user
        await createTeamMemberCard(data.user.id, name, position, role);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Create user error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const currentUserId = user?.id || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        currentUserId,
        signup,
        login,
        logout,
        updateUser,
        setAsAdmin,
        getUsers,
        createUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
