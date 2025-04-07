import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole, AuthContextType } from "@/types/AuthTypes";
import { db } from "@/integrations/firebase/client";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, formatEmailAsName, createTeamMemberCard } from "@/utils/authUtils";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getAuth
} from "firebase/auth";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      const userData: User = {
        id: firebaseUser.uid,
        email: email,
        name: name,
        position: position,
        role: email.includes("snellman.com") ? "admin" : "user",
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        createdAt: new Date().toISOString()
      });
      
      // Set user state
      setUser(userData);

      // Create team member card for the new user
      try {
        const success = await createTeamMemberCard(
          firebaseUser.uid, 
          name, 
          position, 
          email.includes("snellman.com") ? "admin" : "user"
        );
        
        if (success) {
          toast({
            title: "Team member card created",
            description: "Your capacity card has been created successfully."
          });
        }
      } catch (err) {
        console.error("Error creating team member card:", err);
        toast({
          title: "Error",
          description: "Failed to create capacity card",
          variant: "destructive"
        });
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
      await signInWithEmailAndPassword(auth, email, password);
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
      await firebaseSignOut(auth);
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
        name: user.name || "",
        role: (user.role as UserRole) || "user",
        position: user.seniority || "",
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
      const userData: User = {
        id: firebaseUser.uid,
        email: email,
        name: name,
        position: position,
        role: role,
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        createdAt: new Date().toISOString()
      });
      
      // Create team member card for the new user
      try {
        await createTeamMemberCard(firebaseUser.uid, name, position, role);
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
