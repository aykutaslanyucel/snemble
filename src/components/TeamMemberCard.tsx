
import React, { useState } from "react";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/animations.css";
import { Check, User, Clock, X, Coffee, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import our dialogs
import { ProjectsDialog } from "@/components/TeamMember/ProjectsDialog";
import { DeleteConfirmationDialog } from "@/components/TeamMember/DeleteConfirmationDialog";
import { CustomizerDialog } from "@/components/TeamMember/CustomizerDialog";

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

  // Card background based on status
  const getCardBackground = () => {
    // Custom styling if member has customization
    if (member.customization) {
      if (member.customization.gradient) return member.customization.gradient;
      if (member.customization.color) return member.customization.color;
    }
    
    // Default styling based on status
    switch (member.status) {
      case "available":
        return "#D3E4FD";
      case "someAvailability":
        return "#F2FCE2";
      case "busy":
        return "#FEF7CD";
      case "seriouslyBusy":
        return "#FFDEE2";
      case "away":
        return "#E5E5E5";
      default:
        return "#F1F0FB";
    }
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

  // Status display text
  const getStatusText = () => {
    switch (member.status) {
      case "available":
        return "Available";
      case "someAvailability":
        return "Some Availability";
      case "busy":
        return "Busy";
      case "seriouslyBusy":
        return "Seriously Busy";
      case "away":
        return "Away";
      default:
        return "Unknown";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div 
        className="rounded-2xl overflow-hidden h-full shadow-lg p-6"
        style={{ 
          background: getCardBackground(),
          boxShadow: "0px 10px 25px -5px rgba(0,0,0,0.05)"
        }}
      >
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {isEditingName ? (
              <div className="flex items-center">
                <input
                  type="text"
                  className="bg-white/90 rounded-xl border border-gray-100 px-3 py-2 text-lg font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameChange}
                  onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
                  autoFocus
                />
              </div>
            ) : (
              <h3 
                className="font-semibold text-gray-800 text-2xl mb-1"
                onClick={() => canEdit && setIsEditingName(true)}
              >
                {member.name}
              </h3>
            )}
            <p className="text-gray-600 text-md">{member.position}</p>
          </div>
          
          {canEdit && (
            <button 
              className="rounded-full p-2 bg-white/80 hover:bg-white shadow-sm"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-gray-700 font-medium">Projects</h4>
            
            {canEdit && (
              <Button 
                onClick={() => setIsEditingProjects(true)}
                className="rounded-full px-4 py-2 h-auto bg-white text-gray-700 hover:bg-white/90 shadow-sm flex items-center gap-1.5"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            )}
          </div>
          
          {member.projects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {member.projects.map((project, index) => (
                <span 
                  key={index} 
                  className="bg-white/90 text-gray-700 rounded-full px-3 py-1 text-sm font-medium shadow-sm"
                >
                  {project}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No projects assigned</p>
          )}
        </div>
        
        {/* Status Section */}
        <div className="space-y-3">
          <h4 className="text-gray-700 font-medium">Status</h4>
          
          <div className="flex items-center justify-between">
            {canEdit ? (
              <div className="flex space-x-3">
                <StatusButton 
                  status="available"
                  current={member.status} 
                  onClick={() => handleStatusChange("available")}
                />
                <StatusButton 
                  status="someAvailability"
                  current={member.status} 
                  onClick={() => handleStatusChange("someAvailability")}
                />
                <StatusButton 
                  status="busy"
                  current={member.status} 
                  onClick={() => handleStatusChange("busy")}
                />
                <StatusButton 
                  status="seriouslyBusy"
                  current={member.status} 
                  onClick={() => handleStatusChange("seriouslyBusy")}
                />
                <StatusButton 
                  status="away"
                  current={member.status} 
                  onClick={() => handleStatusChange("away")}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                {getStatusIcon(member.status)}
                <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
              </div>
            )}
            
            <span className="text-xs text-gray-400">{getTimeAgo()}</span>
          </div>
        </div>
      </div>
      
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

// Status Button Component with enhanced styling
function StatusButton({ 
  status, 
  current, 
  onClick, 
}: { 
  status: TeamMemberStatus; 
  current: TeamMemberStatus;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all ${
        current === status 
          ? 'ring-2 ring-blue-400 transform scale-110 shadow-md' 
          : 'shadow-sm hover:scale-105'
      }`}
      aria-label={`Set status to ${status}`}
    >
      {getStatusIcon(status)}
    </button>
  );
}

// Extracted status icon function to be used in multiple places
function getStatusIcon(status: TeamMemberStatus) {
  switch (status) {
    case "available":
      return <Check className="h-5 w-5 text-gray-700" />;
    case "someAvailability":
      return <User className="h-5 w-5 text-gray-700" />;
    case "busy":
      return <Clock className="h-5 w-5 text-gray-700" />;
    case "seriouslyBusy":
      return <X className="h-5 w-5 text-gray-700" />;
    case "away":
      return <Coffee className="h-5 w-5 text-gray-700" />;
    default:
      return null;
  }
}
