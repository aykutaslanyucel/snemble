
import { CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MoreVertical, Edit, Trash2, Briefcase, Palette, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MemberCardHeaderProps {
  name: string;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  nameValue: string;
  setNameValue: (name: string) => void;
  handleNameChange: () => void;
  canEdit: boolean;
  isPremium: boolean;
  onCustomize: () => void;
  onEditProjects: () => void;
  onDelete: () => void;
  onVacation: () => void;
  isOnVacation?: boolean;
}

export function MemberCardHeader({
  name,
  isEditingName,
  setIsEditingName,
  nameValue,
  setNameValue,
  handleNameChange,
  canEdit,
  isPremium,
  onCustomize,
  onEditProjects,
  onDelete,
  onVacation,
  isOnVacation = false,
}: MemberCardHeaderProps) {
  return (
    <CardHeader className="p-6 pb-2">
      <div className="flex items-start justify-between">
        <div>
          {isEditingName ? (
            <div className="flex items-center">
              <input
                type="text"
                className="bg-white/90 rounded-xl border border-gray-100 px-3 py-2 text-lg font-medium"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
                autoFocus
              />
            </div>
          ) : (
            <CardTitle
              onClick={() => canEdit && setIsEditingName(true)}
              className={`${canEdit ? "cursor-pointer hover:text-primary" : ""} dark:text-gray-100`}
            >
              {name}
            </CardTitle>
          )}
        </div>

        <div className="flex gap-2">
          {isOnVacation && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800/50">
              On Vacation
            </Badge>
          )}
          
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Name</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEditProjects}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Edit Projects</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onVacation}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Set Vacation</span>
                </DropdownMenuItem>
                {isPremium && (
                  <DropdownMenuItem onClick={onCustomize}>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Customize Card</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
