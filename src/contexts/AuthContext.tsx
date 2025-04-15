
import { createContext, useContext, useState, useEffect } from "react";

// Define the User type
interface User {
  id: string;
  email: string;
  role: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulate authentication functionality
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we'll consider any email ending with @snellman.com as valid
      if (!email.endsWith('@snellman.com')) {
        throw new Error('Invalid email domain');
      }
      
      // Create a user object
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        role: email === 'aykut.yucel@snellman.com' ? 'admin' : 'user'
      };
      
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin');
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: string = 'user') => {
    setLoading(true);
    try {
      // Simulate signup delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we'll consider any email ending with @snellman.com as valid
      if (!email.endsWith('@snellman.com')) {
        throw new Error('Invalid email domain');
      }
      
      // Create a user object
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        role: email === 'aykut.yucel@snellman.com' ? 'admin' : role
      };
      
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin');
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear user data
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check for existing user session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
