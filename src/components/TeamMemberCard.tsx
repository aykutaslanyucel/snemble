
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

const statusColors = {
  available: "bg-status-available hover:bg-status-available/90",
  busy: "bg-status-busy hover:bg-status-busy/90",
  critical: "bg-status-critical hover:bg-status-critical/90",
  vacation: "bg-status-vacation hover:bg-status-vacation/90",
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

  const statusBadgeVariant = statusColors[member.status as keyof typeof statusColors];

  return (
    <Card className="team-member-card overflow-hidden">
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

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={statusBadgeVariant}>
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
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
