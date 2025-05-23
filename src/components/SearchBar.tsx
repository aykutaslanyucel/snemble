
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSortChange?: (value: string) => void;
  sortValue?: string;
  onExportPowerPoint?: () => void;
  onExportWord?: () => void;
  showExportActions?: boolean;
}

export function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  onSortChange, 
  sortValue = "lastUpdated",
  onExportPowerPoint,
  onExportWord,
  showExportActions = false
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {onSortChange && (
        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastUpdated">Last Updated</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
            <SelectItem value="availability">Most Available</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {showExportActions && onExportPowerPoint && onExportWord && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportPowerPoint}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> PowerPoint
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportWord}>
              <FileText className="h-4 w-4 mr-2" /> Word Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
