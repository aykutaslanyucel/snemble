
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
  pptx.company = "Team Management System";
  pptx.subject = "Team Capacity & Performance Report";
  pptx.title = "Team Capacity & Performance Report";

  // Add a sophisticated title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "F8FAFC" };
  
  titleSlide.addText("Team Capacity & Performance Report", {
    x: 1,
    y: 1.5,
    w: "80%",
    h: 1.5,
    fontSize: 42,
    fontFace: "Segoe UI",
    color: "1E293B",
    bold: true,
    align: "center",
  });
  
  titleSlide.addText(`Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, {
    x: 1,
    y: 3.2,
    w: "80%",
    fontSize: 18,
    fontFace: "Segoe UI",
    color: "64748B",
    align: "center",
  });

  titleSlide.addText("Comprehensive Team Analysis & Workload Distribution", {
    x: 1,
    y: 4,
    w: "80%",
    fontSize: 16,
    fontFace: "Segoe UI",
    color: "475569",
    align: "center",
    italic: true,
  });

  // Calculate enhanced summary statistics
  const totalMembers = members.length;
  const availableMembers = members.filter(
    (m) => m.status === "available" || m.status === "someAvailability"
  ).length;
  const unavailableMembers = totalMembers - availableMembers;
  const availabilityPercentage = Math.round((availableMembers / totalMembers) * 100);
  
  // Calculate project distribution
  const projectSet = new Set<string>();
  members.forEach(member => {
    member.projects.forEach(project => projectSet.add(project));
  });
  const totalProjects = projectSet.size;
  
  // Calculate average projects per member
  const totalProjectAssignments = members.reduce((sum, member) => sum + member.projects.length, 0);
  const avgProjectsPerMember = totalProjectAssignments / totalMembers;

  // Add an enhanced summary slide
  const summarySlide = pptx.addSlide();
  summarySlide.background = { color: "FFFFFF" };
  
  summarySlide.addText("Executive Summary", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    fontFace: "Segoe UI",
    color: "1E293B",
    bold: true,
  });
  
  // Key metrics in a structured layout
  const metrics = [
    { label: "Total Team Members", value: `${totalMembers}`, color: "3B82F6" },
    { label: "Available for New Work", value: `${availableMembers} (${availabilityPercentage}%)`, color: "10B981" },
    { label: "Currently Unavailable", value: `${unavailableMembers} (${100 - availabilityPercentage}%)`, color: "EF4444" },
    { label: "Active Projects", value: `${totalProjects}`, color: "8B5CF6" },
    { label: "Avg Projects per Member", value: `${avgProjectsPerMember.toFixed(1)}`, color: "F59E0B" }
  ];

  metrics.forEach((metric, index) => {
    const yPos = 1.5 + (index * 0.7);
    summarySlide.addText(`• ${metric.label}: `, {
      x: 0.8,
      y: yPos,
      fontSize: 16,
      fontFace: "Segoe UI",
      color: "374151",
      bold: true,
    });
    
    summarySlide.addText(metric.value, {
      x: 4.5,
      y: yPos,
      fontSize: 16,
      fontFace: "Segoe UI",
      color: metric.color,
      bold: true,
    });
  });

  // Add a beautiful chart to visualize availability
  summarySlide.addChart(pptx.ChartType.doughnut, [
    {
      name: "Team Availability",
      labels: ["Available", "Some Availability", "Unavailable"],
      values: [
        members.filter(m => m.status === "available").length,
        members.filter(m => m.status === "someAvailability").length,
        members.filter(m => m.status === "busy" || m.status === "seriouslyBusy" || m.status === "away" || m.status === "vacation").length
      ],
    },
  ], {
    x: 6.5,
    y: 1.5,
    w: 4.5,
    h: 4,
    chartColors: ["#10B981", "#F59E0B", "#EF4444"],
    showLegend: true,
    legendPos: "b",
    legendFontSize: 12,
    title: "Team Availability Distribution",
    titleFontSize: 14,
  });

  // Add a detailed team member list with enhanced formatting
  const detailSlide = pptx.addSlide();
  detailSlide.background = { color: "FFFFFF" };
  
  detailSlide.addText("Detailed Team Member Analysis", {
    x: 0.5,
    y: 0.5,
    fontSize: 28,
    fontFace: "Segoe UI",
    color: "1E293B",
    bold: true,
  });

  // Create a sophisticated table for team members
  const tableData = [];
  tableData.push([
    { text: "Name", options: { bold: true, color: "FFFFFF", fill: "1E293B", fontSize: 12 } },
    { text: "Position", options: { bold: true, color: "FFFFFF", fill: "1E293B", fontSize: 12 } },
    { text: "Status", options: { bold: true, color: "FFFFFF", fill: "1E293B", fontSize: 12 } },
    { text: "Active Projects", options: { bold: true, color: "FFFFFF", fill: "1E293B", fontSize: 12 } },
    { text: "Project Count", options: { bold: true, color: "FFFFFF", fill: "1E293B", fontSize: 12 } },
    { text: "Last Updated", options: { bold: true, color: "FFFFFF", fill: "1E293B", fontSize: 12 } },
  ]);

  // Sort members by name for the report
  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));

  // Add rows for each team member with enhanced styling
  sortedMembers.forEach((member, index) => {
    const statusColors = {
      available: { color: "047857", fill: "D1FAE5" },
      someAvailability: { color: "D97706", fill: "FEF3C7" },
      busy: { color: "DC2626", fill: "FEE2E2" },
      seriouslyBusy: { color: "991B1B", fill: "FEE2E2" },
      away: { color: "6B7280", fill: "F3F4F6" },
      vacation: { color: "7C3AED", fill: "EDE9FE" },
    };

    const statusStyle = statusColors[member.status as keyof typeof statusColors] || { color: "6B7280", fill: "F9FAFB" };
    const formattedDate = format(new Date(member.lastUpdated), "MMM d, yyyy");
    const isEvenRow = index % 2 === 0;
    const rowFill = isEvenRow ? "F8FAFC" : "FFFFFF";

    tableData.push([
      { text: member.name, options: { fontSize: 11, fill: rowFill, bold: true } },
      { text: member.position, options: { fontSize: 11, fill: rowFill } },
      { text: member.status.replace(/([A-Z])/g, ' $1').trim(), options: { 
        fontSize: 11, 
        color: statusStyle.color, 
        fill: statusStyle.fill,
        bold: true 
      }},
      { text: member.projects.slice(0, 2).join(", ") + (member.projects.length > 2 ? "..." : ""), options: { fontSize: 10, fill: rowFill } },
      { text: member.projects.length.toString(), options: { fontSize: 11, fill: rowFill, align: "center", bold: true } },
      { text: formattedDate, options: { fontSize: 10, fill: rowFill } },
    ]);
  });

  detailSlide.addTable(tableData, {
    x: 0.5,
    y: 1.2,
    w: 11,
    colW: [2, 1.8, 1.5, 2.5, 1, 1.2],
    border: { type: "solid", pt: 1, color: "E5E7EB" },
    fontFace: "Segoe UI",
    fontSize: 11,
    rowH: 0.4,
  });

  // Add project distribution slide
  if (totalProjects > 0) {
    const projectSlide = pptx.addSlide();
    projectSlide.background = { color: "FFFFFF" };
    
    projectSlide.addText("Project Distribution Analysis", {
      x: 0.5,
      y: 0.5,
      fontSize: 28,
      fontFace: "Segoe UI",
      color: "1E293B",
      bold: true,
    });

    // Calculate project member counts
    const projectMemberCounts = Array.from(projectSet).map(project => {
      const memberCount = members.filter(member => member.projects.includes(project)).length;
      return { project, count: memberCount };
    }).sort((a, b) => b.count - a.count);

    // Add project distribution chart
    if (projectMemberCounts.length > 0) {
      projectSlide.addChart(pptx.ChartType.bar, [
        {
          name: "Team Members",
          labels: projectMemberCounts.slice(0, 10).map(p => p.project.length > 15 ? p.project.substring(0, 12) + "..." : p.project),
          values: projectMemberCounts.slice(0, 10).map(p => p.count),
        },
      ], {
        x: 0.5,
        y: 1.5,
        w: 11,
        h: 4.5,
        chartColors: ["#3B82F6"],
        showLegend: false,
        title: "Project Team Distribution (Top 10 Projects)",
        titleFontSize: 16,
        dataLabelFontSize: 12,
        catAxisLabelFontSize: 10,
        valAxisLabelFontSize: 10,
      });
    }
  }

  // Save the file with a professional filename
  const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
  pptx.writeFile({ fileName: `Team-Capacity-Report-${timestamp}.pptx` });
}
