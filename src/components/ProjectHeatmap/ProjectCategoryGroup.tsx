
import React from "react";
import { motion } from "framer-motion";
import { ProjectWorkload, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_NAMES } from "./types";
import { ProjectCard } from "./ProjectCard";

interface ProjectCategoryGroupProps {
  category: string;
  projects: ProjectWorkload[];
  setHoveredProject: (projectName: string | null) => void;
}

export function ProjectCategoryGroup({ category, projects, setHoveredProject }: ProjectCategoryGroupProps) {
  const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];

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
    <motion.div className="space-y-2" variants={itemVariants}>
      <div className="flex items-center gap-1.5 mb-1">
        {React.createElement(Icon, {
          className: `h-3 w-3 ${
            category === 'severelyOverloaded' ? 'text-[#FF8080]' : 
            category === 'highWorkload' ? 'text-[#FFBB66]' : 
            category === 'balancedWorkload' ? 'text-[#A8DEBC]' : 
            category === 'lowWorkload' ? 'text-[#ACCBEE]' : 
            'text-[#E0E0E0]'
          }`
        })}
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]} ({projects.length})
        </h4>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.name}
            project={project}
            backgroundColor={getBackgroundColor(project, index, projects.length)}
            setHoveredProject={setHoveredProject}
          />
        ))}
      </div>
    </motion.div>
  );
}
