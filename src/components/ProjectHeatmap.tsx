import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Circle } from "lucide-react";
import { TeamMember } from "@/types/TeamMemberTypes";
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
  away: 0 // Away members are excluded from calculation
};

// Updated modern color palette for 2025 design trend
const CATEGORY_COLORS = {
  severelyOverloaded: "#FF8080",
  // Refined red
  highWorkload: "#FFBB66",
  // Refined amber
  balancedWorkload: "#A8DEBC",
  // Refined green
  lowWorkload: "#ACCBEE",
  // Refined blue
  inactive: "#E0E0E0" // Refined gray
};

// Category names with shorter labels for minimalistic design
const CATEGORY_NAMES = {
  severelyOverloaded: "Critical",
  highWorkload: "High",
  balancedWorkload: "Balanced",
  lowWorkload: "Available",
  inactive: "Inactive"
};

// Icons for categories - simplified
const CATEGORY_ICONS = {
  severelyOverloaded: AlertTriangle,
  highWorkload: AlertTriangle,
  balancedWorkload: CheckCircle,
  lowWorkload: CheckCircle,
  inactive: Circle
};
export function ProjectHeatmap({
  members
}: Props) {
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
      const assignedMembers = members.filter(member => member.projects.includes(projectName));

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

      // Determine category based on score using corrected boundaries:
      // 0.0-0.9: severely overloaded (Red)
      // 1.0-1.9: high workload (Yellow)
      // 2.0-2.69: balanced workload (Green)
      // 2.7-3.0: low workload (Blue)
      let category: ProjectWorkload['category'];
      if (avgScore < 1.0) {
        category = 'severelyOverloaded';
      } else if (avgScore < 2.0) {
        category = 'highWorkload';
      } else if (avgScore < 2.7) {
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
    const position = totalInCategory > 1 ? index / (totalInCategory - 1) : 0.5;

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
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
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
  return <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/5 shadow-lg rounded-xl w-full mt-8">
      <div className="flex items-center mb-5">
        <h3 className="text-lg font-medium flex items-center text-slate-50">
          
          Project Workload
        </h3>
      </div>

      <TooltipProvider>
        <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
          {Object.entries(projectsByCategory).filter(([_, projects]) => projects.length > 0).map(([category, projects]) => <motion.div key={category} className="space-y-2" variants={itemVariants}>
                <div className="flex items-center gap-1.5 mb-1">
                  {React.createElement(CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS], {
              className: `h-3 w-3 ${category === 'severelyOverloaded' ? 'text-[#FF8080]' : category === 'highWorkload' ? 'text-[#FFBB66]' : category === 'balancedWorkload' ? 'text-[#A8DEBC]' : category === 'lowWorkload' ? 'text-[#ACCBEE]' : 'text-[#E0E0E0]'}`
            })}
                  <h4 className="text-xs font-medium uppercase tracking-wide text-slate-50">
                    {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]} ({projects.length})
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
                  {projects.map((project, index) => <Tooltip key={project.name}>
                      <TooltipTrigger asChild>
                        <motion.div className="h-12 rounded-md flex items-center justify-center px-2 py-1 cursor-pointer transition-all hover:shadow-sm relative overflow-hidden group" style={{
                  backgroundColor: getBackgroundColor(project, index, projects.length)
                }} onMouseEnter={() => setHoveredProject(project.name)} onMouseLeave={() => setHoveredProject(null)} whileHover={{
                  scale: 1.01
                }} variants={itemVariants}>
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
                            <div className="h-1.5 w-1.5 rounded-full" style={{
                      backgroundColor: CATEGORY_COLORS[project.category]
                    }} />
                            {CATEGORY_NAMES[project.category as keyof typeof CATEGORY_NAMES]} ({project.score.toFixed(1)}/3.0)
                          </div>
                          <div className="text-xs font-medium mt-1">Team ({project.assignedMembers.length})</div>
                          <div className="max-h-32 overflow-y-auto pr-1 fancy-scroll space-y-1">
                            {project.assignedMembers.length > 0 ? project.assignedMembers.map(member => <div key={member.id} className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{
                        backgroundColor: member.status === 'available' ? '#A8DEBC' : member.status === 'someAvailability' ? '#ACCBEE' : member.status === 'busy' ? '#FFBB66' : member.status === 'seriouslyBusy' ? '#FF8080' : '#E0E0E0'
                      }} />
                                  <span className="text-xs">{member.name}</span>
                                </div>) : <div className="text-xs text-gray-500">No team members assigned</div>}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>)}
                </div>
              </motion.div>)}
        </motion.div>
      </TooltipProvider>
    </Card>;
}