import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Trash2, Briefcase, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";
import { motion } from "framer-motion";
import { CardCustomizer } from "@/components/PremiumFeatures/CardCustomizer";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/animations.css";

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdate: (id: string, field: string, value: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
}

// Status button configs with colors but without labels - simplified
const STATUS_BUTTONS = [
  { status: "available", color: "#D3E4FD", tooltip: "Available" },
  { status: "someAvailability", color: "#F2FCE2", tooltip: "Some Availability" },
  { status: "busy", color: "#FEF7CD", tooltip: "Busy" },
  { status: "seriouslyBusy", color: "#FFDEE2", tooltip: "Seriously Busy" },
  { status: "away", color: "#F1F0FB", tooltip: "Away" },
];

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
    onUpdate(member.id, "status", status);
  };

  const handleNameChange = () => {
    if (name !== member.name) {
      onUpdate(member.id, "name", name);
    }
    setIsEditingName(false);
  };

  const handleProjectsChange = () => {
    const newProjects = projects
      .split(/[,;]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    if (JSON.stringify(newProjects) !== JSON.stringify(member.projects)) {
      onUpdate(member.id, "projects", newProjects);
    }
    setIsEditingProjects(false);
  };

  const handleDeleteMember = () => {
    onDelete(member.id);
    setIsConfirmingDelete(false);
  };

  // Get the appropriate background based on member's customization or status
  const getCardBackground = () => {
    // Safe access to member.customization with proper typing
    const customization = member.customization || {};
    
    if (customization.gradient) {
      return {
        background: customization.gradient,
        className: customization.animate ? "animate-gradient" : ""
      };
    }
    if (customization.color) {
      return {
        background: customization.color,
        className: ""
      };
    }
    
    // Default color based on status
    const statusConfig = STATUS_BUTTONS.find(s => s.status === member.status);
    return {
      background: statusConfig?.color || "#F1F0FB",
      className: ""
    };
  };

  const cardStyle = getCardBackground();

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
        <CardHeader className="p-4 flex-row items-center justify-between">
          <CardTitle className="text-gray-800 dark:text-gray-200 text-base font-medium flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <Input
                  className="border-gray-300 bg-white text-gray-800 text-sm p-1 h-7"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameChange}
                  onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
                  autoFocus
                />
              </div>
            ) : (
              <span onClick={() => canEdit && setIsEditingName(true)} className={`${canEdit ? 'cursor-pointer hover:underline' : ''}`}>
                {member.name}
              </span>
            )}
          </CardTitle>
          
          {canEdit && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setShowCustomizer(true)}
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Customize Card
                    </Button>
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
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">Position:</span> {member.position}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span className="font-medium">Projects:</span>{" "}
              {member.projects.length > 0 ? member.projects.join(", ") : "None"}
            </div>
          </div>
          
          {canEdit && (
            <div className="flex items-center justify-center gap-2">
              {STATUS_BUTTONS.map((statusBtn) => (
                <Popover key={statusBtn.status}>
                  <PopoverTrigger asChild>
                    <button
                      onClick={() => handleStatusChange(statusBtn.status as TeamMemberStatus)}
                      className={`status-button ${member.status === statusBtn.status ? 'active' : ''}`}
                      style={{ backgroundColor: statusBtn.color }}
                      aria-label={statusBtn.tooltip}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="p-1 w-auto">
                    <p className="text-xs">{statusBtn.tooltip}</p>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditingProjects} onOpenChange={setIsEditingProjects}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Projects</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              placeholder="Projects (comma or semicolon separated)"
              className="w-full"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Separate projects with commas or semicolons
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProjects(false)}>
              Cancel
            </Button>
            <Button onClick={handleProjectsChange}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete {member.name}?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customize Card</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CardCustomizer 
              teamMember={member} 
              onUpdate={(updates) => {
                onUpdate(member.id, "customization", updates);
                setShowCustomizer(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
