
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Coffee,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: string;
  projects: string[];
  lastUpdated: Date;
}

interface Props {
  member: TeamMember;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  available: {
    color: "bg-[#F2FCE2]/90 hover:bg-[#F2FCE2]",
    iconColor: "text-green-600",
    icon: CheckCircle,
    label: "Available",
  },
  busy: {
    color: "bg-[#FEC6A1]/90 hover:bg-[#FEC6A1]",
    iconColor: "text-orange-600",
    icon: Clock,
    label: "Busy",
  },
  critical: {
    color: "bg-red-100/90 hover:bg-red-100",
    iconColor: "text-red-600",
    icon: XCircle,
    label: "Do Not Disturb",
  },
  vacation: {
    color: "bg-purple-100/90 hover:bg-purple-100",
    iconColor: "text-purple-600",
    icon: Coffee,
    label: "Away",
  },
};

export default function TeamMemberCard({ member, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(member.name);
  const [editedPosition, setEditedPosition] = useState(member.position);

  const handleSave = () => {
    onUpdate(member.id, "name", editedName);
    onUpdate(member.id, "position", editedPosition);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdate(member.id, "status", newStatus);
  };

  const currentStatus = statusConfig[member.status as keyof typeof statusConfig];

  return (
    <Card className={cn(
      "team-member-card overflow-hidden border-none shadow-lg",
      currentStatus.color,
    )}>
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="p-6"
      >
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <div className="space-y-2 flex-1 mr-4">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-lg font-semibold"
              />
              <Input
                value={editedPosition}
                onChange={(e) => setEditedPosition(e.target.value)}
                className="text-sm text-muted-foreground"
              />
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.position}</p>
            </div>
          )}

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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(member.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Projects</label>
            {member.projects.map((project, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="mr-1 mb-1"
              >
                {project}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Status</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusConfig).map(([status, config]) => {
                const Icon = config.icon;
                return (
                  <Toggle
                    key={status}
                    pressed={member.status === status}
                    onPressedChange={() => handleStatusChange(status)}
                    className={cn(
                      "w-10 h-10 p-0 rounded-full data-[state=on]:bg-white/80",
                      member.status === status ? config.iconColor : "text-gray-400"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Toggle>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline" className="bg-white/50">
              <currentStatus.icon className={cn("h-3 w-3 mr-1", currentStatus.iconColor)} />
              {currentStatus.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {member.lastUpdated.toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
