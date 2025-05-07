
import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { getOrCreateTeamMemberForUser } from "@/lib/teamMemberUtils";

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

  // Generate a valid UUID that matches Supabase format
  const generateValidUUID = () => {
    // Generate a proper UUID v4
    return uuidv4();
  };

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
      
      // Use predefined UUIDs for specific test users for consistency
      let userId;
      if (email === 'aykut.yucel@snellman.com') {
        userId = "b82c63f6-1aa9-4150-a857-eeac0b9c921b"; // Fixed UUID for admin
      } else if (email === 'klara.hasselberg@snellman.com') {
        userId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // Fixed UUID for Klara
      } else if (email === 'test@snellman.com') {
        userId = "98765432-5717-4562-b3fc-2c963f66afa6"; // Fixed UUID for test user
      } else {
        userId = generateValidUUID(); // Generate valid UUID for other users
      }
      
      // Create a user object
      const newUser = {
        id: userId,
        email,
        role: email === 'aykut.yucel@snellman.com' ? 'admin' : 'user'
      };
      
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin');
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Create or get team member for this user
      try {
        await getOrCreateTeamMemberForUser(newUser.id, newUser.email, newUser.role);
      } catch (error) {
        console.error("Error ensuring team member exists on login:", error);
        throw error; // Re-throw to handle in the login flow
      }
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
      
      // Create a user object with a valid UUID
      const newUser = {
        id: generateValidUUID(),
        email,
        role: email === 'aykut.yucel@snellman.com' ? 'admin' : role
      };
      
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin');
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Create or get team member for this user
      try {
        await getOrCreateTeamMemberForUser(newUser.id, newUser.email, newUser.role);
      } catch (error) {
        console.error("Error ensuring team member exists on signup:", error);
        throw error; // Re-throw to handle in the signup flow
      }
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
        
        // Create or get team member for this returning user
        getOrCreateTeamMemberForUser(parsedUser.id, parsedUser.email, parsedUser.role)
          .catch(error => {
            console.error("Error ensuring team member exists on session restore:", error);
          });
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
