
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

// TeamHeader is now a much simpler component since the team selection
// has been moved into the dropdown from the main header
export function TeamHeader() {
  return (
    <div className="flex items-center justify-between">
      {/* Team header content can be expanded as needed */}
    </div>
  );
}
