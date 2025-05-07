
import { TeamMember } from "@/types/TeamMemberTypes";

// Status colors for cards with exact color matching
const STATUS_COLORS = {
  "available": "#dae7ff", // Blue for Available
  "someAvailability": "#fdfdfd", // Green for Some Availability
  "busy": "#f4f4f4", // Orange for Busy
  "seriouslyBusy": "#ffacac", // Red/Pink for Seriously Busy
  "away": "#fdfdfe" // Gray for Away
};

export function getCardBackground(member: TeamMember) {
  // Safe access to member.customization with proper typing
  const customization = member.customization || {};
  
  if (customization.gradient) {
    return {
      background: customization.gradient,
      className: customization.animate ? "animate-gradient" : ""
    };
  }
  if (customization.color) {
    return {
      background: customization.color,
      className: ""
    };
  }
  
  // Default color based on status
  const backgroundColor = STATUS_COLORS[member.status] || "#F1F0FB";
  return {
    background: backgroundColor,
    className: ""
  };
}

export function getStatusText(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "someAvailability":
      return "Some Availability";
    case "busy":
      return "Busy";
    case "seriouslyBusy":
      return "Seriously Busy";
    case "away":
      return "Away";
    default:
      return "Unknown";
  }
}
