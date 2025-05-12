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
  resetAuthState: () => void;
  isImpersonating: boolean;
  impersonateUser?: (userId: string) => Promise<void>;
  stopImpersonation?: () => Promise<void>;
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
  isImpersonating: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);

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

  // Check if we're impersonating a user during initialization
  useEffect(() => {
    const originalUserId = localStorage.getItem('originalUserId');
    if (originalUserId) {
      setIsImpersonating(true);
    }
  }, []);

  // Check for impersonation query parameter
  useEffect(() => {
    const checkImpersonationParams = () => {
      const params = new URLSearchParams(window.location.search);
      const impersonateId = params.get('impersonate');
      
      if (impersonateId) {
        // Remove the query parameter but keep impersonating
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Manually fetch the impersonated user's profile
        const fetchImpersonatedUser = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', impersonateId)
              .single();
              
            if (error) throw error;
            
            if (data) {
              console.log("Impersonating user:", data);
              
              // Create a simulated user object
              const simulatedUser = {
                id: data.id,
                email: data.email,
                app_metadata: {
                  provider: "impersonated"
                },
                user_metadata: {
                  name: data.name,
                  role: data.role
                }
              } as User;
              
              // Set the user without a real session
              setUser(simulatedUser);
              setIsAdmin(data.role === 'admin');
              setIsPremium(data.role === 'premium' || data.role === 'admin');
              setIsImpersonating(true);
              setLoading(false);
            }
          } catch (error) {
            console.error("Error impersonating user:", error);
            resetAuthState();
          }
        };
        
        fetchImpersonatedUser();
      }
    };
    
    checkImpersonationParams();
  }, [resetAuthState]);

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
    // Skip normal auth flow if we're impersonating
    if (isImpersonating) {
      return;
    }

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
  }, [isImpersonating]);

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
      
      // If impersonating, return to original user instead of logging out
      if (isImpersonating) {
        localStorage.removeItem('originalUserId');
        setIsImpersonating(false);
        window.location.href = '/';
        return;
      }
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false); // Always reset loading state after logout attempt
    }
  };

  // Function to impersonate a user (admin only)
  const impersonateUser = async (userId: string) => {
    if (!user) throw new Error("You must be logged in to impersonate a user");
    
    try {
      // Store current user ID
      localStorage.setItem('originalUserId', user.id);
      
      // Set impersonation flag
      setIsImpersonating(true);
      
      // Redirect to impersonation URL
      window.location.href = `/?impersonate=${userId}`;
    } catch (error) {
      console.error("Error impersonating user:", error);
      throw error;
    }
  };
  
  // Function to stop impersonation
  const stopImpersonation = async () => {
    localStorage.removeItem('originalUserId');
    setIsImpersonating(false);
    window.location.href = '/';
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
    isImpersonating,
    impersonateUser,
    stopImpersonation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
