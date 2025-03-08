
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";

type TeamMemberStatus = 'available' | 'someAvailability' | 'busy' | 'seriouslyBusy' | 'away';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  status: TeamMemberStatus;
  projects: string[];
  lastUpdated: Date;
}

interface ProjectWorkload {
  name: string;
  score: number;
  category: 'severelyOverloaded' | 'highWorkload' | 'balancedWorkload' | 'lowWorkload' | 'inactive';
  assignedMembers: TeamMember[];
}

interface Props {
  members: TeamMember[];
}

// Status point values for workload calculation
const STATUS_POINTS = {
  available: 3,
  someAvailability: 2,
  busy: 1,
  seriouslyBusy: 0,
  away: 0, // Away members are excluded from calculation
};

// Base colors for each category
const CATEGORY_COLORS = {
  severelyOverloaded: "#FFA6A6", // Red
  highWorkload: "#FFDCB1",       // Yellow
  balancedWorkload: "#CDECDB",   // Green
  lowWorkload: "#D6E4FF",        // Blue
  inactive: "#C4C4C4",           // Gray
};

// Category names for display
const CATEGORY_NAMES = {
  severelyOverloaded: "Severely Overloaded",
  highWorkload: "High Workload",
  balancedWorkload: "Balanced Workload",
  lowWorkload: "Low Workload",
  inactive: "Inactive Projects",
};

// Icons for categories
const CATEGORY_ICONS = {
  severelyOverloaded: AlertTriangle,
  highWorkload: AlertTriangle,
  balancedWorkload: CheckCircle,
  lowWorkload: CheckCircle,
  inactive: Users,
};

export function ProjectHeatmap({ members }: Props) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Calculate project workloads
  const projectWorkloads = useMemo(() => {
    // Get all unique projects
    const projectSet = new Set<string>();
    members.forEach(member => {
      member.projects.forEach(project => projectSet.add(project));
    });
    const projectNames = Array.from(projectSet);

    // Calculate workload for each project
    return projectNames.map(projectName => {
      const assignedMembers = members.filter(member => 
        member.projects.includes(projectName)
      );

      // Only include non-away members in calculation
      const activeMembers = assignedMembers.filter(member => member.status !== 'away');
      
      // If all members are away, mark as inactive
      if (activeMembers.length === 0) {
        return {
          name: projectName,
          score: 0,
          category: 'inactive' as const,
          assignedMembers
        };
      }

      // Calculate average availability score
      const totalPoints = activeMembers.reduce((sum, member) => {
        return sum + STATUS_POINTS[member.status];
      }, 0);
      const avgScore = totalPoints / activeMembers.length;

      // Determine category based on score
      let category: ProjectWorkload['category'];
      if (avgScore <= 1.0) {
        category = 'severelyOverloaded';
      } else if (avgScore <= 2.0) {
        category = 'highWorkload';
      } else if (avgScore <= 2.7) {
        category = 'balancedWorkload';
      } else {
        category = 'lowWorkload';
      }

      return {
        name: projectName,
        score: avgScore,
        category,
        assignedMembers
      };
    });
  }, [members]);

  // Sort projects by category (most overloaded first) and then by score (ascending within category)
  const sortedProjects = useMemo(() => {
    const categoryOrder = ['severelyOverloaded', 'highWorkload', 'balancedWorkload', 'lowWorkload', 'inactive'];
    
    return [...projectWorkloads].sort((a, b) => {
      // First sort by category
      const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      
      // Then sort by score (ascending = more overloaded first)
      return a.score - b.score;
    });
  }, [projectWorkloads]);

  // Group projects by category
  const projectsByCategory = useMemo(() => {
    const grouped: Record<string, ProjectWorkload[]> = {
      severelyOverloaded: [],
      highWorkload: [],
      balancedWorkload: [],
      lowWorkload: [],
      inactive: []
    };

    sortedProjects.forEach(project => {
      grouped[project.category].push(project);
    });

    return grouped;
  }, [sortedProjects]);

  // Calculate background color with gradient based on score within category
  const getBackgroundColor = (project: ProjectWorkload, index: number, totalInCategory: number) => {
    const baseColor = CATEGORY_COLORS[project.category];
    
    // For inactive projects, just return gray
    if (project.category === 'inactive') return baseColor;
    
    // Calculate position in gradient (0 = darkest, 1 = lightest)
    // We invert the position to make highest workload (lowest score) darkest
    const position = index / (totalInCategory - 1 || 1);
    
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Lighten color based on position (higher position = lighter color)
    // The lightest color will be the base color + 35% white
    const lightenAmount = position * 35;
    const newR = Math.min(255, r + lightenAmount);
    const newG = Math.min(255, g + lightenAmount);
    const newB = Math.min(255, b + lightenAmount);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl w-full mt-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="h-3 w-3 rounded-full bg-[#E5DEFF] mr-2" />
          Project Workload Heatmap
        </h3>
      </div>

      <TooltipProvider>
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(projectsByCategory)
            .filter(([_, projects]) => projects.length > 0)
            .map(([category, projects]) => (
              <motion.div key={category} className="space-y-2" variants={itemVariants}>
                <div className="flex items-center gap-2">
                  {React.createElement(CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS], {
                    className: `h-4 w-4 text-${category === 'severelyOverloaded' || category === 'highWorkload' ? 'amber-500' : 'emerald-500'}`
                  })}
                  <h4 className="text-sm font-medium text-gray-700">
                    {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]} ({projects.length})
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  {projects.map((project, index) => (
                    <Tooltip key={project.name}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="h-14 rounded-lg flex items-center justify-center px-3 py-2 cursor-pointer transition-shadow hover:shadow-md relative overflow-hidden group"
                          style={{ 
                            backgroundColor: getBackgroundColor(project, index, projects.length),
                          }}
                          onMouseEnter={() => setHoveredProject(project.name)}
                          onMouseLeave={() => setHoveredProject(null)}
                          whileHover={{ scale: 1.02 }}
                          variants={itemVariants}
                        >
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <p className="text-xs font-medium text-center line-clamp-2 text-gray-800 z-10">
                            {project.name}
                          </p>
                          {project.name === hoveredProject && (
                            <div className="absolute bottom-1 right-1">
                              <Users className="h-3 w-3 text-gray-600" />
                            </div>
                          )}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="p-3 max-w-xs bg-white/90 backdrop-blur border-white/20 shadow-lg rounded-lg">
                        <div className="space-y-2">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-600">
                            Score: {project.score.toFixed(1)}/3.0
                          </div>
                          <div className="text-xs font-medium mt-1">Team Members:</div>
                          <div className="max-h-40 overflow-y-auto pr-1 fancy-scroll space-y-1">
                            {project.assignedMembers.length > 0 ? (
                              project.assignedMembers.map(member => (
                                <div key={member.id} className="flex items-center gap-2">
                                  <div 
                                    className="h-2 w-2 rounded-full flex-shrink-0" 
                                    style={{ 
                                      backgroundColor: 
                                        member.status === 'available' ? '#D3E4FD' :
                                        member.status === 'someAvailability' ? '#F2FCE2' :
                                        member.status === 'busy' ? '#FEF7CD' :
                                        member.status === 'seriouslyBusy' ? '#FFDEE2' : '#F1F0FB'
                                    }}
                                  />
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
                  ))}
                </div>
              </motion.div>
            ))}
        </motion.div>
      </TooltipProvider>
    </Card>
  );
}
