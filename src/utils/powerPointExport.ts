
import pptxgen from "pptxgenjs";
import { TeamMember } from "@/types/TeamMemberTypes";
import { format } from "date-fns";

// Status configuration for colors and labels
const statusConfig = {
  available: {
    color: "D6E4FF",
    label: "Available",
  },
  someAvailability: {
    color: "C8EAD7",
    label: "Some Availability",
  },
  busy: {
    color: "FFD8A8",
    label: "Busy",
  },
  seriouslyBusy: {
    color: "FFA3A3",
    label: "Seriously Busy",
  },
  away: {
    color: "C4C4C4",
    label: "Away",
  },
};

export const exportCapacityReport = (members: TeamMember[]) => {
  // Create a new PowerPoint presentation
  const pptx = new pptxgen();
  
  // Set the presentation properties
  pptx.layout = "LAYOUT_16x9";
  pptx.title = "Team Capacity Report";
  
  // Add a slide
  const slide = pptx.addSlide();
  
  // Calculate layout for team member cards
  const cardWidth = 2.5; // inches
  const cardHeight = 1.8; // inches
  const cardsPerRow = 4;
  const startX = 0.5; // inches from left
  const startY = 0.5; // inches from top
  const hGap = 0.2; // horizontal gap between cards
  const vGap = 0.2; // vertical gap between cards
  
  // Add member cards
  members.forEach((member, index) => {
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;
    
    const x = startX + col * (cardWidth + hGap);
    const y = startY + row * (cardHeight + vGap);
    
    const status = statusConfig[member.status];
    
    // Create card background
    slide.addShape(pptx.ShapeType.rect, {
      x,
      y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: status.color },
      line: { color: "FFFFFF", width: 1 },
      shadow: { type: "outer", angle: 45, blur: 5, offset: 2, color: "888888", opacity: 0.2 },
    });
    
    // Add member name
    slide.addText(member.name, {
      x: x + 0.1,
      y: y + 0.1,
      w: cardWidth - 0.2,
      fontSize: 14,
      bold: true,
      color: "333333",
    });
    
    // Add position
    slide.addText(member.position, {
      x: x + 0.1,
      y: y + 0.4,
      w: cardWidth - 0.2,
      fontSize: 11,
      color: "555555",
    });
    
    // Add projects
    slide.addText("Projects: " + (member.projects.length ? member.projects.join(", ") : "None"), {
      x: x + 0.1,
      y: y + 0.7,
      w: cardWidth - 0.2,
      fontSize: 10,
      color: "555555",
    });
    
    // Add status
    slide.addText("Status: " + status.label, {
      x: x + 0.1,
      y: y + 1.0,
      w: cardWidth - 0.2,
      fontSize: 10,
      color: "555555",
    });
    
    // Add last active time
    slide.addText("Last Active: " + format(member.lastUpdated, "MMM d, h:mm a"), {
      x: x + 0.1,
      y: y + 1.3,
      w: cardWidth - 0.2,
      fontSize: 10,
      color: "777777",
    });
  });
  
  // Save the presentation
  pptx.writeFile({ fileName: "Capacity Report.pptx" });
};
