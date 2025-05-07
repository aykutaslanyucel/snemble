
import { Check } from "lucide-react";
import { GRADIENTS } from "./CardCustomizerPresets";
import { TeamMemberCustomization } from "@/types/TeamMemberTypes";

interface GradientSelectorProps {
  customization: TeamMemberCustomization;
  onSelectGradient: (gradient: string) => void;
}

export function GradientSelector({ customization, onSelectGradient }: GradientSelectorProps) {
  // Group gradients into categories for better organization
  const gradientCategories = {
    professional: GRADIENTS.slice(0, 4),
    pastel: GRADIENTS.slice(4, 8),
    vibrant: GRADIENTS.slice(8, 10),
    subtle: GRADIENTS.slice(10, 12),
    deep: GRADIENTS.slice(12, 14),
    warm: GRADIENTS.slice(14, 16),
    earth: GRADIENTS.slice(16, 18),
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Gradient Presets</h3>
      
      {/* Professional Gradients */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Professional</h4>
        <div className="flex flex-wrap gap-2">
          {gradientCategories.professional.map(gradient => (
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
      
      {/* Pastel Gradients */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Pastel</h4>
        <div className="flex flex-wrap gap-2">
          {gradientCategories.pastel.map(gradient => (
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
      
      {/* Vibrant Gradients */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Vibrant</h4>
        <div className="flex flex-wrap gap-2">
          {gradientCategories.vibrant.map(gradient => (
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
      
      {/* Subtle Gradients */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Subtle</h4>
        <div className="flex flex-wrap gap-2">
          {gradientCategories.subtle.map(gradient => (
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
      
      {/* Deep Gradients */}
      <div>
        <h4 className="text-xs text-gray-500 mb-1.5">Deep</h4>
        <div className="flex flex-wrap gap-2">
          {gradientCategories.deep.map(gradient => (
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
    </div>
  );
}
