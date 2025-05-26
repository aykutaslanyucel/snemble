
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, Download, FileText } from "lucide-react";
import { TeamMember } from "@/types/TeamMemberTypes";
import { exportWordDocument } from "@/utils/wordExport";
import { exportPowerPointDocument } from "@/utils/docxExport";

interface MenuButtonProps {
  members: TeamMember[];
}

export function MenuButton({ members }: MenuButtonProps) {
  const handleWordExport = () => {
    exportWordDocument(members);
  };

  const handlePowerPointExport = () => {
    exportPowerPointDocument(members);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleWordExport}>
          <FileText className="mr-2 h-4 w-4" />
          Export Word
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePowerPointExport}>
          <Download className="mr-2 h-4 w-4" />
          Export PowerPoint
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
