
import { TeamMember } from "@/types/TeamMemberTypes";
import { calculateCapacity } from "./teamMemberUtils";

/**
 * Filter members based on search query
 */
export const filterMembersBySearch = (members: TeamMember[], searchQuery: string): TeamMember[] => {
  const query = searchQuery.toLowerCase();
  return members.filter((member) => {
    return (
      member.name.toLowerCase().includes(query) ||
      member.position.toLowerCase().includes(query) ||
      member.projects.some((project) => project.toLowerCase().includes(query))
    );
  });
};

/**
 * Get members with available status
 */
export const getAvailableMembers = (members: TeamMember[]): TeamMember[] => {
  return members.filter((member) => 
    member.status === "available" || member.status === "someAvailability"
  );
};

/**
 * Get all unique projects from all members
 */
export const getActiveProjects = (members: TeamMember[]): string[] => {
  return [...new Set(members.flatMap((member) => member.projects))].sort();
};

/**
 * Create a mapping of projects to their team members
 */
export const getProjectsWithMembers = (members: TeamMember[], activeProjects: string[]) => {
  return activeProjects.map((project) => {
    const assignedMembers = members.filter((member) => 
      member.projects.includes(project)
    );
    return {
      name: project,
      members: assignedMembers,
      capacity: calculateCapacity(assignedMembers)
    };
  });
};
