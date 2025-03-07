
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Folder, User, Info } from "lucide-react";
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

// Legend labels for heatmap interpretation
const heatmapLegend = [
  { key: "veryHealthy", label: "Very Healthy (2.8-3.0)", status: "available" },
  { key: "healthy", label: "Healthy (2.1-2.7)", status: "someAvailability" },
  { key: "manageable", label: "Manageable (1.5-2.0)", status: "busy" },
  { key: "constrained", label: "Constrained (0.6-1.4)", status: "busy" },
  { key: "overloaded", label: "Overloaded (0-0.5)", status: "seriouslyBusy" },
  { key: "unknown", label: "No Data / All Away", status: "away" }
];

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
        staggerChildren: 0.05,
        delayChildren: 0.1,
        duration: 0.4,
      }
    }
  };
  
  // Animation variants for the project tiles
  const projectVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };
  
  // Animation variants for the legend items
  const legendVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: 0.3 + (i * 0.05),
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
          <div className="h-3 w-3 rounded-full bg-[#F2FCE2] mr-2"></div>
          Project Heatmap
        </h3>
        <div className="text-sm text-gray-600">
          {projectData.length} projects
        </div>
      </div>
      
      <TooltipProvider delayDuration={300}>
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6"
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
                    className="relative rounded-lg p-3 overflow-hidden cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${colorBase} 0%, ${colorGradient} 100%)`,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }}
                    variants={projectVariants}
                    whileHover="hover"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center">
                        <Folder className="h-3.5 w-3.5 text-gray-700 mr-1.5 flex-shrink-0" />
                        <p className="font-semibold text-xs text-gray-800 truncate max-w-[80%]">
                          {project.name}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="h-5 px-1.5 text-[10px] bg-white/50 border-0"
                      >
                        {project.averageScore.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="flex -space-x-1.5 mt-2">
                      {project.members.slice(0, 5).map((member, midx) => (
                        <div 
                          key={midx}
                          className="h-5 w-5 rounded-full flex items-center justify-center bg-white/70 text-[10px] font-medium ring-1 ring-white"
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.members.length > 5 && (
                        <div className="h-5 w-5 rounded-full flex items-center justify-center bg-white/70 text-[10px] font-medium ring-1 ring-white">
                          +{project.members.length - 5}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="p-0 overflow-hidden rounded-lg border-0">
                  <div className="bg-white/90 backdrop-blur-md p-3 max-w-[250px]">
                    <p className="font-semibold text-sm mb-2">{project.name}</p>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                      {project.members.map((member, midx) => (
                        <div key={midx} className="flex items-center text-xs">
                          <div 
                            className="h-4 w-4 rounded-full mr-1.5"
                            style={{ 
                              backgroundColor: statusColors[member.status]
                            }}
                            title={member.status}
                          ></div>
                          <span className="truncate">{member.name}</span>
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
      
      <div className="mt-3 pt-3 border-t border-gray-200/10">
        <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
          <Info className="h-3 w-3 mr-1" /> Legend
        </div>
        <div className="flex flex-wrap gap-2">
          {heatmapLegend.map((item, idx) => {
            const statusKey = item.status as TeamMemberStatus;
            return (
              <motion.div
                key={idx}
                className="flex items-center text-xs py-0.5 px-1.5 rounded"
                custom={idx}
                variants={legendVariants}
                initial="hidden"
                animate="visible"
              >
                <div 
                  className="h-3 w-3 rounded-full mr-1.5"
                  style={{ 
                    background: `linear-gradient(135deg, ${statusColors[statusKey]} 0%, ${statusGradientColors[statusKey]} 100%)`
                  }}
                ></div>
                <span className="text-gray-600">{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ProjectHeatmap;
