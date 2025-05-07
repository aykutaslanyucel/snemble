
import React, { useState } from "react";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { MemberCardHeader } from "./TeamMember/MemberCardHeader";
import { MemberCardContent } from "./TeamMember/MemberCardContent";
import { ProjectsDialog } from "@/components/TeamMember/ProjectsDialog";
import { DeleteConfirmationDialog } from "@/components/TeamMember/DeleteConfirmationDialog";
import { CustomizerDialog } from "@/components/TeamMember/CustomizerDialog";
import { getCardBackground } from "./TeamMember/CardBackground";
import "@/styles/animations.css";

interface MemberCardProps {
  member: TeamMember;
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
}

export function MemberCard({ member, onUpdate, onDelete, canEdit }: MemberCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(member.name);
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [projects, setProjects] = useState(member.projects.join(", "));
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const { isPremium } = useAuth();
  
  // Get custom background or default based on status
  const cardStyle = getCardBackground(member);
  
  // Ensure we have the proper animation class
  const animationClass = member.customization?.animate && member.customization?.gradient ? 
    `animate-gradient-${member.customization.animationType || 'gentle'}` : '';
  
  // Calculate badge position styles
  const getBadgePositionStyle = () => {
    if (!member.customization?.badge) return {};
    
    const position = member.customization.badgePosition || 'top-right';
    
    if (position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    return {
      top: position.includes('top') ? '-10px' : 'auto',
      bottom: position.includes('bottom') ? '-10px' : 'auto',
      right: position.includes('right') ? '-10px' : 'auto',
      left: position.includes('left') ? '-10px' : 'auto'
    };
  };
  
  // Get badge size class
  const getBadgeSizeClass = () => {
    const size = member.customization?.badgeSize || 'medium';
    
    switch (size) {
      case 'small': return 'w-12 h-12';
      case 'large': return 'w-28 h-28';
      case 'medium':
      default: return 'w-20 h-20';
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className={`h-full overflow-hidden rounded-2xl shadow-md ${cardStyle.className} ${animationClass}`}
        style={{ 
          background: cardStyle.background,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          backgroundSize: "200% 200%"
        }}
      >
        {/* Add badge display if present with improved positioning */}
        {member.customization?.badge && (
          <div 
            className={`absolute ${getBadgeSizeClass()} rounded-full overflow-hidden z-10`}
            style={getBadgePositionStyle()}
          >
            <img 
              src={member.customization.badge} 
              alt="Badge" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <MemberCardHeader
          name={name}
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
          onEditProjects={() => setIsEditingProjects(true)}
          lastUpdated={new Date(member.lastUpdated)}
        />
      </Card>
      
      {/* Dialogs */}
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
