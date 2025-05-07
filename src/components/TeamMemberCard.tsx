
import React, { useState } from "react";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/animations.css";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Plus, Check, User, Clock, X, Coffee } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Status icon based on status
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
      className="flex flex-col"
    >
      <div 
        className="rounded-lg overflow-hidden h-full"
        style={{ 
          background: getCardBackground(),
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* Card Header */}
        <div className="p-4 flex justify-between items-start">
          <div>
            {isEditingName ? (
              <div className="flex items-center">
                <input
                  type="text"
                  className="bg-white/80 rounded-md border border-gray-200 px-2 py-1 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameChange}
                  onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
                  autoFocus
                />
              </div>
            ) : (
              <h3 
                className="font-medium text-gray-800 text-base"
                onClick={() => canEdit && setIsEditingName(true)}
              >
                {member.name}
              </h3>
            )}
            <p className="text-sm text-gray-600">{member.position}</p>
          </div>
          
          {canEdit && (
            <button 
              className="rounded-full p-1 bg-white/70 hover:bg-white/90 shadow-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Card Content */}
        <div className="px-4 pb-1">
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-1.5">Projects</p>
            {member.projects.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {member.projects.map((project, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-white/90 text-gray-700 hover:bg-white rounded-full"
                  >
                    {project}
                  </Badge>
                ))}
                
                {canEdit && (
                  <button 
                    onClick={() => setIsEditingProjects(true)}
                    className="bg-white/80 hover:bg-white/90 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">No projects</p>
                
                {canEdit && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs bg-white/80 border-gray-200 rounded-full px-2"
                    onClick={() => setIsEditingProjects(true)}
                  >
                    <Plus className="h-2.5 w-2.5 mr-1" />
                    Add Project
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Status</p>
            <div className="flex items-center justify-between">
              {canEdit ? (
                <div className="flex space-x-1.5">
                  <StatusButton 
                    status="available"
                    current={member.status} 
                    onClick={() => handleStatusChange("available")}
                    color="#D3E4FD" 
                  />
                  <StatusButton 
                    status="someAvailability"
                    current={member.status} 
                    onClick={() => handleStatusChange("someAvailability")}
                    color="#F2FCE2" 
                  />
                  <StatusButton 
                    status="busy"
                    current={member.status} 
                    onClick={() => handleStatusChange("busy")}
                    color="#FEF7CD" 
                  />
                  <StatusButton 
                    status="seriouslyBusy"
                    current={member.status} 
                    onClick={() => handleStatusChange("seriouslyBusy")}
                    color="#FFDEE2" 
                  />
                  <StatusButton 
                    status="away"
                    current={member.status} 
                    onClick={() => handleStatusChange("away")}
                    color="#E5E5E5" 
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-white/90 border border-gray-100 px-2.5 py-1 rounded-full">
                  <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full shadow-sm">
                    {getStatusIcon()}
                  </span>
                  <span className="text-xs font-medium text-gray-700">{getStatusText()}</span>
                </div>
              )}
              
              <span className="text-xs text-gray-500 ml-auto">{getTimeAgo()}</span>
            </div>
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

// Status Button Component
function StatusButton({ 
  status, 
  current, 
  onClick, 
  color 
}: { 
  status: TeamMemberStatus; 
  current: TeamMemberStatus;
  onClick: () => void;
  color: string;
}) {
  const getIcon = () => {
    switch (status) {
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
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-all ${
        current === status ? 'ring-2 ring-white/70 transform scale-105' : 'hover:scale-105'
      }`}
      style={{ 
        border: current === status ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(0,0,0,0.05)'
      }}
    >
      {getIcon()}
    </button>
  );
}
