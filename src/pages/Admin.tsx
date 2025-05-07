
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
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { user, isAdmin, signup } = useAuth();
  const { toast: uiToast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Fetch users from Supabase profiles table
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      try {
        // Fetch profiles from Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (profiles) {
          // Map profiles to User interface
          const mappedUsers = profiles.map(profile => ({
            id: profile.id,
            email: profile.email,
            role: profile.role || 'user',
            seniority: (profile.seniority as any) || 'Other',
            lastUpdated: profile.updated_at ? new Date(profile.updated_at) : new Date()
          }));
          
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        uiToast({
          title: "Error",
          description: "Failed to load users. Using demo data instead.",
          variant: "destructive",
        });
        
        // Fallback to mock data
        setUsers([
          {
            id: 'b82c63f6-1aa9-4150-a857-eeac0b9c921b',
            email: 'aykut.yucel@snellman.com',
            role: 'admin',
            seniority: 'Partners' as const,
            lastUpdated: new Date(2023, 1, 15)
          },
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            email: 'klara.hasselberg@snellman.com',
            role: 'user',
            seniority: 'Senior Associate' as const,
            lastUpdated: new Date(2023, 2, 10)
          },
          {
            id: '98765432-5717-4562-b3fc-2c963f66afa6',
            email: 'test@snellman.com',
            role: 'user',
            seniority: 'Junior Associate' as const,
            lastUpdated: new Date(2023, 3, 5)
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [uiToast]);

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
      // Update the profile in Supabase
      const updates: any = { role: newRole };
      if (newSeniority) updates.seniority = newSeniority;
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
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
      console.error("Error updating user role:", error);
      uiToast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete the user's team member entry first
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', userId);
        
      if (teamMemberError) {
        console.error("Error deleting team member:", teamMemberError);
        // Continue anyway to try to delete the profile
      }
      
      // Delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(u => u.id !== userId));
      
      toast("Success", {
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
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
      // Create a new user with a valid UUID
      const userId = uuidv4();
      
      // Insert into profiles table
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: newUserEmail,
          name: formatNameFromEmail(newUserEmail),
          role: 'user',
          seniority: 'Other',
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Call the signup function to create team member as well
      await signup(newUserEmail, newUserPassword, 'user');
      
      // Add to local state
      const newUser = {
        id: userId,
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

  // Helper function to format name from email
  const formatNameFromEmail = (email: string): string => {
    const namePart = email.split('@')[0];
    return namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
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
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading users...</p>
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
