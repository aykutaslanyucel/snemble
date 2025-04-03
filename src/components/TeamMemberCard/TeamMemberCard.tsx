
import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { MoreVertical, Trash2, Edit, CheckCircle, XCircle, Plus, Crown, Settings, Lock } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import { ProjectsBadge } from "./ProjectsBadge";
import { StatusButton } from "./StatusButton";
import { CustomizationDialog } from "./CustomizationDialog";
import { ProjectDialog } from "./ProjectDialog";
import { statusConfig, Props, TeamMemberStatus } from "./types";

export default function TeamMemberCard({
  member,
  onUpdate,
  onDelete
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(member.name);
  const [editedPosition, setEditedPosition] = useState(member.position);
  const [newProject, setNewProject] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const statusSound = new Audio("/status-change.mp3");
  const { isAdmin, currentUserId } = useAuth();

  // Check if user can edit this card
  const canEdit = isAdmin || member.userId === currentUserId;

  const handleSave = () => {
    if (!canEdit) return;
    
    onUpdate(member.id, "name", editedName);
    onUpdate(member.id, "position", editedPosition);
    setIsEditing(false);
  };
  
  const handleStatusChange = (newStatus: TeamMemberStatus) => {
    if (!canEdit) return;
    
    statusSound.play().catch(() => {});
    onUpdate(member.id, "status", newStatus);
  };
  
  const handleAddProject = () => {
    if (!canEdit || !newProject.trim()) return;
    
    onUpdate(member.id, "projects", newProject);
    setNewProject("");
    setIsProjectDialogOpen(false);
  };
  
  const handleRemoveProject = (projectToRemove: string) => {
    if (!canEdit) return;
    
    onUpdate(member.id, "projects", member.projects.filter(project => project !== projectToRemove));
  };
  
  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true
    });
  };
  
  const openProjectDialog = () => {
    if (!canEdit) return;
    
    setNewProject(member.projects.join('; '));
    setIsProjectDialogOpen(true);
  };
  
  const currentStatus = statusConfig[member.status] || statusConfig.available;
  const premiumCustomization = member.customization || {};
  const isPremium = member.role?.toLowerCase() === 'premium';
  
  return (
    <Card className={cn(
      "team-member-card overflow-hidden border-none shadow-lg transition-all duration-300", 
      currentStatus.color, 
      isPremium && "border-2 border-yellow-400/50", 
      premiumCustomization.color
    )}>
      <motion.div 
        initial={false} 
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        }} 
        className="p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input 
                  value={editedName} 
                  onChange={e => setEditedName(e.target.value)} 
                  className="text-lg font-semibold" 
                />
                <Input 
                  value={editedPosition} 
                  onChange={e => setEditedPosition(e.target.value)} 
                  className="text-sm text-muted-foreground" 
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{member.name}</h3>
                  <p className="text-sm text-slate-950">{member.position}</p>
                </div>
                {isPremium && (
                  <Badge variant="outline" className="bg-yellow-100/50">
                    <Crown className="h-3 w-3 mr-1 text-yellow-600" />
                    Premium
                  </Badge>
                )}
                {!canEdit && (
                  <Badge variant="outline" className="bg-gray-100/50">
                    <Lock className="h-3 w-3 mr-1 text-gray-600" />
                    Locked
                  </Badge>
                )}
              </div>
            )}
          </div>

          {canEdit && (
            <>
              <CustomizationDialog 
                isOpen={isCustomizationOpen}
                setIsOpen={setIsCustomizationOpen}
                premiumCustomization={premiumCustomization}
                onUpdate={(field, value) => onUpdate(member.id, field, value)}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isEditing ? (
                    <>
                      <DropdownMenuItem onClick={handleSave}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsEditing(false)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {isPremium && (
                        <>
                          <DropdownMenuSeparator />
                          <DialogTrigger asChild>
                            <DropdownMenuItem onClick={() => setIsCustomizationOpen(true)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Customize
                            </DropdownMenuItem>
                          </DialogTrigger>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(member.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium bg-transparent">Projects</label>
              {canEdit && (
                <ProjectDialog
                  isOpen={isProjectDialogOpen}
                  setIsOpen={setIsProjectDialogOpen}
                  initialProjects={newProject}
                  onSaveProjects={handleAddProject}
                  onProjectChange={setNewProject}
                />
                
                <Button variant="outline" size="sm" onClick={openProjectDialog}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Project
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {member.projects.map((project, index) => (
                <ProjectsBadge 
                  key={index}
                  project={project}
                  canEdit={canEdit}
                  onRemoveProject={handleRemoveProject}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Status</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as TeamMemberStatus[]).map(status => (
                <StatusButton
                  key={status}
                  status={status}
                  currentStatus={member.status}
                  onStatusChange={handleStatusChange}
                  statusConfig={statusConfig}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline" className="bg-white/50">
              <motion.div 
                initial={{
                  scale: 0.8,
                  opacity: 0
                }} 
                animate={{
                  scale: 1,
                  opacity: 1
                }} 
                className="flex items-center"
              >
                {premiumCustomization.emoji ? (
                  <span className="mr-1">{premiumCustomization.emoji}</span>
                ) : (
                  <currentStatus.icon className={cn("h-3 w-3 mr-1", currentStatus.iconColor)} />
                )}
                {currentStatus.label}
                {premiumCustomization.hat && <span className="ml-1">{premiumCustomization.hat}</span>}
              </motion.div>
            </Badge>
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(member.lastUpdated)}
            </span>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
