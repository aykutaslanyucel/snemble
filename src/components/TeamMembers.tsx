
import { motion, AnimatePresence } from "framer-motion";
import TeamMemberCard from "@/components/TeamMemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}

export function TeamMembers({ members, onUpdate, onDelete }: TeamMembersProps) {
  const { isAdmin, currentUserId } = useAuth();

  // Enhanced onUpdate and onDelete handlers that respect permissions
  const handleUpdate = (id: string, field: string, value: any) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    // Only allow editing if the user is the owner or an admin
    if (isAdmin || member.userId === currentUserId) {
      onUpdate(id, field, value);
    }
  };
  
  const handleDelete = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    // Only allow deletion if the user is the owner or an admin
    if (isAdmin || member.userId === currentUserId) {
      onDelete(id);
    }
  };

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {members.map((member) => (
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
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
