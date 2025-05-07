import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { getOrCreateTeamMemberForUser } from "@/lib/teamMemberUtils";
import { toast } from "sonner";

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
      
      // Use consistent UUIDs for specific test users for consistency with Supabase
      let userId;
      let userRole = 'user';
      
      if (email === 'aykut.yucel@snellman.com') {
        userId = "b82c63f6-1aa9-4150-a857-eeac0b9c921b"; // Fixed UUID for admin
        userRole = 'admin';
      } else if (email === 'klara.hasselberg@snellman.com') {
        userId = "35fa5e15-e3f2-48c5-900d-63d17fae865c"; // Updated UUID for Klara to match Supabase
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
      
      console.info("Login successful for:", newUser);
      
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin');
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Create or get team member for this user - with better error handling
      try {
        await getOrCreateTeamMemberForUser(newUser.id, newUser.email, newUser.role);
        console.log("Team member record confirmed for user:", newUser.id);
      } catch (error: any) {
        console.error("Error ensuring team member exists on login:", error);
        toast.error("Could not initialize your team profile", {
          description: "Please try refreshing the page."
        });
        // Don't throw here - allow login to succeed even if team member creation fails
        // We'll just log the error and let the user continue
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
      
      // Create or get team member for this user with enhanced error handling
      try {
        await getOrCreateTeamMemberForUser(newUser.id, newUser.email, newUser.role);
        console.log("Team member created for new user:", newUser.id);
      } catch (error: any) {
        console.error("Error creating team member on signup:", error);
        // Allow signup to continue even if team member creation fails
        // Just log the error for debugging
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
        console.info("Restored session for user:", parsedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin');
        
        // Create or get team member for this returning user with enhanced error handling
        getOrCreateTeamMemberForUser(parsedUser.id, parsedUser.email, parsedUser.role)
          .then(() => {
            console.log("Team member confirmed for returning user:", parsedUser.id);
          })
          .catch(error => {
            console.error("Error ensuring team member exists on session restore:", error);
            toast.error("Could not initialize your team profile", {
              description: "Please try refreshing the page."
            });
            // Continue with the session even if team member creation/verification fails
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
