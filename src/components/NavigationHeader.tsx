
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, AlertCircle, ChevronDown, ArrowLeft, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { CapacityTrackerWidget } from "@/components/CapacityTrackerWidget";
import { TeamMember } from "@/types/TeamMemberTypes";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { TeamSelector } from "@/components/TeamSelector";

export function NavigationHeader({
  isAdmin,
  handleLogout,
  members,
  showTeamSelector = true,
  showWelcomeHeader = false,
  hideCapacityWidget = false,
}: {
  isAdmin: boolean;
  members?: TeamMember[];
  handleLogout: () => Promise<void>;
  showTeamSelector?: boolean;
  showWelcomeHeader?: boolean;
  hideCapacityWidget?: boolean;
}) {
  const { isImpersonating, stopImpersonation } = useAuth();

  return (
    <div className="flex flex-col gap-12 px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 mx-auto w-full">
      <div className="flex items-center justify-between py-12 border-b pb-10">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Team logo" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            {showTeamSelector ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <div className="flex items-center">
                    <h1 className="text-sm font-medium">Team Dashboard</h1>
                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-1 mt-0.5 opacity-60" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] bg-background border shadow-lg">
                  <TeamSelector userId={undefined} isAdmin={isAdmin} inDropdown={true} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="text-sm font-medium">Team Dashboard</h1>
            )}
          </div>
        </div>

        {isImpersonating && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Previewing as User
            <Button 
              onClick={() => stopImpersonation?.()} 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-yellow-800 hover:bg-yellow-200"
            >
              Exit Preview
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-5">
          {/* Only show capacity tracker when not hidden */}
          {!hideCapacityWidget && (
            <CapacityTrackerWidget members={members} />
          )}
          
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="flex items-center gap-1">
              <Link to="/admin">
                <Shield className="h-4 w-4" /> Admin Dashboard
              </Link>
            </Button>
          )}
          
          <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center gap-1">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
      
      {/* Welcome header section */}
      {showWelcomeHeader && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Snemble</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Manage your team members, track their availability, and keep everyone in sync with our 
            intuitive team management platform.
          </p>
        </div>
      )}
    </div>
  );
}
