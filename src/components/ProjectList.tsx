import React from "react";
import { Card } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { TeamMember } from "@/types/TeamMemberTypes";
interface ProjectListProps {
  activeProjects: string[];
  projectsWithMembers: Map<string, TeamMember[]>;
}
export function ProjectList({
  activeProjects,
  projectsWithMembers
}: ProjectListProps) {
  return <Card className="p-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
        
        <span className="text-slate-50">Active Projects</span>
        <span className="text-sm font-normal text-muted-foreground ml-1">
          ({activeProjects.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {activeProjects.map((project, index) => {
        const assignedMembers = projectsWithMembers.get(project) || [];
        return <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col transition-all hover:bg-white/10 hover:shadow-md group">
              <div className="flex items-center">
                <Folder className="w-4 h-4 text-[#E5DEFF] mr-2 flex-shrink-0" />
                <p className="font-medium text-sm truncate group-hover:text-[#E5DEFF]">
                  {project}
                </p>
              </div>
              {assignedMembers.length > 0 && <div className="mt-2 pl-6">
                  {assignedMembers.slice(0, 3).map((member, idx) => <div key={idx} className="text-xs text-muted-foreground truncate">
                      {member.name}
                    </div>)}
                  {assignedMembers.length > 3 && <div className="text-xs text-muted-foreground">
                      +{assignedMembers.length - 3} more
                    </div>}
                </div>}
            </div>;
      })}
      </div>
    </Card>;
}