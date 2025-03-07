
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface ProjectHeatmapProps {
  members: TeamMember[];
}

// These should match the colors in WorkloadSummary.tsx
const statusColors = {
  available: "#D3E4FD",       // Blue
  someAvailability: "#F2FCE2", // Green
  busy: "#FEF7CD",           // Yellow
  seriouslyBusy: "#FFDEE2",   // Red
  away: "#F1F0FB",           // Gray
};

const statusGradientColors = {
  available: "#B3D4FF",       // Slightly darker blue
  someAvailability: "#D2ECB2", // Slightly darker green
  busy: "#FEE69D",           // Slightly darker yellow
  seriouslyBusy: "#FFBEC2",   // Slightly darker red
  away: "#E1E0EB",           // Slightly darker gray
};

// Map availability scores to status for color coding
const scoreToStatus: Record<string, TeamMemberStatus> = {
  "overloaded": "seriouslyBusy",    // Red (0-0.5)
  "constrained": "busy",            // Orange/Yellow (0.6-1.4)
  "manageable": "busy",             // Yellow (1.5-2.0)
  "healthy": "someAvailability",    // Green (2.1-2.7)
  "veryHealthy": "available",       // Blue (2.8-3.0)
  "unknown": "away"                 // Gray (No data or all away)
};

// Status score mapping
const statusScores: Record<TeamMemberStatus, number> = {
  available: 3,
  someAvailability: 2,
  busy: 1,
  seriouslyBusy: 0,
  away: 0 // Away members are excluded from calculation
};

const ProjectHeatmap: React.FC<ProjectHeatmapProps> = ({ members }) => {
  const projectData = useMemo(() => {
    // Get all unique projects
    const projectSet = new Set<string>();
    members.forEach(member => {
      member.projects.forEach(project => projectSet.add(project));
    });
    const projects = Array.from(projectSet);
    
    // Calculate availability score for each project
    return projects.map(projectName => {
      const assignedMembers = members.filter(member => 
        member.projects.includes(projectName)
      );
      
      const activeMembers = assignedMembers.filter(member => member.status !== 'away');
      
      // If all members are away or no members, return "unknown" status
      if (activeMembers.length === 0) {
        return {
          name: projectName,
          members: assignedMembers,
          averageScore: 0,
          category: "unknown"
        };
      }
      
      // Calculate total score
      const totalScore = activeMembers.reduce((acc, member) => {
        return acc + statusScores[member.status];
      }, 0);
      
      // Calculate average score
      const averageScore = totalScore / activeMembers.length;
      
      // Determine category based on score ranges
      let category: string;
      if (averageScore >= 2.8) {
        category = "veryHealthy";
      } else if (averageScore >= 2.1) {
        category = "healthy";
      } else if (averageScore >= 1.5) {
        category = "manageable";
      } else if (averageScore >= 0.6) {
        category = "constrained";
      } else {
        category = "overloaded";
      }
      
      return {
        name: projectName,
        members: assignedMembers,
        averageScore,
        category
      };
    });
  }, [members]);
  
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.02,
        delayChildren: 0.05,
        duration: 0.3,
      }
    }
  };
  
  // Animation variants for the project tiles
  const projectVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    hover: { 
      scale: 1.03, 
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
      transition: { duration: 0.15 }
    }
  };

  return (
    <Card className="p-4 sm:p-5 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
          <div className="h-2.5 w-2.5 rounded-full bg-[#F2FCE2] mr-2"></div>
          Project Health
        </h3>
        <div className="text-xs text-gray-500">
          {projectData.length} projects
        </div>
      </div>
      
      <TooltipProvider delayDuration={200}>
        <motion.div 
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 2xl:grid-cols-12 gap-2.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projectData.map((project, idx) => {
            const statusKey = scoreToStatus[project.category];
            const colorBase = statusColors[statusKey];
            const colorGradient = statusGradientColors[statusKey];
            
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="rounded-md p-2 overflow-hidden cursor-pointer h-[70px] flex flex-col justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${colorBase} 0%, ${colorGradient} 100%)`,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)"
                    }}
                    variants={projectVariants}
                    whileHover="hover"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center">
                        <Folder className="h-3 w-3 text-gray-700 mr-1.5 flex-shrink-0" />
                        <p className="font-medium text-xs text-gray-800 truncate w-full">
                          {project.name}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="h-4 px-1 text-[9px] bg-white/40 border-0 font-semibold"
                      >
                        {project.averageScore.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="flex -space-x-1 mt-1">
                      {project.members.slice(0, 3).map((member, midx) => (
                        <div 
                          key={midx}
                          className="h-4 w-4 rounded-full flex items-center justify-center bg-white/70 text-[8px] font-medium ring-1 ring-white shadow-sm"
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.members.length > 3 && (
                        <div className="h-4 w-4 rounded-full flex items-center justify-center bg-white/70 text-[8px] font-medium ring-1 ring-white shadow-sm">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="p-0 overflow-hidden rounded-lg border-0 shadow-lg">
                  <div className="bg-white/95 backdrop-blur-md p-3 max-w-[200px]">
                    <p className="font-semibold text-xs mb-1.5">{project.name}</p>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                      {project.members.map((member, midx) => (
                        <div key={midx} className="flex items-center text-xs">
                          <div 
                            className="h-3 w-3 rounded-full mr-1.5"
                            style={{ 
                              backgroundColor: statusColors[member.status]
                            }}
                            title={member.status}
                          ></div>
                          <span className="truncate text-[10px]">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </motion.div>
      </TooltipProvider>
    </Card>
  );
};

export default ProjectHeatmap;
