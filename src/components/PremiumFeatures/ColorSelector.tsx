
import { Check } from "lucide-react";
import { COLORS } from "./CardCustomizerPresets";
import { TeamMemberCustomization } from "@/types/TeamMemberTypes";

interface ColorSelectorProps {
  customization: TeamMemberCustomization;
  onSelectColor: (color: string) => void;
}

export function ColorSelector({ customization, onSelectColor }: ColorSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Solid Colors</h3>
      <div className="flex flex-wrap gap-2">
        {COLORS.map(color => (
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
  );
}
