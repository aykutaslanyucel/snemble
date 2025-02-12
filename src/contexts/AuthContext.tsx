
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyApcg3_eIT5Dj_Z97238VTjFWj8-CqVJT0",
  authDomain: "aelion-94120.firebaseapp.com",
  projectId: "aelion-94120",
  storageBucket: "aelion-94120.appspot.com",
  messagingSenderId: "562716040878",
  appId: "1:562716040878:web:8a398f504c40010527d73f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const ensureAdminUser = async (email: string) => {
    if (email === "aykut.yucel@snellman.com") {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create the admin user if they don't exist
        const userId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, "users", userId), {
          email: email,
          role: "admin",
        });
        console.log("Created admin user:", email);
        return true;
      } else {
        const userData = querySnapshot.docs[0].data();
        if (userData.role !== "admin") {
          // Update to admin if not already
          await setDoc(doc(db, "users", querySnapshot.docs[0].id), {
            ...userData,
            role: "admin",
          });
          console.log("Updated user to admin:", email);
        }
        return true;
      }
    }
    return false;
  };

  const checkAdminStatus = async (email: string) => {
    console.log("Checking admin status for:", email);
    try {
      // First ensure admin user exists
      if (email === "aykut.yucel@snellman.com") {
        await ensureAdminUser(email);
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      console.log("User document exists:", !querySnapshot.empty);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("User role:", userData.role);
        return userData.role === "admin";
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const adminStatus = await checkAdminStatus(user.email!);
        console.log("Setting admin status to:", adminStatus);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await ensureAdminUser(email);
    const adminStatus = await checkAdminStatus(email);
    setIsAdmin(adminStatus);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
