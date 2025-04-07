import { FirebaseUser } from "@/types/FirebaseTypes";
import { User, UserRole } from "@/types/AuthTypes";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { supabase } from "@/integrations/supabase/client";

// Function to format email as name
export const formatEmailAsName = (email: string) => {
  const namePart = email.split('@')[0];
  return namePart
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Get or create user profile
export const getUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
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
        name: profile.name || "",
        role: (profile.role as UserRole) || "user",
        position: profile.seniority || "",
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
        email: userData.email || firebaseUser.email || "",
        name: userData.name || formatEmailAsName(firebaseUser.email || ""),
        role: (userData.role as UserRole) || "user",
        position: userData.position || "",
        avatar_url: userData.avatar_url
      };
    }

    // If no profile anywhere, create one in Firestore
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: formatEmailAsName(firebaseUser.email || ""),
      role: firebaseUser.uid === "b82c63f6-1aa9-4150-a857-eeac0b9c921b" ? "admin" : "user",
      position: "",
    };

    await setDoc(doc(db, "users", firebaseUser.uid), newUser);
    
    // If email contains snellman.com, make them admin by default
    if ((firebaseUser.email?.includes("snellman.com") || firebaseUser.uid === "b82c63f6-1aa9-4150-a857-eeac0b9c921b") 
        && newUser.role !== "admin") {
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

// Create a team member card
export const createTeamMemberCard = async (userId: string, name: string, position: string, role: UserRole = "user") => {
  try {
    const newMember = {
      id: userId,
      name: name,
      position: position,
      status: "available",
      projects: [],
      lastUpdated: new Date(),
      role: role,
      userId: userId
    };
    
    await setDoc(doc(db, "teamMembers", userId), newMember);
    return true;
  } catch (error) {
    console.error("Error creating team member card:", error);
    return false;
  }
};
