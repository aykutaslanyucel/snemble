
import React from "react";
import { MemberCard } from "@/components/MemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";
import { canEditTeamMember } from "@/lib/teamMemberUtils";
import { useAdminSettings } from "@/hooks/useAdminSettings";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId?: string;
  isAdmin: boolean;
}

export function TeamMembers({ members, onUpdate, onDelete, currentUserId, isAdmin }: TeamMembersProps) {
  const { settings } = useAdminSettings();
  const badgesEnabled = settings?.badges_enabled === undefined ? true : settings?.badges_enabled === true;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-3">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={{
            ...member,
            // Apply admin settings to control badge visibility
            customization: badgesEnabled ? member.customization : { ...member.customization, badge: undefined },
            // Ensure position is never "Junior Associate"
            position: member.position === "Junior Associate" ? "Associate" : member.position
          }}
          onUpdate={onUpdate}
          onDelete={onDelete}
          canEdit={canEditTeamMember(member, currentUserId, isAdmin)}
        />
      ))}
    </div>
  );
}
