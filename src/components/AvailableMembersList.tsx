
import React from "react";
import { Card } from "@/components/ui/card";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface AvailableMembersListProps {
  availableMembers: TeamMember[];
}

export function AvailableMembersList({ availableMembers }: AvailableMembersListProps) {
  return (
    <Card className="p-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-[#D3E4FD]" />
        <span className="text-gray-800">Available Team Members</span>
        <span className="text-sm font-normal text-muted-foreground ml-1">
          ({availableMembers.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {availableMembers.map((member) => (
          <div 
            key={member.id} 
            className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3 transition-all hover:bg-white/10 hover:shadow-md group"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#D3E4FD]/10 flex-shrink-0 text-sm font-medium">
              {member.name.charAt(0)}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="font-medium text-sm truncate group-hover:text-[#D3E4FD]">
                {member.name}
              </div>
              <div className="text-xs text-muted-foreground truncate leading-tight">
                {member.position}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
