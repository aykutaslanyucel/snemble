
import { Badge } from "@/components/ui/badge";

interface ProjectsBadgeProps {
  project: string;
  canEdit: boolean;
  onRemoveProject: (project: string) => void;
}

export function ProjectsBadge({ project, canEdit, onRemoveProject }: ProjectsBadgeProps) {
  return (
    <Badge variant="secondary" className="group relative">
      {project}
      {canEdit && (
        <button 
          onClick={() => onRemoveProject(project)} 
          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </Badge>
  );
}
