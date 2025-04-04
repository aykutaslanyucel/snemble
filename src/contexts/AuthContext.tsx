
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  seniority?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  currentUserId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

// List of admin emails
const ADMIN_EMAILS = ['aykut.yucel@snellman.com'];
// Hard-coded admin user ID - this should be the ID of your admin user
const ADMIN_USER_ID = 'b82c63f6-1aa9-4150-a857-eeac0b9c921b';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      // First try Supabase profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // If no Supabase profile, check Firebase
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("id", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          return {
            id: userId,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            position: userData.position,
            avatar_url: userData.avatar_url
          };
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Check if user should be admin
  const checkIfAdmin = (userId: string, email: string | undefined): boolean => {
    // Check if user ID matches the admin ID
    if (userId === ADMIN_USER_ID) return true;
    
    // Check if email is in the admin list
    if (email && ADMIN_EMAILS.includes(email)) return true;
    
    return false;
  };

  // Set up auth state listener
  useEffect(() => {
    setLoading(true);

    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch user profile after auth state change
        if (currentSession?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
            
            // Also check for admin status
            const shouldBeAdmin = checkIfAdmin(currentSession.user.id, currentSession.user.email);
            if (shouldBeAdmin) {
              // Ensure user has admin role in Firebase
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("id", "==", currentSession.user.id));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const docRef = doc(db, "users", querySnapshot.docs[0].id);
                await setDoc(docRef, { role: 'admin' }, { merge: true });
              } else if (currentSession.user.email) {
                // Create admin user if doesn't exist
                await setDoc(doc(db, "users", currentSession.user.id), {
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  role: 'admin',
                  name: profileData?.name || "Admin User",
                  position: profileData?.position || "Partner",
                  lastUpdated: new Date()
                });
              }
              
              setIsAdmin(true);
            } else {
              // Check if user has admin role in Firebase
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("id", "==", currentSession.user.id));
              const querySnapshot = await getDocs(q);
              
              const isUserAdmin = !querySnapshot.empty && querySnapshot.docs[0].data().role === 'admin';
              setIsAdmin(profileData?.role === 'admin' || isUserAdmin);
            }
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then((data) => {
          setProfile(data);
          
          // Check if user should be admin
          const shouldBeAdmin = checkIfAdmin(currentSession.user.id, currentSession.user.email);
          if (shouldBeAdmin) {
            // Ensure user has admin role in Firebase
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("id", "==", currentSession.user.id));
            getDocs(q).then(async (querySnapshot) => {
              if (!querySnapshot.empty) {
                const docRef = doc(db, "users", querySnapshot.docs[0].id);
                await setDoc(docRef, { role: 'admin' }, { merge: true });
              } else if (currentSession.user.email) {
                // Create admin user if doesn't exist
                await setDoc(doc(db, "users", currentSession.user.id), {
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  role: 'admin',
                  name: data?.name || "Admin User",
                  position: data?.position || "Partner",
                  lastUpdated: new Date()
                });
              }
              
              setIsAdmin(true);
            });
          } else {
            // Check Firebase admin status
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("id", "==", currentSession.user.id));
            getDocs(q).then((querySnapshot) => {
              const isUserAdmin = !querySnapshot.empty && querySnapshot.docs[0].data().role === 'admin';
              setIsAdmin(data?.role === 'admin' || isUserAdmin);
            });
          }
        });
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Extract name from email
      const emailParts = email.split('@');
      let name = "";
      if (emailParts.length > 0 && emailParts[0].includes('.')) {
        const nameParts = emailParts[0].split('.');
        name = nameParts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }
      
      // Create user record in Firebase
      if (data.user) {
        try {
          // Check if user already exists in Firebase
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // Create new user record
            const isAdminEmail = ADMIN_EMAILS.includes(email);
            
            await setDoc(doc(db, "users", data.user.id), {
              id: data.user.id,
              email: email,
              name: name,
              role: isAdminEmail ? "admin" : "user",
              position: "Associate", // Default position
              seniority: "Other",
              lastUpdated: new Date()
            });
            
            // Create team member card for the new user
            await addDoc(collection(db, "teamMembers"), {
              name: name,
              position: "Associate", // Default position
              status: "available",
              projects: [],
              lastUpdated: new Date(),
              userId: data.user.id,
              role: "Associate"
            });
          }
        } catch (firebaseError) {
          console.error("Error creating user in Firebase:", firebaseError);
          // We don't throw here to avoid blocking the signup process
        }
      }
      
      toast.success("Account created successfully!");
      return data;
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
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      throw error;
    }
  };

  const currentUserId = user?.id || null;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      currentUserId,
      login,
      signup,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
