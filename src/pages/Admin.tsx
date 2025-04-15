
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { UserPlus, Users, LogOut, ArrowUpDown, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  seniority: "Other" | "Junior Associate" | "Senior Associate" | "Partners";
  lastUpdated?: Date;
}

type SortField = "lastUpdated" | "seniority" | "name";
type SortOrder = "asc" | "desc";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { user, isAdmin, signup } = useAuth();
  const { toast: uiToast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Mock data for demo purposes
  useEffect(() => {
    const mockUsers = [
      {
        id: '1',
        email: 'aykut.yucel@snellman.com',
        role: 'admin',
        seniority: 'Partners' as const,
        lastUpdated: new Date(2023, 1, 15)
      },
      {
        id: '2',
        email: 'klara.hasselberg@snellman.com',
        role: 'user',
        seniority: 'Senior Associate' as const,
        lastUpdated: new Date(2023, 2, 10)
      },
      {
        id: '3',
        email: 'test@snellman.com',
        role: 'user',
        seniority: 'Junior Associate' as const,
        lastUpdated: new Date(2023, 3, 5)
      }
    ];
    setUsers(mockUsers);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "lastUpdated":
        comparison = new Date(a.lastUpdated || 0).getTime() - new Date(b.lastUpdated || 0).getTime();
        break;
      case "seniority":
        const seniorityOrder = {
          "Other": 0,
          "Junior Associate": 1,
          "Senior Associate": 2,
          "Partners": 3,
        };
        comparison = seniorityOrder[a.seniority] - seniorityOrder[b.seniority];
        break;
      case "name":
        comparison = a.email.localeCompare(b.email);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleRoleChange = async (userId: string, newRole: string, newSeniority?: string) => {
    try {
      // Update the user in our mock data
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          role: newRole, 
          seniority: (newSeniority as any) || u.seniority,
          lastUpdated: new Date() 
        } : u
      ));
      
      toast("Success", {
        description: "User role updated successfully",
      });
    } catch (error) {
      uiToast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Remove the user from our mock data
      setUsers(users.filter(u => u.id !== userId));
      
      toast("Success", {
        description: "User deleted successfully",
      });
    } catch (error) {
      uiToast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.endsWith("@snellman.com")) {
      uiToast({
        title: "Invalid email domain",
        description: "Only @snellman.com email addresses are allowed",
        variant: "destructive",
      });
      return;
    }

    if (!newUserPassword || newUserPassword.length < 6) {
      uiToast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Add the user to our mock data
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        email: newUserEmail,
        role: 'user',
        seniority: 'Other' as const,
        lastUpdated: new Date()
      };
      
      setUsers([...users, newUser]);
      setNewUserEmail("");
      setNewUserPassword("");
      
      toast("Success", {
        description: "User added successfully",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      uiToast({
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
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <LogOut className="h-4 w-4" />
            Exit Dashboard
          </Button>
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
          <Input
            type="password"
            placeholder="Password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
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
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Email <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead onClick={() => handleSort("seniority")} className="cursor-pointer">
                Seniority <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead onClick={() => handleSort("lastUpdated")} className="cursor-pointer">
                Last Updated <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
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
                  <Select
                    value={user.seniority}
                    onValueChange={(value) => handleRoleChange(user.id, user.role, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select seniority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Junior Associate">Junior Associate</SelectItem>
                      <SelectItem value="Senior Associate">Senior Associate</SelectItem>
                      <SelectItem value="Partners">Partners</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
