
import { Check } from "lucide-react";
import { COLORS } from "./CardCustomizerPresets";
import { TeamMemberCustomization } from "@/types/TeamMemberTypes";

interface ColorSelectorProps {
  customization: TeamMemberCustomization;
  onSelectColor: (color: string) => void;
}

export function ColorSelector({ customization, onSelectColor }: ColorSelectorProps) {
  // Group colors into categories for better organization
  const colorCategories = {
    status: COLORS.slice(0, 6),
    pastel: COLORS.slice(6, 11),
    professional: COLORS.slice(11, 15),
    vibrant: COLORS.slice(15, 20),
    neutral: COLORS.slice(20),
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Solid Colors</h3>
      
      {/* Status Colors */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Status</h4>
        <div className="flex flex-wrap gap-2">
          {colorCategories.status.map(color => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            >
              {customization.color === color && !customization.gradient && (
                <Check className="h-4 w-4 text-gray-700" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Pastel Colors */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Pastel</h4>
        <div className="flex flex-wrap gap-2">
          {colorCategories.pastel.map(color => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            >
              {customization.color === color && !customization.gradient && (
                <Check className="h-4 w-4 text-gray-700" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Professional Colors */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Professional</h4>
        <div className="flex flex-wrap gap-2">
          {colorCategories.professional.map(color => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            >
              {customization.color === color && !customization.gradient && (
                <Check className="h-4 w-4 text-gray-700" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Vibrant Colors */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Vibrant</h4>
        <div className="flex flex-wrap gap-2">
          {colorCategories.vibrant.map(color => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            >
              {customization.color === color && !customization.gradient && (
                <Check className="h-4 w-4 text-gray-700" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
