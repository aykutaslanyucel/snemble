import { useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { MoreVertical, Trash2, Edit, CheckCircle, XCircle, User, Clock, Coffee, Plus, Crown, Palette, Brush, Settings, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";

interface Props {
  member: TeamMember;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

const statusConfig = {
  available: {
    label: "Available",
    color: "bg-blue-50",
    icon: CheckCircle,
    iconColor: "text-blue-500"
  },
  someAvailability: {
    label: "Some Availability",
    color: "bg-green-50",
    icon: Clock,
    iconColor: "text-green-500"
  },
  busy: {
    label: "Busy",
    color: "bg-yellow-50",
    icon: User,
    iconColor: "text-yellow-500"
  },
  seriouslyBusy: {
    label: "Seriously Busy",
    color: "bg-red-50",
    icon: XCircle,
    iconColor: "text-red-500"
  },
  away: {
    label: "Away",
    color: "bg-gray-50",
    icon: Coffee,
    iconColor: "text-gray-500"
  }
} as const;

export default function TeamMemberCard({
  member,
  onUpdate,
  onDelete,
  canEdit
}: Props) {
  console.log("Team member card rendering:", { 
    memberId: member.id, 
    memberName: member.name, 
    canEdit: canEdit,
    userId: member.user_id
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(member.name);
  const [editedPosition, setEditedPosition] = useState(member.position);
  const [newProject, setNewProject] = useState("");
  const [editingProjects, setEditingProjects] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [statusChangeInProgress, setStatusChangeInProgress] = useState<string | null>(null);
  
  const handleSave = () => {
    onUpdate(member.id, "name", editedName);
    onUpdate(member.id, "position", editedPosition);
    setIsEditing(false);
  };
  
  const handleStatusChange = (newStatus: TeamMemberStatus) => {
    // Set the status that is currently being updated
    setStatusChangeInProgress(newStatus);
    
    // Optimistically update the UI with the new status
    onUpdate(member.id, "status", newStatus);
    
    // Clear the in-progress status after a short delay to show the animation
    setTimeout(() => {
      setStatusChangeInProgress(null);
    }, 500);
  };
  
  const handleAddProject = () => {
    if (newProject.trim()) {
      onUpdate(member.id, "projects", newProject);
      setNewProject("");
      setIsProjectDialogOpen(false);
    }
  };
  
  const handleRemoveProject = (projectToRemove: string) => {
    onUpdate(
      member.id, 
      "projects", 
      member.projects.filter(project => project !== projectToRemove)
    );
  };
  
  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true
    });
  };
  
  const openProjectDialog = () => {
    setNewProject(member.projects.join('; '));
    setIsProjectDialogOpen(true);
  };
  
  const currentStatus = statusConfig[member.status] || statusConfig.available;
  const premiumCustomization = member.customization || {};
  const isPremium = member.role?.toLowerCase() === 'premium';
  
  // Non-editable read-only view
  if (!canEdit) {
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
              </div>
            </div>
            
            <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span className="text-xs">Read Only</span>
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium bg-transparent">Projects</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.projects.map((project, index) => (
                  <Badge key={index} variant="secondary">
                    {project}
                  </Badge>
                ))}
                {member.projects.length === 0 && (
                  <span className="text-sm text-gray-500">No projects assigned</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Status</label>
              <Badge variant="outline" className="bg-white/50">
                <motion.div 
                  initial={{scale: 0.8, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
                  className="flex items-center"
                >
                  <currentStatus.icon className={cn("h-3 w-3 mr-1", currentStatus.iconColor)} />
                  {currentStatus.label}
                </motion.div>
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Badge variant="outline" className="bg-white/50">
                <motion.div 
                  initial={{scale: 0.8, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
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

  // Editable view
  return (
    <Card className={cn(
      "team-member-card overflow-hidden border-none shadow-lg transition-all duration-300",
      isEditing ? "ring-2 ring-primary" : currentStatus.color,
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
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Name"
                  className="font-semibold"
                />
                <Input 
                  value={editedPosition} 
                  onChange={(e) => setEditedPosition(e.target.value)}
                  placeholder="Position"
                  className="text-sm"
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
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {isPremium && (
                  <DropdownMenuItem onClick={() => setIsCustomizationOpen(true)}>
                    <Palette className="mr-2 h-4 w-4" />
                    Customize
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onDelete(member.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium bg-transparent">Projects</label>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={openProjectDialog}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {member.projects.map((project, index) => (
                <Badge key={index} variant="secondary" className="group">
                  {project}
                  {!isEditing && (
                    <button 
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => handleRemoveProject(project)}
                    >
                      <XCircle className="h-3 w-3 text-red-500" />
                    </button>
                  )}
                </Badge>
              ))}
              {member.projects.length === 0 && (
                <span className="text-sm text-gray-500">No projects assigned</span>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium block">Status</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <Toggle
                    key={status}
                    size="sm"
                    pressed={member.status === status}
                    onPressedChange={() => handleStatusChange(status as TeamMemberStatus)}
                    className={cn(
                      "data-[state=on]:bg-white/50 border",
                      member.status === status && "ring-1 ring-primary",
                      statusChangeInProgress === status && "animate-pulse"
                    )}
                    disabled={statusChangeInProgress !== null}
                  >
                    <motion.div 
                      initial={{scale: 0.8, opacity: 0}}
                      animate={{scale: 1, opacity: 1}}
                      className="flex items-center"
                    >
                      <config.icon className={cn("h-3 w-3 mr-1", config.iconColor)} />
                      {config.label}
                    </motion.div>
                  </Toggle>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline" className="bg-white/50">
              <motion.div 
                initial={{scale: 0.8, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
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

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Projects</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Enter projects separated by semicolons or commas.
            </p>
            <Textarea 
              value={newProject} 
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Project 1; Project 2; Project 3"
              className="h-24"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsProjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddProject}>Save Projects</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isPremium && (
        <Dialog open={isCustomizationOpen} onOpenChange={setIsCustomizationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Customize Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Personalize your team member card with custom colors and details.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Custom Color</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {["bg-blue-50", "bg-green-50", "bg-purple-50", "bg-orange-50", "bg-pink-50", "bg-cyan-50", "bg-amber-50", "bg-emerald-50"].map(color => (
                      <Toggle
                        key={color}
                        size="sm"
                        pressed={premiumCustomization.color === color}
                        onPressedChange={() => onUpdate(member.id, "customization", { ...premiumCustomization, color })}
                        className={cn(
                          color,
                          "h-8 w-8 p-0 rounded-full data-[state=on]:ring-2 data-[state=on]:ring-primary"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Emoji</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {["🚀", "💻", "✨", "🔥", "🌟", "🎯", "⚡", "🧠"].map(emoji => (
                      <Toggle
                        key={emoji}
                        size="sm"
                        pressed={premiumCustomization.emoji === emoji}
                        onPressedChange={() => onUpdate(member.id, "customization", { ...premiumCustomization, emoji })}
                        className="h-8 w-8 p-0 rounded-full data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                      >
                        {emoji}
                      </Toggle>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCustomizationOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
