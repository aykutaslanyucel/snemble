
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { TeamMember } from "@/types/TeamMemberTypes";
import { ProjectWorkload, STATUS_POINTS, Props } from "./types";
import { ProjectCategoryGroup } from "./ProjectCategoryGroup";

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

      // Determine category based on score
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

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/5 shadow-lg rounded-xl w-full mt-8">
      <div className="flex items-center mb-5">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <div className="h-2 w-2 rounded-full bg-[#ACCBEE] mr-2" />
          Project Workload
        </h3>
      </div>

      <TooltipProvider>
        <motion.div 
          className="space-y-5" 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          {Object.entries(projectsByCategory)
            .filter(([_, projects]) => projects.length > 0)
            .map(([category, projects]) => (
              <ProjectCategoryGroup 
                key={category}
                category={category}
                projects={projects}
                setHoveredProject={setHoveredProject}
              />
            ))
          }
        </motion.div>
      </TooltipProvider>
    </Card>
  );
}
