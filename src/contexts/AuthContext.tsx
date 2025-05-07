
import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useAuthTimeout } from '../hooks/useAuthTimeout';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean; 
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, role?: string) => Promise<any>;
  logout: () => Promise<void>;
  resetAuthState: () => void; // New function to reset auth state
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isPremium: false,
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
  resetAuthState: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  // Function to reset auth state when stuck
  const resetAuthState = useCallback(() => {
    console.log("Auth state reset triggered manually or by timeout");
    setLoading(false);
    toast.error("Authentication timeout occurred", {
      description: "Please try refreshing or logging in again"
    });
  }, []);
  
  // Use our auth timeout hook to prevent infinite loading
  useAuthTimeout(loading, resetAuthState, 10000); // Reduced timeout to 10s for faster recovery

  // Improved function to fetch user role with better error handling
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      const userRole = data?.role || 'user';
      setIsAdmin(userRole === 'admin');
      setIsPremium(userRole === 'premium' || userRole === 'admin');
      
      console.log(`User role set: ${userRole} (isAdmin: ${userRole === 'admin'}, isPremium: ${userRole === 'admin' || userRole === 'premium'})`);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    } finally {
      // Ensure loading is set to false even if there's an error
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("AuthContext initializing...");

    async function fetchSession() {
      try {
        console.log("Fetching initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (session && mounted) {
          console.log("Initial session found, user logged in");
          setSession(session);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          console.log("No initial session found, user not logged in");
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Exception in fetchSession:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log(`Auth state changed: ${_event}`);
        
        if (session) {
          console.log("Session available after auth state change");
          if (mounted) {
            setSession(session);
            setUser(session.user);
            // Use setTimeout to avoid potential Auth API deadlocks
            setTimeout(() => {
              if (mounted) {
                fetchUserRole(session.user.id);
              }
            }, 0);
          }
        } else {
          console.log("No session after auth state change");
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setIsPremium(false);
            setLoading(false);
          }
        }
      }
    );

    // Initialize session
    fetchSession();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      setLoading(false); // Ensure loading is reset on error
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: string = 'user') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      setLoading(false); // Ensure loading is reset on error
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false); // Always reset loading state after logout attempt
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isPremium,
    login,
    signup,
    logout,
    resetAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
