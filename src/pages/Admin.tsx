
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, LogOut, UserPlus } from "lucide-react";
import { collection, getDocs, doc, setDoc, updateDoc, query, where, deleteDoc, addDoc } from "firebase/firestore";
import { useTheme } from "@/contexts/ThemeContext";
import { UserTable } from "@/components/Admin/UserTable";
import { UserForm } from "@/components/Admin/UserForm";
import { db } from "@/integrations/firebase/client";
import { TeamMemberRole } from "@/types/TeamMemberTypes";

interface User {
  id: string;
  email: string;
  role: string;
  seniority: string;
  lastUpdated: Date;
  name?: string;
  position?: string;
}

type SortField = "lastUpdated" | "seniority" | "name";
type SortOrder = "asc" | "desc";

// Admin user data
const ADMIN_USER = {
  email: "aykut.yucel@snellman.com",
  role: "admin",
  name: "Aykut Yucel",
  position: "Partner",
  seniority: "Partners",
  lastUpdated: new Date()
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { user, isAdmin, signup } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    setupInitialAdmin();
  }, []);

  const setupInitialAdmin = async () => {
    try {
      // Admin user ID from current page
      const adminId = 'b82c63f6-1aa9-4150-a857-eeac0b9c921b';
      
      // Check if admin user exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", adminId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create admin user if doesn't exist
        await setDoc(doc(db, "users", adminId), {
          id: adminId,
          ...ADMIN_USER
        });
        
        // Create team member card for admin
        await addDoc(collection(db, "teamMembers"), {
          name: ADMIN_USER.name,
          position: ADMIN_USER.position,
          status: "available",
          projects: [],
          lastUpdated: new Date(),
          userId: adminId,
          role: ADMIN_USER.position as TeamMemberRole
        });
        
        toast({
          title: "Success",
          description: "Admin user created successfully",
        });
      } else {
        const userDoc = querySnapshot.docs[0];
        if (userDoc.data().role !== "admin") {
          await updateDoc(doc(db, "users", userDoc.id), {
            role: "admin",
            position: userDoc.data().position || "Partner"
          });
          toast({
            title: "Success",
            description: "User role updated to admin successfully",
          });
        }
        
        // Check if admin has a team member card
        const teamMembersRef = collection(db, "teamMembers");
        const teamQ = query(teamMembersRef, where("userId", "==", adminId));
        const teamQuerySnapshot = await getDocs(teamQ);
        
        if (teamQuerySnapshot.empty) {
          // Create team member card for admin if it doesn't exist
          await addDoc(collection(db, "teamMembers"), {
            name: userDoc.data().name || ADMIN_USER.name,
            position: userDoc.data().position || ADMIN_USER.position,
            status: "available",
            projects: [],
            lastUpdated: new Date(),
            userId: adminId,
            role: userDoc.data().position || ADMIN_USER.position
          });
          
          toast({
            title: "Success",
            description: "Admin team member card created successfully",
          });
        }
      }
      
      // Check for Aykut's email
      const emailQ = query(usersRef, where("email", "==", ADMIN_USER.email));
      const emailQuerySnapshot = await getDocs(emailQ);
      
      if (emailQuerySnapshot.empty) {
        // Create second admin entry with Aykut's email if it doesn't exist
        const newAdminId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, "users", newAdminId), {
          id: newAdminId,
          ...ADMIN_USER,
          lastUpdated: new Date()
        });
        
        // Create team member card
        await addDoc(collection(db, "teamMembers"), {
          name: ADMIN_USER.name,
          position: ADMIN_USER.position,
          status: "available",
          projects: [],
          lastUpdated: new Date(),
          userId: newAdminId,
          role: ADMIN_USER.position as TeamMemberRole
        });
      }
      
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error setting up admin:", error);
      toast({
        title: "Error",
        description: "Failed to setup admin user",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      } as User));
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (email: string, password: string, name: string, position: string, role: string = "user") => {
    setLoading(true);
    try {
      // Create the user account
      await signup(email, password);
      
      // Find the newly created user
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        
        // Update user with additional details
        await updateDoc(doc(db, "users", userId), {
          name: name,
          position: position,
          role: role,
          lastUpdated: new Date()
        });
        
        // Check if user already has a team member card
        const teamMembersRef = collection(db, "teamMembers");
        const teamQ = query(teamMembersRef, where("userId", "==", userId));
        const teamQuerySnapshot = await getDocs(teamQ);
        
        if (teamQuerySnapshot.empty) {
          // Create a team member card for the new user if one doesn't exist
          await addDoc(collection(db, "teamMembers"), {
            name: name,
            position: position,
            status: "available",
            projects: [],
            lastUpdated: new Date(),
            userId: userId,
            role: position as TeamMemberRole
          });
        }
      }
      
      fetchUsers(); // Refresh the users list
      toast({
        title: "Success",
        description: "User added and team member card created successfully",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const createTeamMemberForUser = async (userId: string, userData: any) => {
    try {
      // Check if user already has a team member card
      const teamMembersRef = collection(db, "teamMembers");
      const q = query(teamMembersRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create a new team member card
        await addDoc(collection(db, "teamMembers"), {
          name: userData.name || userData.email.split('@')[0],
          position: userData.position || "Associate",
          status: "available",
          projects: [],
          lastUpdated: new Date(),
          userId: userId,
          role: userData.position as TeamMemberRole || "Associate"
        });
        
        toast({
          title: "Success",
          description: "Team member card created for user",
        });
      }
    } catch (error) {
      console.error("Error creating team member card:", error);
      toast({
        title: "Error",
        description: "Failed to create team member card",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Choose theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <span className="text-muted-foreground">
              Total Users: {users.length}
            </span>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <LogOut className="h-4 w-4" />
            Exit Dashboard
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <UserForm onAddUser={handleAddUser} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => {
              users.forEach(user => createTeamMemberForUser(user.id, user));
            }}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create Missing Team Member Cards
          </Button>
        </div>
        <UserTable 
          users={users}
          fetchUsers={fetchUsers}
          sortField={sortField}
          sortOrder={sortOrder}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
        />
      </Card>
    </div>
  );
}
