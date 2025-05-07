
// Add a isPremium property to the context
// This is just a small update to the existing AuthContext file

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean; // Add isPremium
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, role?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isPremium: false, // Add isPremium default
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false); // Add isPremium state

  useEffect(() => {
    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
        await fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    }

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsPremium(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      const userRole = data?.role || 'user';
      setIsAdmin(userRole === 'admin');
      setIsPremium(userRole === 'premium' || userRole === 'admin'); // Admins also get premium features
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: string = 'user') => {
    try {
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
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isPremium, // Add isPremium to context
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
