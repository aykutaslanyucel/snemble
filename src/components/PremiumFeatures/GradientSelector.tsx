
import { Check } from "lucide-react";
import { GRADIENTS } from "./CardCustomizerPresets";
import { TeamMemberCustomization } from "@/types/TeamMemberTypes";

interface GradientSelectorProps {
  customization: TeamMemberCustomization;
  onSelectGradient: (gradient: string) => void;
}

export function GradientSelector({ customization, onSelectGradient }: GradientSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Gradient Presets</h3>
      <div className="flex flex-wrap gap-2">
        {GRADIENTS.map(gradient => (
          <button
            key={gradient}
            onClick={() => onSelectGradient(gradient)}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110"
            style={{ background: gradient }}
          >
            {customization.gradient === gradient && (
              <Check className="h-4 w-4 text-gray-700" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
