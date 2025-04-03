
import React from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectWorkload, CATEGORY_COLORS, CATEGORY_NAMES } from "./types";

interface ProjectCardProps {
  project: ProjectWorkload;
  backgroundColor: string;
  setHoveredProject: (projectName: string | null) => void;
}

export function ProjectCard({ project, backgroundColor, setHoveredProject }: ProjectCardProps) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <Tooltip key={project.name}>
      <TooltipTrigger asChild>
        <motion.div 
          className="h-12 rounded-md flex items-center justify-center px-2 py-1 cursor-pointer transition-all hover:shadow-sm relative overflow-hidden group" 
          style={{ backgroundColor }} 
          onMouseEnter={() => setHoveredProject(project.name)} 
          onMouseLeave={() => setHoveredProject(null)} 
          whileHover={{ scale: 1.01 }} 
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-xs font-medium text-center line-clamp-2 z-10 text-gray-950">
            {project.name}
          </p>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="p-2.5 max-w-xs bg-white/95 backdrop-blur border-white/10 shadow-sm rounded-md">
        <div className="space-y-1.5">
          <div className="font-medium text-sm">{project.name}</div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[project.category] }} />
            {CATEGORY_NAMES[project.category]} ({project.score.toFixed(1)}/3.0)
          </div>
          <div className="text-xs font-medium mt-1">Team ({project.assignedMembers.length})</div>
          <div className="max-h-32 overflow-y-auto pr-1 fancy-scroll space-y-1">
            {project.assignedMembers.length > 0 ? (
              project.assignedMembers.map(member => (
                <div key={member.id} className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{
                    backgroundColor: member.status === 'available' ? '#A8DEBC' : 
                                     member.status === 'someAvailability' ? '#ACCBEE' : 
                                     member.status === 'busy' ? '#FFBB66' : 
                                     member.status === 'seriouslyBusy' ? '#FF8080' : '#E0E0E0'
                  }} />
                  <span className="text-xs">{member.name}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500">No team members assigned</div>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
