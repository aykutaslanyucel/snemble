import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Users } from "lucide-react";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, query, where } from "firebase/firestore";
import { useTheme } from "@/contexts/ThemeContext";

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, signup } = useAuth();
  const { toast } = useToast();
  const db = getFirestore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchUsers();
    setupInitialAdmin();
    
    // Create Klara's account
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
        // If user doesn't exist, create it
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
        // If user exists, ensure they're an admin
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole
      });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.endsWith("@snellman.com")) {
      toast({
        title: "Invalid email domain",
        description: "Only @snellman.com email addresses are allowed",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, "users", userId), {
        email: newUserEmail,
        role: "user",
      });
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
      setNewUserEmail("");
      fetchUsers(); // Refresh the users list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
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
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="flex gap-4">
          <Input
            type="email"
            placeholder="email@snellman.com"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
