
import { motion, AnimatePresence } from "framer-motion";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId?: string;
  isAdmin: boolean;
}

export function TeamMembers({ members, onUpdate, onDelete, currentUserId, isAdmin }: TeamMembersProps) {
  console.log("TeamMembers component rendering:", { 
    membersCount: members.length,
    currentUserId,
    isAdmin
  });
  
  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No team members found.</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {members.map((member) => {
          // Simplified permission logic - admin can edit all, users can edit their own
          const canEdit = isAdmin || (member.user_id === currentUserId);
          
          console.log(`Member ${member.name}:`, {
            memberId: member.id,
            memberUserId: member.user_id,
            currentUserId,
            canEdit,
            isAdmin
          });
          
          return (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
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
    </motion.div>
  );
}
