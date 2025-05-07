
import { TeamMember } from "@/types/TeamMemberTypes";

// Status button configs with colors but without labels - simplified
const STATUS_BUTTONS = [
  { status: "available", color: "#D3E4FD", tooltip: "Available" },
  { status: "someAvailability", color: "#F2FCE2", tooltip: "Some Availability" },
  { status: "busy", color: "#FEF7CD", tooltip: "Busy" },
  { status: "seriouslyBusy", color: "#FFDEE2", tooltip: "Seriously Busy" },
  { status: "away", color: "#F1F0FB", tooltip: "Away" },
];

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
  const statusConfig = STATUS_BUTTONS.find(s => s.status === member.status);
  return {
    background: statusConfig?.color || "#F1F0FB",
    className: ""
  };
}
