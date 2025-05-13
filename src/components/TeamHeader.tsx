
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TeamSelector } from "@/components/TeamSelector";

export function TeamHeader() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <TeamSelector userId={user?.id} isAdmin={isAdmin} />
    </div>
  );
}
