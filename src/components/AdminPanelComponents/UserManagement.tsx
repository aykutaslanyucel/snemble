
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
import { User, UserPlus, UserMinus, Search, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  teams: string[];
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([
    { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin', teams: ['M&A Team'], isActive: true },
    { id: '2', email: 'user1@example.com', name: 'John Doe', role: 'member', teams: ['IP Tech Team'], isActive: true },
    { id: '3', email: 'user2@example.com', name: 'Jane Smith', role: 'member', teams: ['M&A Team', 'IP Tech Team'], isActive: true }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([
    { id: '1', name: 'M&A Team' },
    { id: '2', name: 'IP Tech Team' }
  ]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'member',
    teams: [] as string[],
    isActive: true
  });
  
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddDialog = () => {
    setFormData({
      email: '',
      name: '',
      role: 'member',
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
      teams: user.teams,
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: UserData) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAddUser = () => {
    if (!formData.email.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    const newUser: UserData = {
      id: `user-${Date.now()}`,
      email: formData.email.trim(),
      name: formData.name.trim(),
      role: formData.role,
      teams: formData.teams,
      isActive: formData.isActive
    };

    setUsers(prev => [...prev, newUser]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "User created successfully",
    });
  };

  const handleEditUser = () => {
    if (!currentUser || !formData.email.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => 
      prev.map(user => user.id === currentUser.id ? {
        ...user,
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
        teams: formData.teams,
        isActive: formData.isActive
      } : user)
    );
    
    setIsEditDialogOpen(false);
    
    toast({
      title: "Success",
      description: "User updated successfully",
    });
  };

  const handleDeleteUser = () => {
    if (!currentUser) return;
    
    setUsers(prev => prev.filter(user => user.id !== currentUser.id));
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "User Deleted",
      description: "The user has been removed",
    });
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
        <Button onClick={handleOpenAddDialog}>
          <UserPlus className="mr-1 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
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
                    <TableCell className="capitalize">{user.role}</TableCell>
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
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
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
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
    </div>
  );
}
