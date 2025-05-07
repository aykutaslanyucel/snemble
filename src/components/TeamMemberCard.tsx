
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/animations.css";

// Import our new components
import { MemberCardHeader } from "@/components/TeamMember/MemberCardHeader";
import { MemberCardContent } from "@/components/TeamMember/MemberCardContent";
import { ProjectsDialog } from "@/components/TeamMember/ProjectsDialog";
import { DeleteConfirmationDialog } from "@/components/TeamMember/DeleteConfirmationDialog";
import { CustomizerDialog } from "@/components/TeamMember/CustomizerDialog";
import { getCardBackground } from "@/components/TeamMember/CardBackground";

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
}

export function TeamMemberCard({ member, onUpdate, onDelete, canEdit }: TeamMemberCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(member.name);
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [projects, setProjects] = useState(member.projects.join(", "));
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const { isPremium } = useAuth();
  
  const handleStatusChange = (status: TeamMemberStatus) => {
    if (status === member.status) return; // No change
    
    // Update status with optimistic UI update
    onUpdate(member.id!, "status", status);
  };

  const handleNameChange = () => {
    if (name !== member.name) {
      onUpdate(member.id!, "name", name);
    }
    setIsEditingName(false);
  };

  const handleProjectsChange = () => {
    const newProjects = projects
      .split(/[,;]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    if (JSON.stringify(newProjects) !== JSON.stringify(member.projects)) {
      onUpdate(member.id!, "projects", newProjects);
    }
    setIsEditingProjects(false);
  };

  const handleDeleteMember = () => {
    onDelete(member.id!);
    setIsConfirmingDelete(false);
  };

  const cardStyle = getCardBackground(member);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
    >
      <Card 
        className={`h-full border dark:border-gray-800 ${cardStyle.className}`}
        style={{ background: cardStyle.background }}
      >
        <MemberCardHeader 
          name={member.name}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          nameValue={name}
          setNameValue={setName}
          handleNameChange={handleNameChange}
          canEdit={canEdit}
          isPremium={isPremium}
          onEditProjects={() => setIsEditingProjects(true)}
          onCustomize={() => setShowCustomizer(true)}
          onDelete={() => setIsConfirmingDelete(true)}
        />
        
        <MemberCardContent 
          position={member.position}
          projects={member.projects}
          canEdit={canEdit}
          onStatusChange={handleStatusChange}
          currentStatus={member.status}
        />
      </Card>

      <ProjectsDialog 
        isOpen={isEditingProjects}
        setIsOpen={setIsEditingProjects}
        projects={projects}
        setProjects={setProjects}
        onSave={handleProjectsChange}
      />

      <DeleteConfirmationDialog 
        isOpen={isConfirmingDelete}
        setIsOpen={setIsConfirmingDelete}
        memberName={member.name}
        onConfirm={handleDeleteMember}
      />

      <CustomizerDialog 
        isOpen={showCustomizer}
        setIsOpen={setShowCustomizer}
        member={member}
        onUpdate={(updates) => {
          onUpdate(member.id!, "customization", updates);
        }}
      />
    </motion.div>
  );
}
