
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
import { VacationDialog } from "@/components/TeamMember/VacationDialog";
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
  const [showVacationDialog, setShowVacationDialog] = useState(false);
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

  // Calculate badge position with reduced offsets
  const getBadgePosition = () => {
    if (!member.customization?.badge || !member.customization?.badgePosition) return null;
    
    // Define offsets based on badge size - more compact to reduce needed padding
    const getBadgeOffsets = () => {
      const size = member.customization?.badgeSize || 'medium';
      
      // Smaller offsets to keep badges closer to card edges
      const offsets = {
        small: { top: "-8px", right: "-8px", bottom: "-8px", left: "-8px" },
        medium: { top: "-10px", right: "-10px", bottom: "-10px", left: "-10px" },
        large: { top: "-12px", right: "-12px", bottom: "-12px", left: "-12px" }
      };
      
      return offsets[size as keyof typeof offsets] || offsets.medium;
    };
    
    const offsets = getBadgeOffsets();
    
    // Only allow top-right and bottom-right positions
    const position = member.customization.badgePosition === 'bottom-right' ? 'bottom-right' : 'top-right';
    
    const positions = {
      "top-right": { top: offsets.top, right: offsets.right },
      "bottom-right": { bottom: offsets.bottom, right: offsets.right }
    };
    
    const positionStyle = positions[position] || positions["top-right"];
    
    return (
      <div 
        className={`${getBadgeSizeClass()} absolute`}
        style={{
          ...positionStyle,
          zIndex: 5,
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
  
  const handleVacationUpdate = (startDate: Date | null, endDate: Date | null, isOnVacation: boolean) => {
    onUpdate(member.id!, "vacationStart", startDate);
    onUpdate(member.id!, "vacationEnd", endDate);
    onUpdate(member.id!, "isOnVacation", isOnVacation);
  };

  // Create background style including background image if present
  const getCardBackgroundStyle = () => {
    let style = { 
      background: cardStyle.background,
      backgroundSize: "200% 200%",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      position: "relative" as const,
      zIndex: 1
    };
    
    if (member.customization?.backgroundImage) {
      return {
        ...style,
        background: `url(${member.customization.backgroundImage}) center/cover no-repeat`,
      };
    }
    
    return style;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full py-3 px-6 relative"
    >
      {/* Render badge outside card with proper positioning */}
      {member.customization?.badge && getBadgePosition()}
      
      {/* Vacation status banner */}
      {member.isOnVacation && (
        <div className="absolute top-1 left-6 right-6 z-10 bg-orange-500 text-white px-3 py-1 rounded-t-md text-center text-xs font-medium">
          On Vacation
          {member.vacationStart && member.vacationEnd && (
            <span> - {new Date(member.vacationStart).toLocaleDateString()} to {new Date(member.vacationEnd).toLocaleDateString()}</span>
          )}
        </div>
      )}
      
      <Card 
        className={`h-full rounded-2xl shadow-md ${cardStyle.className} ${animationClass} ${member.isOnVacation ? 'mt-5' : ''}`}
        style={getCardBackgroundStyle()}
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
          onVacation={() => setShowVacationDialog(true)}
          isOnVacation={!!member.isOnVacation}
        />
        
        <MemberCardContent
          position={member.position}
          projects={member.projects}
          canEdit={canEdit}
          onStatusChange={handleStatusChange}
          currentStatus={member.status}
          onEditProjects={() => setIsEditingProjects(true)}
          lastUpdated={new Date(member.lastUpdated)}
          vacationStatus={{
            isOnVacation: !!member.isOnVacation,
            startDate: member.vacationStart ? new Date(member.vacationStart) : null,
            endDate: member.vacationEnd ? new Date(member.vacationEnd) : null
          }}
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
      
      <VacationDialog
        isOpen={showVacationDialog}
        setIsOpen={setShowVacationDialog}
        vacationStart={member.vacationStart ? new Date(member.vacationStart) : null}
        vacationEnd={member.vacationEnd ? new Date(member.vacationEnd) : null}
        isOnVacation={!!member.isOnVacation}
        onSave={handleVacationUpdate}
      />
    </motion.div>
  );
}
