import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/integrations/firebase/client";
import { supabase } from "@/integrations/supabase/client";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

type UserRole = "user" | "admin";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  position?: string;
  seniority?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  currentUserId: string | null;
  signup: (email: string, password: string, name: string, position: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setAsAdmin: (userId: string) => Promise<void>;
  getUsers: () => Promise<User[]>;
  createUser: (email: string, password: string, name: string, position: string, role?: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to format email as name
  const formatEmailAsName = (email: string) => {
    const namePart = email.split('@')[0];
    return namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  // Get or create user profile
  const getUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      // First check Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firebaseUser.uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching Supabase profile:", error);
      }

      // If profile exists in Supabase, return it
      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole,
          position: profile.position || profile.seniority,
          seniority: profile.seniority,
          avatar_url: profile.avatar_url
        };
      }

      // Otherwise, check Firestore
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        return {
          id: firebaseUser.uid,
          email: userData.email || firebaseUser.email,
          name: userData.name || formatEmailAsName(firebaseUser.email || ""),
          role: userData.role || "user",
          position: userData.position || "",
          avatar_url: userData.avatar_url
        };
      }

      // If no profile anywhere, create one in Firestore
      const newUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: formatEmailAsName(firebaseUser.email || ""),
        role: firebaseUser.uid === "b82c63f6-1aa9-4150-a857-eeac0b9c921b" ? "admin" : "user",
        position: "",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      // If email contains snellman.com, make them admin by default
      if (firebaseUser.email?.includes("snellman.com") || firebaseUser.uid === "b82c63f6-1aa9-4150-a857-eeac0b9c921b") {
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          role: "admin"
        });
        newUser.role = "admin";
      }

      return newUser;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const userProfile = await getUserProfile(firebaseUser);
          setUser(userProfile);
          
          // Ensure admin user is set correctly
          if (firebaseUser.uid === "b82c63f6-1aa9-4150-a857-eeac0b9c921b" && userProfile && userProfile.role !== "admin") {
            await updateDoc(doc(db, "users", firebaseUser.uid), { role: "admin" });
            setUser(prev => prev ? { ...prev, role: "admin" } : prev);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string, position: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user in Firestore with name and position
      await setDoc(doc(db, "users", firebaseUser.uid), {
        id: firebaseUser.uid,
        email: email,
        name: name,
        position: position,
        role: email.includes("snellman.com") ? "admin" : "user",
        createdAt: new Date().toISOString()
      });
      
      // Set user state
      setUser({
        id: firebaseUser.uid,
        email: email,
        name: name,
        position: position,
        role: email.includes("snellman.com") ? "admin" : "user"
      });

      // Create team member card for the new user
      try {
        const newMember = {
          id: firebaseUser.uid,
          name: name,
          position: position,
          status: "available",
          projects: [],
          lastUpdated: new Date(),
          role: email.includes("snellman.com") ? "admin" : "user",
          userId: firebaseUser.uid
        };
        
        await setDoc(doc(db, "teamMembers", firebaseUser.uid), newMember);
        toast({
          title: "Team member card created",
          description: "Your capacity card has been created successfully."
        });
      } catch (err) {
        console.error("Error creating team member card:", err);
        toast({
          title: "Error",
          description: "Failed to create capacity card",
          variant: "destructive"
        });
      }
      
      navigate("/");
    } catch (err: any) {
      setError(err.message);
      console.error("Signup error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
      console.error("Login error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await firebaseSignOut(auth);
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
      console.error("Logout error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, "users", user.id), data);
      setUser(prev => prev ? { ...prev, ...data } : prev);
    } catch (err: any) {
      console.error("Update user error:", err);
      throw err;
    }
  };

  const setAsAdmin = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: "admin" });
    } catch (err) {
      console.error("Set admin error:", err);
      throw err;
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      // First, try to get users from Supabase
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error("Error fetching Supabase users:", error);
        throw error;
      }

      // Convert to our User type
      const formattedUsers = supabaseUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        position: user.position || user.seniority,
        seniority: user.seniority,
        avatar_url: user.avatar_url
      }));

      return formattedUsers;
    } catch (err) {
      console.error("Get users error:", err);
      // Fallback to Firestore if Supabase fails
      return [];
    }
  };

  const createUser = async (email: string, password: string, name: string, position: string, role: UserRole = "user") => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        id: firebaseUser.uid,
        email: email,
        name: name,
        position: position,
        role: role,
        createdAt: new Date().toISOString()
      });
      
      // Create team member card for the new user
      try {
        const newMember = {
          id: firebaseUser.uid,
          name: name,
          position: position,
          status: "available",
          projects: [],
          lastUpdated: new Date(),
          role: role,
          userId: firebaseUser.uid
        };
        
        await setDoc(doc(db, "teamMembers", firebaseUser.uid), newMember);
        toast({
          title: "User created",
          description: `${name} has been added successfully with a capacity card.`
        });
      } catch (err) {
        console.error("Error creating team member card:", err);
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
