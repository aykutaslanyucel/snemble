
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, MoreHorizontal, Plus, Settings, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeamSelectorProps {
  userId?: string;
  isAdmin: boolean;
  inDropdown?: boolean;
}

export function TeamSelector({ userId, isAdmin, inDropdown = false }: TeamSelectorProps) {
  const [teams, setTeams] = useState<{ id: string; name: string; description?: string; is_default?: boolean }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string>("All Teams");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    is_default: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    // Get the team from local storage if available
    const storedTeamId = localStorage.getItem('selectedTeamId');
    const storedTeamName = localStorage.getItem('selectedTeamName');
    
    if (storedTeamId && storedTeamName) {
      setSelectedTeamId(storedTeamId);
      setSelectedTeamName(storedTeamName);
    }
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTeams(data);
        
        // If no team is selected yet, select the default one
        if (!selectedTeamId) {
          const defaultTeam = data.find(t => t.is_default);
          if (defaultTeam) {
            handleTeamSelect(defaultTeam.id, defaultTeam.name);
          }
        }
      } else {
        // If no teams exist yet, create a default one
        if (isAdmin) {
          createDefaultTeam();
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      // Fallback to mock data if fetch fails
      const mockTeams = [
        { id: '1', name: 'Main Team', is_default: true, description: 'Default team' },
        { id: '2', name: 'Tech Team', is_default: false, description: 'Technology team' },
        { id: '3', name: 'M&A Team', is_default: false, description: 'Mergers & Acquisitions team' }
      ];
      
      setTeams(mockTeams);
      
      if (!selectedTeamId) {
        const defaultTeam = mockTeams.find(t => t.is_default);
        if (defaultTeam) {
          handleTeamSelect(defaultTeam.id, defaultTeam.name);
        }
      }
    }
  };
  
  const createDefaultTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: 'Main Team',
          description: 'Default team',
          is_default: true
        });
        
      if (error) throw error;
      
      fetchTeams();
    } catch (error) {
      console.error("Error creating default team:", error);
    }
  };

  const handleTeamSelect = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    
    // Store in local storage
    localStorage.setItem('selectedTeamId', teamId);
    localStorage.setItem('selectedTeamName', teamName);
    
    // Dispatch a custom event that other components can listen to
    const event = new CustomEvent('team-selected', {
      detail: { teamId, teamName }
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Team Selected",
      description: `You are now viewing ${teamName}`,
    });
  };
  
  const handleSelectAllTeams = () => {
    setSelectedTeamId(null);
    setSelectedTeamName("All Teams");
    
    // Clear from local storage
    localStorage.removeItem('selectedTeamId');
    localStorage.removeItem('selectedTeamName');
    
    // Dispatch a custom event
    const event = new CustomEvent('team-selected', {
      detail: { teamId: null, teamName: "All Teams" }
    });
    window.dispatchEvent(event);
    
    toast({
      title: "All Teams Selected",
      description: "You are now viewing all teams"
    });
  };

  const handleCreateTeam = async () => {
    if (!formState.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: formState.name.trim(),
          description: formState.description.trim() || null,
          is_default: formState.is_default
        });
        
      if (error) throw error;
      
      toast({
        title: "Team Created",
        description: `${formState.name} has been created`
      });
      
      setIsCreateDialogOpen(false);
      setFormState({ name: '', description: '', is_default: false });
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    }
  };
  
  const handleEditTeam = async () => {
    if (!selectedTeamId || !formState.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: formState.name.trim(),
          description: formState.description.trim() || null,
          is_default: formState.is_default
        })
        .eq('id', selectedTeamId);
        
      if (error) throw error;
      
      toast({
        title: "Team Updated",
        description: `${formState.name} has been updated`
      });
      
      // Update local state if the current team was updated
      if (selectedTeamId === localStorage.getItem('selectedTeamId')) {
        setSelectedTeamName(formState.name);
        localStorage.setItem('selectedTeamName', formState.name);
      }
      
      setIsEditDialogOpen(false);
      setFormState({ name: '', description: '', is_default: false });
      fetchTeams();
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteTeam = async () => {
    if (!selectedTeamId) return;
    
    // Check if this is the default team
    const teamToDelete = teams.find(t => t.id === selectedTeamId);
    if (teamToDelete?.is_default) {
      toast({
        title: "Cannot Delete Default Team",
        description: "Please set another team as default first",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', selectedTeamId);
        
      if (error) throw error;
      
      toast({
        title: "Team Deleted",
        description: `${selectedTeamName} has been deleted`
      });
      
      // If the current team was deleted, reset to All Teams
      if (selectedTeamId === localStorage.getItem('selectedTeamId')) {
        handleSelectAllTeams();
      }
      
      setIsDeleteDialogOpen(false);
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    }
  };
  
  const openEditDialog = (team: { id: string; name: string; description?: string; is_default?: boolean }) => {
    setSelectedTeamId(team.id);
    setSelectedTeamName(team.name);
    setFormState({
      name: team.name,
      description: team.description || '',
      is_default: team.is_default || false
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (team: { id: string; name: string }) => {
    setSelectedTeamId(team.id);
    setSelectedTeamName(team.name);
    setIsDeleteDialogOpen(true);
  };
  
  // For dropdown version (inside the navigation menu)
  if (inDropdown) {
    return (
      <div className="px-2 py-1.5 text-sm">
        <p className="font-medium text-muted-foreground mb-2">Select Team</p>
        <div className="space-y-1">
          <Button
            variant={selectedTeamId === null ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={handleSelectAllTeams}
          >
            {selectedTeamId === null && (
              <Check className="mr-2 h-4 w-4" />
            )}
            All Teams
          </Button>
          
          {teams.map((team) => (
            <Button
              key={team.id}
              variant={selectedTeamId === team.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleTeamSelect(team.id, team.name)}
            >
              {selectedTeamId === team.id && (
                <Check className="mr-2 h-4 w-4" />
              )}
              {team.name}
              {team.is_default && (
                <span className="ml-auto text-xs text-muted-foreground">(Default)</span>
              )}
            </Button>
          ))}
        </div>
        
        {isAdmin && (
          <>
            <div className="my-2 border-t" />
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </>
        )}
      </div>
    );
  }
  
  // For standalone version
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Teams</h2>
        
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Button
          variant={selectedTeamId === null ? "default" : "outline"}
          className="w-full justify-between"
          onClick={handleSelectAllTeams}
        >
          All Teams
          {selectedTeamId === null && <Check className="h-4 w-4" />}
        </Button>
        
        {teams.map((team) => (
          <div key={team.id} className="flex items-center space-x-2">
            <Button
              variant={selectedTeamId === team.id ? "default" : "outline"}
              className="w-full justify-between"
              onClick={() => handleTeamSelect(team.id, team.name)}
            >
              <div className="flex items-center">
                {team.name}
                {team.is_default && (
                  <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>
                )}
              </div>
              {selectedTeamId === team.id && <Check className="h-4 w-4" />}
            </Button>
            
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(team)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Team
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => openDeleteDialog(team)}
                    className="text-red-600 focus:text-red-600"
                    disabled={team.is_default}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
      
      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to your organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
                placeholder="Enter team name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formState.description}
                onChange={(e) => setFormState({...formState, description: e.target.value})}
                placeholder="Brief description of this team"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formState.is_default}
                onChange={(e) => setFormState({...formState, is_default: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_default">Set as default team</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={formState.name}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={formState.description}
                onChange={(e) => setFormState({...formState, description: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_default"
                checked={formState.is_default}
                onChange={(e) => setFormState({...formState, is_default: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-is_default">Set as default team</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Team Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team?
            </DialogDescription>
          </DialogHeader>
          
          <p>
            Team: <strong>{selectedTeamName}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
