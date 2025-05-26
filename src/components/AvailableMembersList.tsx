import React from "react";
import { Card } from "@/components/ui/card";
import { TeamMember } from "@/types/TeamMemberTypes";
import { Check } from "lucide-react";
interface AvailableMembersListProps {
  availableMembers: TeamMember[];
}
export function AvailableMembersList({
  availableMembers
}: AvailableMembersListProps) {
  return <Card className="p-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
        
        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">Available Team Members</span>
        <span className="text-sm font-normal text-muted-foreground ml-1">
          ({availableMembers.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {availableMembers.map(member => <div key={member.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3 transition-all hover:bg-white/10 hover:shadow-md group">
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[#D3E4FD] flex-shrink-0">
              {member.status === "available" ? <Check className="h-4 w-4 text-gray-700" /> : <span className="text-sm font-medium text-gray-700">{member.name.charAt(0)}</span>}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="font-medium text-sm truncate group-hover:text-[#D3E4FD]">
                {member.name}
              </div>
              <div className="text-xs text-muted-foreground truncate leading-tight">
                {member.position}
              </div>
            </div>
          </div>)}
      </div>
    </Card>;
}