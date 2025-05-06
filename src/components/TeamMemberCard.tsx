
import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { 
  MoreVertical, Trash2, Edit, CheckCircle, XCircle, 
  User, Clock, Coffee, Plus, Crown, Settings, Lock 
} from "lucide-react";
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
  canEdit?: boolean;
}

const statusConfig = {
  available: {
    color: "bg-[#D6E4FF]/90 hover:bg-[#D6E4FF]",
    iconColor: "text-blue-600",
    icon: CheckCircle,
    label: "Available"
  },
  someAvailability: {
    color: "bg-[#C8EAD7]/90 hover:bg-[#C8EAD7]",
    iconColor: "text-green-600",
    icon: User,
    label: "Some Availability"
  },
  busy: {
    color: "bg-[#FFD8A8]/90 hover:bg-[#FFD8A8]",
    iconColor: "text-orange-600",
    icon: Clock,
    label: "Busy"
  },
  seriouslyBusy: {
    color: "bg-[#FFA3A3]/90 hover:bg-[#FFA3A3]",
    iconColor: "text-red-600",
    icon: XCircle,
    label: "Seriously Busy"
  },
  away: {
    color: "bg-[#C4C4C4]/90 hover:bg-[#C4C4C4]",
    iconColor: "text-gray-600",
    icon: Coffee,
    label: "Away"
  }
} as const;

export default function TeamMemberCard({
  member,
  onUpdate,
  onDelete,
  canEdit = true
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(member.name);
  const [editedPosition, setEditedPosition] = useState(member.position);
  const [newProject, setNewProject] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  
  const handleSave = () => {
    onUpdate(member.id, "name", editedName);
    onUpdate(member.id, "position", editedPosition);
    setIsEditing(false);
  };
  
  const handleStatusChange = (newStatus: TeamMemberStatus) => {
    onUpdate(member.id, "status", newStatus);
  };
  
  const handleAddProject = () => {
    if (newProject.trim()) {
      onUpdate(member.id, "projects", newProject);
      setNewProject("");
      setIsProjectDialogOpen(false);
    }
  };
  
  const handleRemoveProject = (projectToRemove: string) => {
    onUpdate(member.id, "projects", member.projects.filter(project => project !== projectToRemove));
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
              </div>
            )}
          </div>

          <Dialog open={isCustomizationOpen} onOpenChange={setIsCustomizationOpen}>
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
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Customize
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => onDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Premium Customization</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Card Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {["bg-purple-100", "bg-blue-100", "bg-green-100", "bg-pink-100", "bg-yellow-100"].map(color => (
                      <button 
                        key={color} 
                        className={cn(
                          "w-8 h-8 rounded-full", 
                          color, 
                          premiumCustomization.color === color && "ring-2 ring-offset-2 ring-primary"
                        )} 
                        onClick={() => onUpdate(member.id, "customization", {
                          ...premiumCustomization,
                          color
                        })} 
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hat Style</label>
                  <div className="flex gap-2">
                    {["🎩", "👑", "🎓", "⛑️", "🪖"].map(hat => (
                      <button 
                        key={hat} 
                        className={cn(
                          "p-2 rounded hover:bg-secondary", 
                          premiumCustomization.hat === hat && "bg-secondary"
                        )} 
                        onClick={() => onUpdate(member.id, "customization", {
                          ...premiumCustomization,
                          hat
                        })}
                      >
                        {hat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status Emoji</label>
                  <div className="flex gap-2">
                    {["😊", "🚀", "💪", "✨", "🌟"].map(emoji => (
                      <button 
                        key={emoji} 
                        className={cn(
                          "p-2 rounded hover:bg-secondary", 
                          premiumCustomization.emoji === emoji && "bg-secondary"
                        )} 
                        onClick={() => onUpdate(member.id, "customization", {
                          ...premiumCustomization,
                          emoji
                        })}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium bg-transparent">Projects</label>
              <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={openProjectDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Projects</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Add or edit projects, separated by semicolons (;)
                    </div>
                    <Textarea 
                      placeholder="Project names (separate with semicolons)" 
                      value={newProject} 
                      onChange={e => setNewProject(e.target.value)} 
                      className="min-h-[100px]" 
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProject}>Save Projects</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.projects.map((project, index) => (
                <Badge key={index} variant="secondary" className="group relative">
                  {project}
                  <button 
                    onClick={() => handleRemoveProject(project)} 
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Status</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as TeamMemberStatus[]).map(status => {
                const config = statusConfig[status];
                const Icon = config.icon;
                return (
                  <motion.div 
                    key={status} 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Toggle 
                      pressed={member.status === status} 
                      onPressedChange={() => handleStatusChange(status)} 
                      className={cn(
                        "w-10 h-10 p-0 rounded-full data-[state=on]:bg-white/80", 
                        member.status === status ? config.iconColor : "text-gray-400"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Toggle>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline" className="bg-white/50">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
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
