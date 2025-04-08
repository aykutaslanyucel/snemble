
import { motion, AnimatePresence } from "framer-motion";
import TeamMemberCard from "@/components/TeamMemberCard";
import { TeamMember } from "@/types/TeamMemberTypes";

interface TeamMembersProps {
  members: TeamMember[];
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}

export function TeamMembers({ members, onUpdate, onDelete }: TeamMembersProps) {
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
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
