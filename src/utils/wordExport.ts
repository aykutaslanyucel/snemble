
import { TeamMember } from "@/types/TeamMemberTypes";
import { format } from "date-fns";

export function exportWordDocument(members: TeamMember[]) {
  // Calculate summary statistics
  const totalMembers = members.length;
  const availableMembers = members.filter(
    (m) => m.status === "available" || m.status === "someAvailability"
  ).length;
  const unavailableMembers = totalMembers - availableMembers;
  const availabilityPercentage = Math.round((availableMembers / totalMembers) * 100);

  // Create HTML content for Word document
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Team Capacity Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        .summary { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        th { background-color: #f9fafb; font-weight: bold; }
        .status-available { color: #059669; font-weight: bold; }
        .status-busy { color: #d97706; font-weight: bold; }
        .status-unavailable { color: #dc2626; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Team Capacity Report</h1>
      <p><strong>Generated on:</strong> ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
      
      <div class="summary">
        <h2>Executive Summary</h2>
        <div class="metric">
          <div class="metric-value">${totalMembers}</div>
          <div class="metric-label">Total Team Members</div>
        </div>
        <div class="metric">
          <div class="metric-value">${availableMembers}</div>
          <div class="metric-label">Available Members</div>
        </div>
        <div class="metric">
          <div class="metric-value">${unavailableMembers}</div>
          <div class="metric-label">Unavailable Members</div>
        </div>
        <div class="metric">
          <div class="metric-value">${availabilityPercentage}%</div>
          <div class="metric-label">Availability Rate</div>
        </div>
      </div>

      <h2>Team Member Details</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Status</th>
            <th>Projects</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(member => {
            const statusClass = 
              member.status === 'available' || member.status === 'someAvailability' ? 'status-available' :
              member.status === 'busy' || member.status === 'seriouslyBusy' ? 'status-busy' : 'status-unavailable';
            
            const statusText = 
              member.status === 'available' ? 'Available' :
              member.status === 'someAvailability' ? 'Some Availability' :
              member.status === 'busy' ? 'Busy' :
              member.status === 'seriouslyBusy' ? 'Seriously Busy' :
              member.status === 'away' ? 'Away' : 'Vacation';
            
            return `
              <tr>
                <td>${member.name}</td>
                <td>${member.position}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>${member.projects.join(', ') || 'No projects assigned'}</td>
                <td>${format(new Date(member.lastUpdated), "MMM d, yyyy")}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <h2>Status Distribution</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${['available', 'someAvailability', 'busy', 'seriouslyBusy', 'away', 'vacation'].map(status => {
            const count = members.filter(m => m.status === status).length;
            const percentage = Math.round((count / totalMembers) * 100);
            const statusLabel = status === 'available' ? 'Available' :
                              status === 'someAvailability' ? 'Some Availability' :
                              status === 'busy' ? 'Busy' :
                              status === 'seriouslyBusy' ? 'Seriously Busy' :
                              status === 'away' ? 'Away' : 'Vacation';
            
            return count > 0 ? `
              <tr>
                <td>${statusLabel}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
              </tr>
            ` : '';
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was generated by Snemble Team Management System</p>
        <p>For questions or support, please contact your system administrator</p>
      </div>
    </body>
    </html>
  `;

  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Team_Capacity_Report_${format(new Date(), "yyyy-MM-dd")}.doc`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}
