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

  // Calculate badge position styles with reasonable fixed pixel values
  const getBadgePosition = () => {
    if (!member.customization?.badge || !member.customization?.badgePosition) return null;
    
    // Define offsets based on badge size
    const getBadgeOffsets = () => {
      const size = member.customization?.badgeSize || 'medium';
      
      // Adjust offset based on badge size
      // Smaller offsets to keep badges closer to the card edges
      const offsets = {
        small: { top: "-10px", right: "-10px", bottom: "-10px", left: "-10px" },
        medium: { top: "-15px", right: "-15px", bottom: "-15px", left: "-15px" },
        large: { top: "-20px", right: "-20px", bottom: "-20px", left: "-20px" }
      };
      
      return offsets[size as keyof typeof offsets] || offsets.medium;
    };
    
    const offsets = getBadgeOffsets();
    const position = member.customization.badgePosition;
    
    const positions = {
      "top-left": { top: offsets.top, left: offsets.left },
      "top-right": { top: offsets.top, right: offsets.right },
      "bottom-left": { bottom: offsets.bottom, left: offsets.left },
      "bottom-right": { bottom: offsets.bottom, right: offsets.right }
    };
    
    const positionStyle = positions[position as keyof typeof positions] || positions["top-right"];
    
    return (
      <div 
        className={`${getBadgeSizeClass()} absolute`}
        style={{
          ...positionStyle,
          zIndex: 5, // Higher than card but lower than popover menus
          pointerEvents: "none" // Make badge non-interactive
        }}
      >
        <img 
          src={member.customization.badge} 
          alt="Badge" 
          className="w-full h-full object-contain"
        />
      </div>
    );
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
      className="h-full py-10 px-6 relative"
    >
      {/* Render badge outside card with proper positioning */}
      {member.customization?.badge && getBadgePosition()}
      
      <Card 
        className={`h-full rounded-2xl shadow-md ${cardStyle.className} ${animationClass}`}
        style={{ 
          background: cardStyle.background,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          backgroundSize: "200% 200%",
          position: "relative",
          zIndex: 1
        }}
      >
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
