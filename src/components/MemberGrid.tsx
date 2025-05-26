
import React from "react";
import { TeamMembers } from "@/components/TeamMembers";
import { TeamMember } from "@/types/TeamMemberTypes";
import { useAuth } from "@/contexts/AuthContext";

interface MemberGridProps {
  members: TeamMember[];
  onMemberUpdate: (id: string, data: Partial<TeamMember>) => Promise<void>;
  onMemberDelete: (id: string) => Promise<void>;
}

export function MemberGrid({ members, onMemberUpdate, onMemberDelete }: MemberGridProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <TeamMembers
      members={members}
      onUpdate={onMemberUpdate}
      onDelete={onMemberDelete}
      currentUserId={user?.id}
      isAdmin={isAdmin}
    />
  );
}
