import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, AlertCircle, ChevronDown, ArrowLeft, Shield, Building } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { CapacityTrackerWidget } from "@/components/CapacityTrackerWidget";
import { TeamMember } from "@/types/TeamMemberTypes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { TeamSelector } from "@/components/TeamSelector";
export function NavigationHeader({
  isAdmin,
  handleLogout,
  members,
  showTeamSelector = true,
  showWelcomeHeader = false,
  hideCapacityWidget = false
}: {
  isAdmin: boolean;
  members?: TeamMember[];
  handleLogout: () => Promise<void>;
  showTeamSelector?: boolean;
  showWelcomeHeader?: boolean;
  hideCapacityWidget?: boolean;
}) {
  const {
    isImpersonating,
    stopImpersonation
  } = useAuth();
  const [currentTeam, setCurrentTeam] = React.useState("Team Dashboard");

  // Listen to team selection events
  React.useEffect(() => {
    const handleTeamSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const {
        teamName
      } = customEvent.detail;
      setCurrentTeam(teamName || "Team Dashboard");
    };
    window.addEventListener('team-selected', handleTeamSelected as EventListener);

    // Try to get stored team name
    const storedTeamName = localStorage.getItem('selectedTeamName');
    if (storedTeamName) {
      setCurrentTeam(storedTeamName);
    }
    return () => {
      window.removeEventListener('team-selected', handleTeamSelected as EventListener);
    };
  }, []);
  return <div className="flex flex-col gap-12 px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 mx-auto w-full">
      <div className="flex items-center justify-between py-12 border-b pb-10">
        <div className="flex items-center gap-4">
          
          <div className="flex items-center">
            {showTeamSelector ? <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <div className="flex items-center bg-muted/30 hover:bg-muted rounded-full px-3 py-1.5 transition-colors duration-200">
                    <Building className="h-3.5 w-3.5 text-muted-foreground mr-2 opacity-70" />
                    <h1 className="text-sm font-medium">{currentTeam}</h1>
                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-1.5 mt-0.5 opacity-60" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[240px] bg-background border shadow-lg">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Select Team
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <TeamSelector userId={undefined} isAdmin={isAdmin} inDropdown={true} />
                </DropdownMenuContent>
              </DropdownMenu> : <h1 className="text-sm font-medium">Team Dashboard</h1>}
          </div>
        </div>

        {isImpersonating && <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Previewing as User
            <Button onClick={() => stopImpersonation?.()} variant="ghost" size="sm" className="ml-2 text-yellow-800 hover:bg-yellow-200">
              Exit Preview
            </Button>
          </div>}

        <div className="flex items-center space-x-5">
          {/* Only show capacity tracker when not hidden */}
          {!hideCapacityWidget && <CapacityTrackerWidget members={members} />}
          
          {isAdmin && <Button asChild variant="outline" size="sm" className="flex items-center gap-1">
              <Link to="/admin">
                <Shield className="h-4 w-4" /> Admin Dashboard
              </Link>
            </Button>}
          
          <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-1">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
      
      {/* Welcome header section */}
      {showWelcomeHeader && <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Snemble</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Manage your team members, track their availability, and keep everyone in sync with our 
            intuitive team management platform.
          </p>
        </div>}
    </div>;
}