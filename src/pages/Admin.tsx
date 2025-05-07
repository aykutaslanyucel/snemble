import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { UserPlus, Users, LogOut, ArrowUpDown, Trash2, Download, Upload, Eye } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { getOrCreateTeamMemberForUser, deleteTeamMember } from "@/lib/teamMemberUtils";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  role: string;
  seniority: "Assistant" | "Junior Associate" | "Senior Associate" | "Managing Associate" | "Partner" | "Other";
  lastUpdated?: Date;
}

interface ExcelUser {
  name?: string;
  email: string;
  password?: string;
  role?: string;
  seniority?: string;
  action?: 'add' | 'update' | 'delete' | 'no_change' | 'error';
  error?: string;
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
  const [excelUsers, setExcelUsers] = useState<ExcelUser[]>([]);
  const [showPreview, setShowPreview] = useState(false);
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
        
        // Fallback to mock data with consistent UUIDs
        setUsers([
          {
            id: 'b82c63f6-1aa9-4150-a857-eeac0b9c921b',
            email: 'aykut.yucel@snellman.com',
            role: 'admin',
            seniority: 'Partner' as const, // FIXED: Changed from 'Partners' to 'Partner'
            lastUpdated: new Date(2023, 1, 15)
          },
          {
            id: '35fa5e15-e3f2-48c5-900d-63d17fae865c',
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
          "Assistant": 1,
          "Junior Associate": 2,
          "Senior Associate": 3,
          "Managing Associate": 4,
          "Partner": 5,
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
      
      // Update the team member role and position as well
      try {
        const { data: teamMember, error: teamMemberError } = await supabase
          .from('team_members')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (teamMemberError) {
          console.error("Error fetching team member:", teamMemberError);
        }
        
        if (teamMember) {
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ 
              role: newRole,
              position: newSeniority || teamMember.position // Directly use seniority as position
            })
            .eq('id', teamMember.id);
            
          if (updateError) {
            console.error("Error updating team member:", updateError);
          }
        }
      } catch (error) {
        console.error("Error updating team member:", error);
      }
      
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
        description: "User role and seniority updated successfully",
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
      // First find if there's a team member associated with this user
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (teamMemberError) {
        console.error("Error finding team member:", teamMemberError);
      }
      
      // If team member exists, delete it
      if (teamMember) {
        try {
          await deleteTeamMember(teamMember.id);
          console.log("Successfully deleted team member for user:", userId);
        } catch (error) {
          console.error("Error deleting team member:", error);
        }
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
      const formattedName = formatNameFromEmail(newUserEmail);
      
      // Insert into profiles table
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: newUserEmail,
          name: formattedName,
          role: 'user',
          seniority: 'Other',
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Call the signup function to create team member as well
      await signup(newUserEmail, newUserPassword, 'user');
      
      // Ensure team member is created
      await getOrCreateTeamMemberForUser(userId, newUserEmail, 'user');
      
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

  // Excel export functionality
  const exportToExcel = () => {
    const dataToExport = users.map(user => ({
      email: user.email,
      name: formatNameFromEmail(user.email),
      role: user.role,
      seniority: user.seniority,
      password: "" // Empty password field for template
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "snellman-users.xlsx");

    toast("Export successful", {
      description: "User data has been exported to Excel"
    });
  };

  // Excel import functionality
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet) as any[];

        // Process and validate the Excel data
        const processedData: ExcelUser[] = parsedData.map(row => {
          const user: ExcelUser = {
            email: row.email || '',
            name: row.name || formatNameFromEmail(row.email || ''),
            role: row.role || 'user',
            seniority: row.seniority || 'Other',
            password: row.password || '',
            action: 'no_change',
            error: ''
          };

          // Validate data
          if (!user.email) {
            user.action = 'error';
            user.error = 'Email is required';
            return user;
          }

          if (!user.email.endsWith('@snellman.com')) {
            user.action = 'error';
            user.error = 'Email must end with @snellman.com';
            return user;
          }

          // Validate role
          if (user.role && !['user', 'admin', 'premium'].includes(user.role)) {
            user.action = 'error';
            user.error = 'Role must be user, admin, or premium';
            return user;
          }

          // Validate seniority
          if (user.seniority && !['Assistant', 'Junior Associate', 'Senior Associate', 'Managing Associate', 'Partner', 'Other'].includes(user.seniority)) {
            user.action = 'error';
            user.error = 'Invalid seniority level';
            return user;
          }

          // Check if user exists
          const existingUser = users.find(u => u.email === user.email);
          if (existingUser) {
            user.action = 'update';
          } else {
            if (!user.password || user.password.length < 6) {
              user.action = 'error';
              user.error = 'New users require a password (min 6 characters)';
              return user;
            }
            user.action = 'add';
          }

          return user;
        });

        // Find users to delete (in DB but not in Excel)
        const emailsInExcel = processedData.map(u => u.email);
        const usersToDelete = users
          .filter(u => !emailsInExcel.includes(u.email))
          .map(u => ({
            email: u.email,
            name: formatNameFromEmail(u.email),
            role: u.role,
            seniority: u.seniority,
            action: 'delete' as const
          }));

        setExcelUsers([...processedData, ...usersToDelete]);
        setShowPreview(true);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        uiToast({
          title: "Error",
          description: "Failed to process Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const applyExcelChanges = async () => {
    setLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      // Process each user
      for (const excelUser of excelUsers) {
        if (excelUser.action === 'error' || excelUser.action === 'no_change') {
          continue;
        }

        try {
          if (excelUser.action === 'add') {
            // Create new user
            const userId = uuidv4();
            
            // Insert into profiles table
            await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: excelUser.email,
                name: excelUser.name,
                role: excelUser.role || 'user',
                seniority: excelUser.seniority || 'Other',
                updated_at: new Date().toISOString()
              });
            
            // Sign up user
            if (excelUser.password) {
              await signup(excelUser.email, excelUser.password, excelUser.role || 'user');
            }
            
            // Create team member
            await getOrCreateTeamMemberForUser(
              userId, 
              excelUser.email, 
              excelUser.role || 'user'
            );
            
            successCount++;
          } 
          else if (excelUser.action === 'update') {
            // Update existing user
            const existingUser = users.find(u => u.email === excelUser.email);
            
            if (existingUser) {
              const updates: any = {};
              if (excelUser.role) updates.role = excelUser.role;
              if (excelUser.seniority) updates.seniority = excelUser.seniority;
              if (excelUser.name) updates.name = excelUser.name;
              
              await supabase
                .from('profiles')
                .update(updates)
                .eq('id', existingUser.id);
              
              // Update team member
              const { data: teamMember } = await supabase
                .from('team_members')
                .select('*')
                .eq('user_id', existingUser.id)
                .maybeSingle();
                
              if (teamMember) {
                const teamUpdates: any = {};
                if (excelUser.role) teamUpdates.role = excelUser.role;
                if (excelUser.seniority) teamUpdates.position = excelUser.seniority;
                if (excelUser.name) teamUpdates.name = excelUser.name;
                
                await supabase
                  .from('team_members')
                  .update(teamUpdates)
                  .eq('id', teamMember.id);
              }
              
              successCount++;
            }
          }
          else if (excelUser.action === 'delete') {
            // Delete user
            const existingUser = users.find(u => u.email === excelUser.email);
            
            if (existingUser) {
              await handleDeleteUser(existingUser.id);
              successCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing ${excelUser.email}:`, error);
          errors.push(`${excelUser.email}: ${(error as Error).message}`);
        }
      }

      // Refresh user list
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');
        
      if (profiles) {
        const mappedUsers = profiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          role: profile.role || 'user',
          seniority: (profile.seniority as any) || 'Other',
          lastUpdated: profile.updated_at ? new Date(profile.updated_at) : new Date()
        }));
        
        setUsers(mappedUsers);
      }

      // Show success message
      toast("Import completed", {
        description: `Successfully processed ${successCount} users. ${errors.length > 0 ? `${errors.length} errors occurred.` : ''}`
      });

      setShowPreview(false);
    } catch (error) {
      console.error("Error applying changes:", error);
      uiToast({
        title: "Error",
        description: "Failed to apply changes from Excel import.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Users</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                <Upload className="h-4 w-4" />
                <span>Import from Excel</span>
              </div>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
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
                      onValueChange={(value) => handleRoleChange(user.id, value, user.seniority)}
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
                        <SelectItem value="Assistant">Assistant</SelectItem>
                        <SelectItem value="Junior Associate">Junior Associate</SelectItem>
                        <SelectItem value="Senior Associate">Senior Associate</SelectItem>
                        <SelectItem value="Managing Associate">Managing Associate</SelectItem>
                        <SelectItem value="Partner">Partner</SelectItem>
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

      {/* Excel import preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview Changes</DialogTitle>
            <DialogDescription>
              Review the changes before applying them to your user database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {excelUsers.map((user, index) => (
                  <TableRow key={index} className={user.action === 'error' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.seniority}</TableCell>
                    <TableCell>
                      {user.action === 'add' && <Badge className="bg-green-500">Add</Badge>}
                      {user.action === 'update' && <Badge className="bg-blue-500">Update</Badge>}
                      {user.action === 'delete' && <Badge className="bg-red-500">Delete</Badge>}
                      {user.action === 'error' && (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-red-500">Error</Badge>
                          <span className="text-xs text-red-500">{user.error}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button 
              onClick={applyExcelChanges} 
              disabled={excelUsers.every(u => u.action === 'error' || u.action === 'no_change')}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
