
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Folder, PieChart, AlertTriangle } from "lucide-react";
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
  
  const sortedProjects = useMemo(() => {
    return [...projectData].sort((a, b) => a.averageScore - b.averageScore);
  }, [projectData]);
  
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.04,
        delayChildren: 0.1,
      }
    }
  };
  
  // Animation variants for the project items
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <Card className="p-5 bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <PieChart className="w-4 h-4 mr-2 text-fuchsia-300" />
          <span>Project Health</span>
          <Badge 
            variant="outline" 
            className="ml-2 bg-white/10 text-xs font-normal"
          >
            {projectData.length}
          </Badge>
        </h3>
      </div>
      
      <TooltipProvider>
        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedProjects.map((project, idx) => {
            const statusKey = scoreToStatus[project.category];
            const color = statusColors[statusKey];
            
            // Calculate risk level indicator
            let riskIndicator = "Low";
            let riskColor = "bg-green-100 text-green-800";
            
            if (project.category === "overloaded" || project.category === "constrained") {
              riskIndicator = "High";
              riskColor = "bg-red-100 text-red-800";
            } else if (project.category === "manageable") {
              riskIndicator = "Medium";
              riskColor = "bg-yellow-100 text-yellow-800";
            }
            
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="bg-white/5 rounded-xl p-3 border border-white/10 transition-all hover:bg-white/10 cursor-pointer"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{project.name}</h4>
                            {project.category === "overloaded" && (
                              <AlertTriangle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                          <div className="flex items-center mt-1 space-x-1">
                            <div className="flex -space-x-1.5">
                              {project.members.slice(0, 3).map((member, midx) => (
                                <div 
                                  key={midx}
                                  className="h-5 w-5 rounded-full flex items-center justify-center bg-white/20 text-[10px] font-medium ring-1 ring-white/5"
                                  title={member.name}
                                >
                                  {member.name.charAt(0)}
                                </div>
                              ))}
                              {project.members.length > 3 && (
                                <div className="h-5 w-5 rounded-full flex items-center justify-center bg-white/10 text-[10px] font-medium ring-1 ring-white/5">
                                  +{project.members.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 ml-2">
                              {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${riskColor}`}>
                          {riskIndicator}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          Score: {project.averageScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(project.averageScore / 3) * 100}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="p-0 overflow-hidden rounded-lg border border-white/10">
                  <div className="bg-white/10 backdrop-blur-lg p-3">
                    <h5 className="font-semibold text-sm mb-2">{project.name}</h5>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                      {project.members.map((member, midx) => (
                        <div key={midx} className="flex items-center text-xs">
                          <div 
                            className="h-2 w-2 rounded-full mr-1.5"
                            style={{ backgroundColor: statusColors[member.status] }}
                          />
                          <span>{member.name}</span>
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
