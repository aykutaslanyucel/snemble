
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, Clock, Activity } from "lucide-react";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId?: string;
  isAdmin: boolean;
}

type SortField = "lastUpdated" | "name" | "capacity";
type SortDirection = "asc" | "desc";

// Function to get capacity score from status
const getCapacityScore = (status: any): number => {
  switch (status) {
    case "available": return 5;
    case "someAvailability": return 4;
    case "busy": return 3;
    case "seriouslyBusy": return 2;
    case "away": return 1;
    default: return 0;
  }
};

export function TeamMembers({ members, onUpdate, onDelete, currentUserId, isAdmin }: TeamMembersProps) {
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  console.log("TeamMembers component rendering:", { 
    membersCount: members.length,
    currentUserId,
    isAdmin
  });
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Toggle sort direction for current field
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };
  
  // Sort the members array based on current sort settings
  const sortedMembers = [...members].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === "lastUpdated") {
      comparison = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    } 
    else if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } 
    else if (sortField === "capacity") {
      comparison = getCapacityScore(b.status) - getCapacityScore(a.status);
    }
    
    return sortDirection === "asc" ? comparison * -1 : comparison;
  });
  
  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No team members found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Sorting Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select 
            value={`${sortField}-${sortDirection}`} 
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="lastUpdated-desc">Recently Updated</SelectItem>
                <SelectItem value="lastUpdated-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="capacity-desc">Highest Capacity</SelectItem>
                <SelectItem value="capacity-asc">Lowest Capacity</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleSortDirection}
            title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortDirection === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {sortField === "lastUpdated" && <Clock className="h-4 w-4 mr-1" />}
          {sortField === "name" && <ArrowDownAZ className="h-4 w-4 mr-1" />}
          {sortField === "capacity" && <Activity className="h-4 w-4 mr-1" />}
          <span>Sorted by: </span>
          <span className="font-medium">
            {sortField === "lastUpdated" && "Update time"}
            {sortField === "name" && "Name"}
            {sortField === "capacity" && "Capacity"}
          </span>
        </div>
      </div>
    
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ position: "static" }}
      >
        <AnimatePresence>
          {sortedMembers.map((member) => {
            // Simplified permission logic - admin can edit all, users can edit their own
            const canEdit = isAdmin || (member.user_id === currentUserId);
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="motion-div"
                style={{ 
                  position: "relative", 
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                <TeamMemberCard
                  member={member}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  canEdit={canEdit}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
