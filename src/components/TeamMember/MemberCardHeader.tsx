
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Edit, Trash2, Briefcase, Palette } from "lucide-react";

interface MemberCardHeaderProps {
  name: string;
  isEditingName: boolean;
  setIsEditingName: (isEditing: boolean) => void;
  nameValue: string;
  setNameValue: (name: string) => void;
  handleNameChange: () => void;
  canEdit: boolean;
  isPremium: boolean;
  onEditProjects: () => void;
  onCustomize: () => void;
  onDelete: () => void;
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
  onEditProjects,
  onCustomize,
  onDelete
}: MemberCardHeaderProps) {
  return (
    <CardHeader className="p-4 flex-row items-start justify-between space-y-0">
      <div className="mr-2">
        <CardTitle className="text-gray-800 dark:text-gray-200 text-base font-semibold mb-0.5">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <Input
                className="border-gray-300 bg-white/80 text-gray-800 text-sm p-1 h-8 rounded-md"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
                autoFocus
              />
            </div>
          ) : (
            <span 
              onClick={() => canEdit && setIsEditingName(true)} 
              className={`${canEdit ? 'cursor-pointer hover:underline' : ''}`}
            >
              {name}
            </span>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-300 font-normal">
          {/* Position will be added in MemberCardContent */}
        </div>
      </div>
      
      {canEdit && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white/70 hover:bg-white/90 shadow-sm">
              <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="grid gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setIsEditingName(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Name
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onEditProjects}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Edit Projects
              </Button>
              {isPremium && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={onCustomize}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Customize Card
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </CardHeader>
  );
}
