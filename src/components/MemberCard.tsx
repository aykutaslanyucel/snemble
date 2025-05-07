
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
import { getCardBackground, getStatusText } from "./TeamMember/CardBackground";
import { Badge } from "@/components/ui/badge";
import { Check, User, Clock, X, Coffee } from "lucide-react";

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

  // Time since last update
  const getTimeAgo = () => {
    const now = new Date();
    const lastUpdated = new Date(member.lastUpdated);
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    
    if (diffMinutes < 1) return "less than a minute ago";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return "more than a day ago";
  };

  // Get status icon based on status
  const getStatusIcon = () => {
    switch (member.status) {
      case "available":
        return <Check className="h-3.5 w-3.5 text-gray-700" />;
      case "someAvailability":
        return <User className="h-3.5 w-3.5 text-gray-700" />;
      case "busy":
        return <Clock className="h-3.5 w-3.5 text-gray-700" />;
      case "seriouslyBusy":
        return <X className="h-3.5 w-3.5 text-gray-700" />;
      case "away":
        return <Coffee className="h-3.5 w-3.5 text-gray-700" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className="h-full overflow-hidden rounded-lg shadow-sm"
        style={{ 
          background: cardStyle.background,
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)"
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
        />
        
        {/* Status information */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          {!canEdit && (
            <div className="flex items-center gap-1.5 bg-white/80 border border-gray-100 px-2.5 py-1 rounded-full">
              <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full shadow-sm">
                {getStatusIcon()}
              </span>
              <span className="text-xs font-medium text-gray-700">{getStatusText(member.status)}</span>
            </div>
          )}
          <span className="text-xs text-gray-500 ml-auto">{getTimeAgo()}</span>
        </div>
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
