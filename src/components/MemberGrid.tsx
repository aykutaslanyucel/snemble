
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

  // Convert the onMemberUpdate function to match TeamMembers expected interface
  const handleUpdate = async (id: string, field: string, value: any) => {
    const updateData: Partial<TeamMember> = { [field]: value };
    await onMemberUpdate(id, updateData);
  };

  return (
    <TeamMembers
      members={members}
      onUpdate={handleUpdate}
      onDelete={onMemberDelete}
      currentUserId={user?.id}
      isAdmin={isAdmin}
    />
  );
}
