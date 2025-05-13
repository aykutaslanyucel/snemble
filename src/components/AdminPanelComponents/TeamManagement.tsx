
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Cross2Icon, PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// For now we'll use mock data since we haven't created the teams table yet
interface Team {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  memberCount?: number;
  visibility?: 'all' | 'admin' | 'members';
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'M&A Team', description: 'Mergers and Acquisitions', isDefault: true, memberCount: 12, visibility: 'all' },
    { id: '2', name: 'IP Tech Team', description: 'Intellectual Property Technology', memberCount: 8, visibility: 'all' }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    visibility: 'all' as 'all' | 'admin' | 'members'
  });
  
  const { toast } = useToast();

  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      description: '',
      isDefault: false,
      visibility: 'all'
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (team: Team) => {
    setCurrentTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      isDefault: team.isDefault || false,
      visibility: team.visibility || 'all'
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (team: Team) => {
    setCurrentTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const handleAddTeam = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      isDefault: formData.isDefault,
      memberCount: 0,
      visibility: formData.visibility
    };

    setTeams(prev => [...prev, newTeam]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Team created successfully",
    });
  };

  const handleEditTeam = () => {
    if (!currentTeam || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    setTeams(prev => 
      prev.map(team => team.id === currentTeam.id ? {
        ...team,
        name: formData.name.trim(),
        description: formData.description.trim(),
        isDefault: formData.isDefault,
        visibility: formData.visibility
      } : team)
    );
    
    setIsEditDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Team updated successfully",
    });
  };

  const handleDeleteTeam = () => {
    if (!currentTeam) return;
    
    // Don't allow deleting the default team
    if (currentTeam.isDefault) {
      toast({
        title: "Error",
        description: "Cannot delete the default team",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    setTeams(prev => prev.filter(team => team.id !== currentTeam.id));
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Team Deleted",
      description: "The team has been removed",
    });
  };

  const setTeamAsDefault = (teamId: string) => {
    setTeams(prev => 
      prev.map(team => ({
        ...team,
        isDefault: team.id === teamId
      }))
    );
    
    toast({
      title: "Default Team Updated",
      description: "The default team has been changed",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Teams</h3>
        <Button onClick={handleOpenAddDialog}>
          <PlusIcon className="mr-1 h-4 w-4" /> Add Team
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
              </TableRow>
            ))
          ) : (
            teams.map(team => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell>{team.memberCount || 0}</TableCell>
                <TableCell>
                  {team.visibility === 'all' ? 'Everyone' : 
                   team.visibility === 'admin' ? 'Admins Only' : 
                   'Team Members Only'}
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={!!team.isDefault} 
                    onCheckedChange={() => team.isDefault ? null : setTeamAsDefault(team.id)}
                    disabled={team.isDefault}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenEditDialog(team)}
                    >
                      <Pencil1Icon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenDeleteDialog(team)}
                      disabled={team.isDefault}
                      className={team.isDefault ? "opacity-50 cursor-not-allowed" : "text-red-500 hover:text-red-600"}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Team Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>
              Create a new team and set its visibility permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Engineering Team"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe this team's purpose"
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="flex items-center space-x-2">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.visibility}
                  onChange={e => setFormData({...formData, visibility: e.target.value as 'all' | 'admin' | 'members'})}
                >
                  <option value="all">Everyone</option>
                  <option value="admin">Admins Only</option>
                  <option value="members">Team Members Only</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-default"
                checked={formData.isDefault}
                onCheckedChange={checked => setFormData({...formData, isDefault: checked})}
              />
              <Label htmlFor="is-default">Make this the default team</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam}>
              Add Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team details and visibility settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Engineering Team"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe this team's purpose"
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="flex items-center space-x-2">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.visibility}
                  onChange={e => setFormData({...formData, visibility: e.target.value as 'all' | 'admin' | 'members'})}
                >
                  <option value="all">Everyone</option>
                  <option value="admin">Admins Only</option>
                  <option value="members">Team Members Only</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-default"
                checked={formData.isDefault}
                onCheckedChange={checked => setFormData({...formData, isDefault: checked})}
                disabled={currentTeam?.isDefault}
              />
              <Label htmlFor="edit-is-default" className={currentTeam?.isDefault ? "text-muted-foreground" : ""}>
                {currentTeam?.isDefault ? "This is the default team" : "Make this the default team"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Team: <span className="font-medium">{currentTeam?.name}</span>
            </p>
            {currentTeam?.isDefault && (
              <p className="text-sm text-destructive mt-2">
                Cannot delete the default team. Make another team the default first.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTeam}
              disabled={currentTeam?.isDefault}
            >
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Team Visibility</h3>
          <p className="text-sm text-muted-foreground">
            Control which users can see which teams in the dashboard
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Everyone</Label>
                <p className="text-sm text-muted-foreground">
                  All users can see these teams
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {teams.filter(t => t.visibility === 'all').map(team => (
                  <div key={team.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{team.name}</span>
                    {team.isDefault && <span className="text-xs bg-primary/10 text-primary p-1 rounded">Default</span>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Admins Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only admin users can see these teams
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {teams.filter(t => t.visibility === 'admin').map(team => (
                  <div key={team.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{team.name}</span>
                    {team.isDefault && <span className="text-xs bg-primary/10 text-primary p-1 rounded">Default</span>}
                  </div>
                ))}
                {teams.filter(t => t.visibility === 'admin').length === 0 && (
                  <div className="text-sm text-muted-foreground italic">No teams set to admin-only visibility</div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Team Members Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only members of these teams can see them
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {teams.filter(t => t.visibility === 'members').map(team => (
                  <div key={team.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{team.name}</span>
                    {team.isDefault && <span className="text-xs bg-primary/10 text-primary p-1 rounded">Default</span>}
                  </div>
                ))}
                {teams.filter(t => t.visibility === 'members').length === 0 && (
                  <div className="text-sm text-muted-foreground italic">No teams set to members-only visibility</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Note: The default team is always visible to all users regardless of visibility settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
