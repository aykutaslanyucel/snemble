
import pptxgen from "pptxgenjs";
import { formatDistanceToNow } from "date-fns";
import { TeamMember } from "@/types/TeamMemberTypes";

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
  }
};

export const exportCapacityReport = (members: TeamMember[]) => {
  // Create a new presentation
  const pptx = new pptxgen();

  // Set the slide dimensions (16:9 ratio)
  const slide = pptx.addSlide();
  
  // Calculate grid layout
  const cardWidth = 3.5; // Width of each card in inches
  const cardHeight = 2; // Height of each card in inches
  const slideWidth = 10; // Slide width in inches
  const slideHeight = 5.625; // Slide height in inches (16:9 ratio)
  const margin = 0.2; // Margin between cards
  const maxCardsPerRow = Math.floor((slideWidth - margin) / (cardWidth + margin));
  
  members.forEach((member, index) => {
    // Calculate position in grid
    const row = Math.floor(index / maxCardsPerRow);
    const col = index % maxCardsPerRow;
    const x = margin + col * (cardWidth + margin);
    const y = margin + row * (cardHeight + margin);

    // Get status color and label
    const statusInfo = statusConfig[member.status] || statusConfig.available;
    const timeAgo = formatDistanceToNow(member.lastUpdated, { addSuffix: true });
    
    // Create card shape - Fixed type error by using the correct shape name from pptxgenjs
    slide.addShape("rect", {
      x: x,
      y: y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: statusInfo.color },
      line: { color: "FFFFFF", width: 1 },
      rectRadius: 0.1, // Rounded corners
    });

    // Add name (bold)
    slide.addText(member.name, {
      x: x + 0.2,
      y: y + 0.2,
      w: cardWidth - 0.4,
      fontSize: 14,
      bold: true,
      color: "000000",
    });

    // Add position/role
    slide.addText(member.position, {
      x: x + 0.2,
      y: y + 0.5,
      w: cardWidth - 0.4,
      fontSize: 10,
      color: "666666",
    });

    // Add projects (as a list)
    const projectsText = member.projects.length > 0 
      ? member.projects.join(", ")
      : "No projects";
    
    slide.addText("Projects: " + projectsText, {
      x: x + 0.2,
      y: y + 0.8,
      w: cardWidth - 0.4,
      fontSize: 10,
      color: "000000",
      breakLine: true,
    });

    // Add status
    slide.addText("Status: " + statusInfo.label, {
      x: x + 0.2,
      y: y + 1.4,
      w: cardWidth - 0.4,
      fontSize: 10,
      color: "000000",
    });

    // Add last active time
    slide.addText("Last active: " + timeAgo, {
      x: x + 0.2,
      y: y + 1.6,
      w: cardWidth - 0.4,
      fontSize: 9,
      color: "666666",
      italic: true,
    });
  });

  // Save the presentation
  pptx.writeFile({ fileName: "Capacity Report.pptx" });
};
