
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { TeamMember, TeamMemberStatus, TeamMemberRole } from "@/types/TeamMemberTypes";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculate the capacity of a team based on the availability status of its members
 */
export function calculateCapacity(teamMembers: TeamMember[]) {
  if (teamMembers.length === 0) return 0;
  
  let availableCount = 0;
  let partialCount = 0;
  
  teamMembers.forEach(member => {
    if (member.status === "available") {
      availableCount++;
    } else if (member.status === "someAvailability") {
      partialCount++;
    }
  });
  
  return Math.round(((availableCount + (partialCount * 0.5)) / teamMembers.length) * 100);
}

/**
 * Create a new team member
 */
export const createTeamMember = async (userId: string) => {
  const newId = uuidv4();
  const newMember: TeamMember = {
    id: newId,
    name: "New Team Member",
    position: "Position",
    status: "available" as TeamMemberStatus,
    projects: [],
    lastUpdated: new Date(),
    userId: userId
  };
  
  await setDoc(doc(db, "teamMembers", newId), newMember);
  return newMember;
};

/**
 * Update a team member field
 */
export const updateTeamMember = async (id: string, field: string, value: any) => {
  const memberRef = doc(db, "teamMembers", id);
  
  // Handle projects update
  if (field === "projects" && typeof value === "string") {
    const projects = value.split(";").map(p => p.trim()).filter(p => p);
    await updateDoc(memberRef, {
      projects: projects,
      lastUpdated: new Date()
    });
  } 
  // Handle customization update
  else if (field === "customization") {
    await updateDoc(memberRef, {
      customization: value,
      lastUpdated: new Date()
    });
  } 
  // Handle normal field updates
  else {
    await updateDoc(memberRef, {
      [field]: value,
      lastUpdated: new Date()
    });
  }
};

/**
 * Delete a team member
 */
export const deleteTeamMember = async (id: string) => {
  await deleteDoc(doc(db, "teamMembers", id));
};

/**
 * Ensure admin user exists and has correct role
 */
export const ensureAdminUser = async (members: TeamMember[], isUserAdmin: boolean) => {
  const ADMIN_ID = "b82c63f6-1aa9-4150-a857-eeac0b9c921b";
  const adminUser = members.find(member => member.id === ADMIN_ID);
  
  // Ensure admin user has admin role if role exists
  if (adminUser && adminUser.role && adminUser.role !== "admin" as TeamMemberRole) {
    await updateDoc(doc(db, "teamMembers", ADMIN_ID), {
      role: "admin" as TeamMemberRole
    });
  }

  // Create admin user team member if doesn't exist
  if (!adminUser && isUserAdmin) {
    const adminMember: TeamMember = {
      id: ADMIN_ID,
      name: "Admin User",
      position: "Admin",
      status: "available" as TeamMemberStatus,
      projects: [],
      lastUpdated: new Date(),
      role: "admin" as TeamMemberRole,
      userId: ADMIN_ID
    };
    await setDoc(doc(db, "teamMembers", ADMIN_ID), adminMember);
  }
};
