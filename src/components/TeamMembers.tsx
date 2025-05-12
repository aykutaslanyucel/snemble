
import React from "react";
import { MemberCard } from "@/components/MemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";
import { useAdminSettings } from "@/hooks/useAdminSettings";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId?: string;
  isAdmin: boolean;
}

export function TeamMembers({ members, onUpdate, onDelete, currentUserId, isAdmin }: TeamMembersProps) {
  const { getSetting } = useAdminSettings();
  
  // Default to true if settings are not available to prevent UI breakage
  const badgesEnabled = getSetting('badges_enabled', true);
  
  // Add error boundary fallback for individual member cards
  const handleMemberError = (member: TeamMember, error: Error) => {
    console.error(`Error rendering member ${member.name}:`, error);
    return null; // Skip rendering this member instead of breaking the whole list
  };
  
  if (!members || members.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No team members found.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
      {members.map((member) => {
        try {
          return (
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
              canEdit={member.user_id === currentUserId || isAdmin}
            />
          );
        } catch (error) {
          return handleMemberError(member, error as Error);
        }
      })}
    </div>
  );
}
