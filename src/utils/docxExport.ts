
import { TeamMember } from "@/types/TeamMemberTypes";
import pptxgen from "pptxgenjs";
import { format } from "date-fns";

export function exportWordDocument(members: TeamMember[]) {
  // We're using pptxgen to generate a Word-like document
  // since it's already available in our dependencies
  const pptx = new pptxgen();

  // Set up the document properties
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "Snemble Team Management";
  pptx.company = "Snemble";
  pptx.subject = "Team Capacity Report";
  pptx.title = "Team Capacity Report";

  // Add a title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText("Team Capacity Report", {
    x: 1,
    y: 1,
    w: "80%",
    h: 1.5,
    fontSize: 36,
    fontFace: "Arial",
    color: "363636",
    bold: true,
    align: "center",
  });
  
  titleSlide.addText(`Generated on: ${format(new Date(), "MMMM d, yyyy")}`, {
    x: 1,
    y: 3,
    fontSize: 18,
    fontFace: "Arial",
    color: "767676",
    align: "center",
  });

  // Calculate summary statistics
  const totalMembers = members.length;
  const availableMembers = members.filter(
    (m) => m.status === "available" || m.status === "someAvailability"
  ).length;
  const unavailableMembers = totalMembers - availableMembers;
  const availabilityPercentage = Math.round((availableMembers / totalMembers) * 100);

  // Add a summary slide
  const summarySlide = pptx.addSlide();
  summarySlide.addText("Team Availability Summary", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    fontFace: "Arial",
    color: "363636",
    bold: true,
  });
  
  summarySlide.addText([
    { text: `Total Team Members: ${totalMembers}`, options: { fontSize: 16, bullet: true } },
    { text: `Available Members: ${availableMembers} (${availabilityPercentage}%)`, options: { fontSize: 16, bullet: true } },
    { text: `Unavailable Members: ${unavailableMembers} (${100 - availabilityPercentage}%)`, options: { fontSize: 16, bullet: true } },
  ], {
    x: 0.5,
    y: 1.2,
    w: "90%",
    h: 2,
    fontFace: "Arial",
    color: "363636",
  });

  // Add a chart to visualize availability
  summarySlide.addChart(pptx.ChartType.pie, [
    {
      name: "Available",
      labels: ["Available", "Unavailable"],
      values: [availableMembers, unavailableMembers],
    },
  ], {
    x: 2,
    y: 3,
    w: 6,
    h: 3.5,
    chartColors: ["#22c55e", "#ef4444"],
    showLegend: true,
    legendPos: "b",
    legendFontSize: 12,
  });

  // Add a detailed team member list
  const detailSlide = pptx.addSlide();
  detailSlide.addText("Team Member Details", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    fontFace: "Arial",
    color: "363636",
    bold: true,
  });

  // Create a table for team members
  const tableData = [];
  tableData.push([
    { text: "Name", options: { bold: true, color: "FFFFFF", fill: "363636" } },
    { text: "Position", options: { bold: true, color: "FFFFFF", fill: "363636" } },
    { text: "Status", options: { bold: true, color: "FFFFFF", fill: "363636" } },
    { text: "Projects", options: { bold: true, color: "FFFFFF", fill: "363636" } },
    { text: "Last Updated", options: { bold: true, color: "FFFFFF", fill: "363636" } },
  ]);

  // Sort members by name for the report
  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));

  // Add rows for each team member
  sortedMembers.forEach((member) => {
    const statusColors = {
      available: "22c55e",
      someAvailability: "f59e0b",
      unavailable: "ef4444",
    };

    const statusColor = statusColors[member.status] || "767676";
    const formattedDate = format(new Date(member.lastUpdated), "MMM d, yyyy");

    tableData.push([
      { text: member.name },
      { text: member.position },
      { text: member.status, options: { color: statusColor, bold: true } },
      { text: member.projects.join(", ") },
      { text: formattedDate },
    ]);
  });

  detailSlide.addTable(tableData, {
    x: 0.5,
    y: 1.2,
    w: "90%",
    colW: [2, 2, 1.5, 2.5, 1.5],
    border: { type: "solid", pt: 1, color: "363636" },
    fontFace: "Arial",
    fontSize: 12,
  });

  // Save the file (download it)
  pptx.writeFile({ fileName: `Team-Capacity-Report-${format(new Date(), "yyyy-MM-dd")}.pptx` });
}
