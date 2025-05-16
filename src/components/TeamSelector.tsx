
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, ChevronDown } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export type Team = {
  id: string;
  name: string;
  description?: string;
  is_default?: boolean;
};

interface TeamSelectorProps {
  userId?: string;
  isAdmin: boolean;
  inDropdown?: boolean;
}

export function TeamSelector({ userId, isAdmin, inDropdown = false }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const { toast } = useToast();

  // Fetch teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        setIsLoading(true);
        
        // For now, let's use mock data since we didn't create the teams table yet
        // In a real implementation, we would query the teams table
        const mockTeams: Team[] = [
          { id: '1', name: 'M&A Team', description: 'Mergers and Acquisitions', is_default: true },
          { id: '2', name: 'IP Tech Team', description: 'Intellectual Property Technology' }
        ];
        
        setTeams(mockTeams);
        
        // Select default team
        const defaultTeam = mockTeams.find(team => team.is_default) || mockTeams[0];
        setSelectedTeam(defaultTeam);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeams();
  }, [toast]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, we would insert into the teams table
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined
      };

      // Update local state
      setTeams(prev => [...prev, newTeam]);
      setSelectedTeam(newTeam);
      
      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewTeamName("");
      setNewTeamDescription("");
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    // In a real implementation, we might update user preferences or fetch team-specific data
    
    // Add state update for current team to update the UI
    localStorage.setItem('currentTeam', JSON.stringify(team));
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse text-sm text-muted-foreground py-2 px-3">
        Loading teams...
      </div>
    );
  }

  // If the component is rendered inside a dropdown, use a simplified version
  if (inDropdown) {
    return (
      <>
        {teams.map((team) => (
          <div
            key={team.id}
            className={`px-3 py-2 cursor-pointer hover:bg-muted ${selectedTeam?.id === team.id ? "bg-muted" : ""}`}
            onClick={() => handleSelectTeam(team)}
          >
            {team.name}
            {team.description && (
              <p className="text-xs text-muted-foreground">{team.description}</p>
            )}
          </div>
        ))}
        
        {isAdmin && (
          <div
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-3 py-2 cursor-pointer hover:bg-muted text-primary flex items-center border-t"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Team
          </div>
        )}

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
                <Label htmlFor="team-name">Team Name</Label>
                <Input 
                  id="team-name" 
                  value={newTeamName} 
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Marketing Team" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="team-description">Description (optional)</Label>
                <Input 
                  id="team-description" 
                  value={newTeamDescription} 
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Brief description of the team" 
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Original component rendering for standalone usage
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border border-muted">
            <Users className="mr-2 h-4 w-4" />
            {selectedTeam?.name || "Select Team"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {teams.map((team) => (
            <DropdownMenuItem 
              key={team.id}
              className={selectedTeam?.id === team.id ? "bg-muted" : ""}
              onClick={() => handleSelectTeam(team)}
            >
              {team.name}
            </DropdownMenuItem>
          ))}
          
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsCreateDialogOpen(true)}
                className="text-primary"
              >
                <Plus className="mr-2 h-4 w-4" /> Create New Team
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
              <Label htmlFor="team-name">Team Name</Label>
              <Input 
                id="team-name" 
                value={newTeamName} 
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Marketing Team" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="team-description">Description (optional)</Label>
              <Input 
                id="team-description" 
                value={newTeamDescription} 
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="Brief description of the team" 
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTeam}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
