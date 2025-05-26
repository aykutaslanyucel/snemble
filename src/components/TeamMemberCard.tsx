
import React, { useState } from "react";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/animations.css";
import { Check, User, Clock, X, Coffee, Plus, MoreHorizontal, Edit, Briefcase, Palette, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Import our dialogs
import { ProjectsDialog } from "@/components/TeamMember/ProjectsDialog";
import { DeleteConfirmationDialog } from "@/components/TeamMember/DeleteConfirmationDialog";
import { CustomizerDialog } from "@/components/TeamMember/CustomizerDialog";
import { StatusSelector } from "./TeamMember/StatusSelector";
import { getCardBackground } from "./TeamMember/CardBackground";

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
  const { isPremium } = useAuth();
  
  // Get the background based on status or customization
  const cardStyle = getCardBackground(member);
  
  // Ensure proper animation class is applied consistently
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

  // Calculate badge position styles with reduced offsets for less spacing requirement
  const getBadgePosition = () => {
    if (!member.customization?.badge || !member.customization?.badgePosition) return null;
    
    // Define offsets based on badge size - using smaller values for tighter layout
    const getBadgeOffsets = () => {
      const size = member.customization?.badgeSize || 'medium';
      
      // Compact offsets to reduce needed padding between cards
      const offsets = {
        small: { top: "-8px", right: "-8px", bottom: "-8px", left: "-8px" },
        medium: { top: "-10px", right: "-10px", bottom: "-10px", left: "-10px" },
        large: { top: "-12px", right: "-12px", bottom: "-12px", left: "-12px" }
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

  // Status icon with color
  const getStatusIcon = (status: TeamMemberStatus) => {
    switch (status) {
      case "available":
        return <Check className="h-3.5 w-3.5 text-gray-600" />;
      case "someAvailability":
        return <User className="h-3.5 w-3.5 text-gray-600" />;
      case "busy":
        return <Clock className="h-3.5 w-3.5 text-gray-600" />;
      case "seriouslyBusy":
        return <X className="h-3.5 w-3.5 text-gray-600" />;
      case "away":
        return <Coffee className="h-3.5 w-3.5 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full relative"
    >
      <div className="py-3 px-6 relative h-full">
        {/* Render badge outside card with proper positioning */}
        {member.customization?.badge && getBadgePosition()}
        
        <div 
          className="rounded-2xl h-full shadow-lg p-6 relative"
          style={{ 
            background: cardStyle.background,
            backgroundSize: "200% 200%",
            position: "relative",
            zIndex: 1
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
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="rounded-full p-2 bg-white/80 hover:bg-white shadow-sm"
                    style={{ zIndex: 10 }} // Higher z-index to ensure it's clickable
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end" style={{ zIndex: 20 }}>
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Name
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setIsEditingProjects(true)}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Edit Projects
                    </Button>
                    {isPremium && (
                      <CustomizerDialog 
                        teamMember={member}
                        onUpdate={(customization) => {
                          onUpdate(member.id!, "customization", customization);
                        }}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setIsConfirmingDelete(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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
                <div>
                  <StatusSelector
                    currentStatus={member.status}
                    onStatusChange={handleStatusChange}
                  />
                  <div className="mt-2">
                    <Badge 
                      className={`inline-flex items-center gap-1 px-3 py-1.5`}
                      style={{ background: cardStyle.background }}
                    >
                      <span className="flex-shrink-0">{getStatusIcon(member.status)}</span>
                      <span className="text-xs font-medium text-gray-700">{getStatusText()}</span>
                    </Badge>
                  </div>
                </div>
              ) : (
                <Badge 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5`}
                  style={{ background: cardStyle.background }}
                >
                  <span className="flex-shrink-0">{getStatusIcon(member.status)}</span>
                  <span className="text-xs font-medium text-gray-700">{getStatusText()}</span>
                </Badge>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="absolute bottom-6 right-6">
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
    </motion.div>
  );
}
