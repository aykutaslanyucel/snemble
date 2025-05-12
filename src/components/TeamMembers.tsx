
import React, { useState } from "react";
import { MemberCard } from "@/components/MemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { ErrorBoundary } from "react-error-boundary";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId?: string;
  isAdmin: boolean;
}

function ErrorFallback({ error, resetErrorBoundary, memberName }: 
  { error: Error, resetErrorBoundary: () => void, memberName: string }) {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
      <p className="font-semibold">Error rendering team member card: {memberName}</p>
      <p className="text-sm my-2">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm"
      >
        Try again
      </button>
    </div>
  );
}

export function TeamMembers({ members, onUpdate, onDelete, currentUserId, isAdmin }: TeamMembersProps) {
  const { getSetting } = useAdminSettings();
  const [failedMembers, setFailedMembers] = useState<string[]>([]);
  
  // Default to true if settings are not available to prevent UI breakage
  const badgesEnabled = getSetting('badges_enabled', true);
  
  // Add error boundary fallback for individual member cards
  const handleMemberError = (member: TeamMember, error: Error) => {
    console.error(`Error rendering member ${member.name}:`, error);
    
    // Track which members failed to render
    if (!failedMembers.includes(member.id || '')) {
      setFailedMembers(prev => [...prev, member.id || '']);
    }
    
    return (
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={() => {
              setFailedMembers(prev => prev.filter(id => id !== member.id));
              resetErrorBoundary();
            }} 
            memberName={member.name} 
          />
        )}
        key={member.id}
        onReset={() => {
          setFailedMembers(prev => prev.filter(id => id !== member.id));
        }}
      >
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <p className="font-medium">{member.name}</p>
          <p className="text-sm text-red-700">This card failed to render properly</p>
        </div>
      </ErrorBoundary>
    );
  };
  
  if (!members || members.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No team members found.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
      {members.map((member) => {
        try {
          // Skip rendering already failed members
          if (failedMembers.includes(member.id || '')) {
            return handleMemberError(member, new Error("Previous render failed"));
          }
          
          return (
            <ErrorBoundary
              FallbackComponent={({ error, resetErrorBoundary }) => (
                <ErrorFallback 
                  error={error} 
                  resetErrorBoundary={resetErrorBoundary} 
                  memberName={member.name} 
                />
              )}
              key={member.id}
              onError={(error) => console.error(`Error rendering ${member.name}:`, error)}
            >
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
                canEdit={isAdmin || (currentUserId && member.user_id === currentUserId)}
              />
            </ErrorBoundary>
          );
        } catch (error) {
          return handleMemberError(member, error as Error);
        }
      })}
    </div>
  );
}
