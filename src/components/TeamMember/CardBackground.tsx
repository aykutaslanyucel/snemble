import { TeamMember, TeamMemberStatus } from "@/types/TeamMemberTypes";

export const getStatusText = (status: TeamMemberStatus) => {
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
    case "vacation":
      return "On Vacation";
    default:
      return "Unknown";
  }
};

export const getCardBackground = (member: TeamMember) => {
  // If user is on vacation, always use vacation styling
  if (member.isOnVacation) {
    return {
      background: "linear-gradient(135deg, #FFEDD5 0%, #FFCB8B 100%)",
      className: "border-orange-200"
    };
  }

  // If the member has custom styling and is not on vacation, use that
  if (member.customization) {
    if (member.customization.gradient) {
      return {
        background: member.customization.gradient,
        className: ""
      };
    }
    
    if (member.customization.color) {
      return {
        background: member.customization.color,
        className: ""
      };
    }
    
    if (member.customization.backgroundImage) {
      return {
        background: `url(${member.customization.backgroundImage}) center/cover no-repeat`,
        className: ""
      };
    }
  }
  
  // Otherwise use default status-based styling
  switch (member.status) {
    case "available":
      return {
        background: "linear-gradient(135deg, #E9F7EF 0%, #D4EFDF 100%)",
        className: "border-green-200"
      };
    case "someAvailability":
      return {
        background: "linear-gradient(135deg, #EBF5FB 0%, #D6EAF8 100%)",
        className: "border-blue-200"
      };
    case "busy":
      return {
        background: "linear-gradient(135deg, #FEF9E7 0%, #FCF3CF 100%)",
        className: "border-yellow-200"
      };
    case "seriouslyBusy":
      return {
        background: "linear-gradient(135deg, #FADBD8 0%, #F5B7B1 100%)",
        className: "border-red-200"
      };
    case "away":
      return {
        background: "linear-gradient(135deg, #F4F6F6 0%, #E5E8E8 100%)",
        className: "border-gray-200"
      };
    case "vacation":
      return {
        background: "linear-gradient(135deg, #FFEDD5 0%, #FFCB8B 100%)",
        className: "border-orange-200"
      };
    default:
      return {
        background: "linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)",
        className: "border-gray-200"
      };
  }
};
