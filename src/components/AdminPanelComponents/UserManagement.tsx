import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserPlus, UserMinus, Search, Pencil, Trash, FileText, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberRole } from "@/types/TeamMemberTypes";
import * as XLSX from 'xlsx';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: TeamMemberRole; // For position/seniority
  userType: 'user' | 'premium' | 'admin'; // For access level
  teams: string[];
  isActive: boolean;
}

// Function to format name from email
const formatNameFromEmail = (email: string): string => {
  const namePart = email.split('@')[0];
  // Replace periods and underscores with spaces
  const nameWithSpaces = namePart.replace(/[._]/g, ' ');
  // Title case each word
  return nameWithSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([
    { id: '1', name: 'M&A Team' },
    { id: '2', name: 'IP Tech Team' },
    { id: '3', name: 'Support Team' }
  ]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'Associate' as TeamMemberRole,
    userType: 'user' as 'user' | 'premium' | 'admin',
    teams: [] as string[],
    isActive: true
  });
  const [importData, setImportData] = useState<UserData[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  const { toast } = useToast();

  // Define the order of roles for sorting and display
  const memberRolesOrder: { [key in TeamMemberRole]: number } = {
    'Partner': 1,
    'Managing Associate': 2,
    'Senior Associate': 3,
    'Associate': 4,
    'Assistant': 5,
    'Other': 6
  };

  const memberRoles: TeamMemberRole[] = ['Partner', 'Managing Associate', 'Senior Associate', 'Associate', 'Assistant', 'Other'];

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        // Get profiles with roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          throw profilesError;
        }

        // Get team members data
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('*');
          
        if (teamMembersError) {
          throw teamMembersError;
        }

        // Map the data to our UserData type
        const mappedUsers = profiles.map(profile => {
          // Find matching team member record
          const teamMember = teamMembers.find(tm => tm.user_id === profile.id);
          
          // Format name if it looks like an email
          let formattedName = profile.name || '';
          if (formattedName.includes('@') || formattedName.includes('.')) {
            formattedName = formatNameFromEmail(formattedName);
          }
          
          // Default to reasonable values if no team member record exists
          return {
            id: profile.id,
            email: profile.email || '',
            name: formattedName,
            role: (teamMember?.role || profile.role || 'Other') as TeamMemberRole,
            userType: profile.role as 'user' | 'premium' | 'admin',
            teams: [], // We'll need to implement the teams table to properly populate this
            isActive: true // This would need to come from the auth.users table but that's not accessible via client-side API
          };
        });

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        
        // Fallback to mock data if the fetch fails
        setUsers([
          { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'Partner', userType: 'admin', teams: ['M&A Team'], isActive: true },
          { id: '2', email: 'user1@example.com', name: 'John Doe', role: 'Associate', userType: 'user', teams: ['IP Tech Team'], isActive: true },
          { id: '3', email: 'user2@example.com', name: 'Jane Smith', role: 'Senior Associate', userType: 'premium', teams: ['M&A Team', 'IP Tech Team'], isActive: true }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddDialog = () => {
    setFormData({
      email: '',
      name: '',
      role: 'Associate',
      userType: 'user',
      teams: [],
      isActive: true
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (user: UserData) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType,
      teams: user.teams,
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: UserData) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAddUser = async () => {
    if (!formData.email.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        user_metadata: { name: formData.name }
      });

      if (authError) {
        throw authError;
      }

      // User profile will be created automatically via trigger

      // Update team_members table
      if (authData?.user) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            user_id: authData.user.id,
            name: formData.name,
            position: formData.role,
            status: 'available',
            role: formData.role,
            projects: []
          });

        if (memberError) {
          throw memberError;
        }
        
        // Update profiles table with user type (admin, premium, user)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: formData.userType })
          .eq('id', authData.user.id);
          
        if (profileError) {
          throw profileError;
        }
      }

      // Update UI
      const newUser: UserData = {
        id: authData?.user?.id || `temp-${Date.now()}`,
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
        userType: formData.userType,
        teams: formData.teams,
        isActive: formData.isActive
      };

      setUsers(prev => [...prev, newUser]);
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Fallback to client-side only update for demo if Supabase admin functions aren't available
      if (error.message?.includes('not authorized')) {
        const newUser: UserData = {
          id: `temp-${Date.now()}`,
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          userType: formData.userType,
          teams: formData.teams,
          isActive: formData.isActive
        };

        setUsers(prev => [...prev, newUser]);
        setIsAddDialogOpen(false);
        
        toast({
          title: "Demo Mode",
          description: "User added in demo mode (admin functions not available)",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to create user: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleEditUser = async () => {
    if (!currentUser || !formData.email.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.userType,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) {
        throw profileError;
      }

      // Update team_members table
      const { error: memberError } = await supabase
        .from('team_members')
        .update({
          name: formData.name,
          role: formData.role,
          position: formData.role
        })
        .eq('user_id', currentUser.id);

      if (memberError) {
        throw memberError;
      }

      // Update UI
      setUsers(prev => 
        prev.map(user => user.id === currentUser.id ? {
          ...user,
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          userType: formData.userType,
          teams: formData.teams,
          isActive: formData.isActive
        } : user)
      );
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      
      // Fallback to client-side only update if Supabase update fails
      setUsers(prev => 
        prev.map(user => user.id === currentUser.id ? {
          ...user,
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          userType: formData.userType,
          teams: formData.teams,
          isActive: formData.isActive
        } : user)
      );
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Warning",
        description: `User updated in UI only: ${error.message || "Database update failed"}`,
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      // First delete the team_member entry
      const { error: memberError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', currentUser.id);
        
      if (memberError) {
        console.error("Error deleting team member:", memberError);
        // Continue anyway, as the user might not have a team member entry
      }
      
      // To properly delete a user, we would need admin access to delete from auth.users
      // For now, just delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUser.id);
        
      if (profileError) {
        throw profileError;
      }
      
      setUsers(prev => prev.filter(user => user.id !== currentUser.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "User Removed",
        description: "The user has been removed from the system",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = (userId: string, isActive: boolean) => {
    setUsers(prev => 
      prev.map(user => user.id === userId ? {
        ...user,
        isActive
      } : user)
    );
    
    toast({
      title: isActive ? "User Activated" : "User Deactivated",
      description: `User has been ${isActive ? "activated" : "deactivated"}`,
    });
  };

  const handleTeamToggle = (teamName: string) => {
    if (formData.teams.includes(teamName)) {
      setFormData({
        ...formData,
        teams: formData.teams.filter(t => t !== teamName)
      });
    } else {
      setFormData({
        ...formData, 
        teams: [...formData.teams, teamName]
      });
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform the data to our format
        const transformedData = jsonData.map((row: any) => {
          // Format name if it's email-like
          let name = row.name || row.Name || '';
          if (name.includes('@') || name.includes('.')) {
            name = formatNameFromEmail(name);
          }
          
          return {
            id: `temp-${Math.random().toString(36).substring(7)}`,
            email: row.email || row.Email || '',
            name: name,
            role: row.role || row.Role || 'Associate',
            userType: row.userType || row.UserType || 'user',
            teams: row.teams ? String(row.teams).split(',') : [],
            isActive: true
          };
        });
        
        setImportData(transformedData);
        setIsImportDialogOpen(true);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Error",
          description: "Failed to parse Excel file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsBinaryString(file);
  };
  
  const handleExportToExcel = () => {
    // Convert users to exportable format
    const exportData = users.map(user => ({
      Email: user.email,
      Name: user.name,
      Role: user.role,
      UserType: user.userType,
      Teams: user.teams.join(','),
      Active: user.isActive ? 'Yes' : 'No'
    }));
    
    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    
    // Generate file and trigger download
    XLSX.writeFile(wb, "Users.xlsx");
    
    toast({
      title: "Export Complete",
      description: "Users have been exported to Excel"
    });
  };
  
  const handleImportUsers = async () => {
    try {
      // Process each user for import
      let successCount = 0;
      
      for (const user of importData) {
        // First, create user in auth (this would typically be an admin function)
        // For demo, just add to state
        
        // In a production app, you would use supabase.auth.admin.createUser
        // and then create the profile and team_member entries
        
        successCount++;
      }
      
      // Add all to state for demo
      setUsers(prev => [...prev, ...importData]);
      
      setIsImportDialogOpen(false);
      setImportData([]);
      setImportFile(null);
      
      toast({
        title: "Import Complete",
        description: `${successCount} users have been imported`
      });
    } catch (error) {
      console.error("Error importing users:", error);
      toast({
        title: "Error",
        description: "Failed to import users",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              <Upload className="mr-1 h-4 w-4" /> Import
            </Button>
          </div>
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          <Button onClick={handleOpenAddDialog}>
            <UserPlus className="mr-1 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.userType === 'admin' ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Admin</span>
                      ) : user.userType === 'premium' ? (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Premium</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">User</span>
                      )}
                    </TableCell>
                    <TableCell>{user.teams.join(', ')}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.isActive} 
                        onCheckedChange={(checked) => toggleUserStatus(user.id, checked)} 
                        className={user.isActive ? "bg-green-500" : ""}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDeleteDialog(user)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user and assign them to teams.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => {
                  const email = e.target.value;
                  setFormData({
                    ...formData, 
                    email,
                    // Auto-format name from email if name field is empty
                    name: formData.name || formatNameFromEmail(email)
                  })
                }}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value as TeamMemberRole})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {memberRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userType">Access Level</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({...formData, userType: value as 'user' | 'premium' | 'admin'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Teams</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {teams.map(team => (
                  <Button
                    key={team.id}
                    type="button"
                    variant={formData.teams.includes(team.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTeamToggle(team.name)}
                    className={formData.teams.includes(team.name) ? "" : "text-muted-foreground"}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={checked => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="is-active">Account active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and team assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value as TeamMemberRole})}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {memberRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-userType">Access Level</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({...formData, userType: value as 'user' | 'premium' | 'admin'})}
              >
                <SelectTrigger id="edit-userType">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Teams</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {teams.map(team => (
                  <Button
                    key={team.id}
                    type="button"
                    variant={formData.teams.includes(team.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTeamToggle(team.name)}
                    className={formData.teams.includes(team.name) ? "" : "text-muted-foreground"}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-active"
                checked={formData.isActive}
                onCheckedChange={checked => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="edit-is-active">Account active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              User: <span className="font-medium">{currentUser?.name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Email: <span className="font-medium">{currentUser?.email}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Users Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Users from Excel</DialogTitle>
            <DialogDescription>
              Review the data before importing users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm mb-2">
              File: <span className="font-medium">{importFile?.name}</span>
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Access Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="max-h-64 overflow-auto">
                  {importData.slice(0, 10).map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.userType}</TableCell>
                    </TableRow>
                  ))}
                  {importData.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-2 text-sm text-muted-foreground">
                        ...and {importData.length - 10} more rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <p className="text-sm mt-4">
              Total users to import: <span className="font-medium">{importData.length}</span>
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportUsers}>
              Import Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
