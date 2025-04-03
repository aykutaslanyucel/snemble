
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
import { Users, LogOut } from "lucide-react";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, query, where, deleteDoc } from "firebase/firestore";
import { useTheme } from "@/contexts/ThemeContext";
import { UserTable } from "@/components/Admin/UserTable";
import { UserForm } from "@/components/Admin/UserForm";
import { firebaseApp } from "@/integrations/firebase/client";

interface User {
  id: string;
  email: string;
  role: string;
  seniority: "Other" | "Junior Associate" | "Senior Associate" | "Partners";
  lastUpdated: Date;
}

type SortField = "lastUpdated" | "seniority" | "name";
type SortOrder = "asc" | "desc";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { user, isAdmin, signup } = useAuth();
  const { toast } = useToast();
  const db = getFirestore(firebaseApp);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    setupInitialAdmin();
    
    const createKlaraAccount = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", "klara.hasselberg@snellman.com"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          await signup("klara.hasselberg@snellman.com", "test123");
          console.log("Created account for Klara");
          toast({
            title: "Success",
            description: "Created account for Klara",
          });
        } else {
          console.log("Klara's account already exists");
        }
      } catch (error) {
        console.error("Error creating Klara's account:", error);
        if (error instanceof Error && error.message.includes("already")) {
          console.log("Klara's account already exists");
        } else {
          toast({
            title: "Error",
            description: "Failed to create Klara's account",
            variant: "destructive",
          });
        }
      }
    };
    
    createKlaraAccount();
  }, []);

  const setupInitialAdmin = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", "aykut.yucel@snellman.com"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const userId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, "users", userId), {
          email: "aykut.yucel@snellman.com",
          role: "admin",
        });
        toast({
          title: "Success",
          description: "Admin user created successfully",
        });
      } else {
        const userDoc = querySnapshot.docs[0];
        if (userDoc.data().role !== "admin") {
          await updateDoc(doc(db, "users", userDoc.id), {
            role: "admin"
          });
          toast({
            title: "Success",
            description: "User role updated to admin successfully",
          });
        }
      }
      fetchUsers(); // Refresh the users list
    } catch (error) {
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
        ...doc.data()
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

  const handleAddUser = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signup(email, password);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error adding user:", error);
    }
    setLoading(false);
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
