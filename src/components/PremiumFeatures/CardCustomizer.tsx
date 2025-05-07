
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TeamMember, TeamMemberCustomization } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { CardPreview } from './CardPreview';
import { ColorSelector } from './ColorSelector';
import { GradientSelector } from './GradientSelector';
import { CustomColorInput } from './CustomColorInput';
import { CustomGradientInput } from './CustomGradientInput';
import { AnimationToggle } from './AnimationToggle';

interface CardCustomizerProps {
  teamMember: TeamMember;
  onUpdate: (customization: TeamMemberCustomization) => void;
}

export function CardCustomizer({ teamMember, onUpdate }: CardCustomizerProps) {
  // Initialize with current customization or empty object with correct type
  const [customization, setCustomization] = useState<TeamMemberCustomization>(
    teamMember.customization || {}
  );
  const [customColor, setCustomColor] = useState(customization.color || "");
  const [customGradient, setCustomGradient] = useState(customization.gradient || "");
  const { toast } = useToast();

  // Used for preview
  const [previewStyle, setPreviewStyle] = useState({
    background: teamMember.customization?.gradient || teamMember.customization?.color || "#F1F0FB" 
  });

  // Update preview when customization changes
  useEffect(() => {
    let background = "";
    
    if (customization.gradient) {
      background = customization.gradient;
    } else if (customization.color) {
      background = customization.color;
    }
    
    if (background) {
      setPreviewStyle({ background });
    }
  }, [customization]);

  const handleSelectColor = (color: string) => {
    const newCustomization = {
      ...customization,
      color,
      gradient: undefined // Remove gradient if color is selected
    };
    
    setCustomization(newCustomization);
    setCustomColor(color);
    setCustomGradient("");
  };

  const handleSelectGradient = (gradient: string) => {
    const newCustomization = {
      ...customization,
      gradient,
      color: undefined // Remove color if gradient is selected
    };
    
    setCustomization(newCustomization);
    setCustomGradient(gradient);
    setCustomColor("");
  };

  const handleApplyCustomColor = () => {
    if (!customColor) return;
    
    try {
      // Very basic validation
      if (!/^#[0-9A-F]{6}$/i.test(customColor)) {
        toast({
          title: "Invalid color format",
          description: "Please use a valid hex color (e.g., #FF5500)",
          variant: "destructive"
        });
        return;
      }
      
      const newCustomization = {
        ...customization,
        color: customColor,
        gradient: undefined
      };
      
      setCustomization(newCustomization);
    } catch (error) {
      toast({
        title: "Invalid color",
        description: "Please use a valid hex color (e.g., #FF5500)",
        variant: "destructive"
      });
    }
  };

  const handleApplyCustomGradient = () => {
    if (!customGradient) return;
    
    try {
      // Basic check if it includes the word gradient
      if (!customGradient.includes("gradient")) {
        toast({
          title: "Invalid gradient format",
          description: "Please use a valid CSS gradient",
          variant: "destructive"
        });
        return;
      }
      
      const newCustomization = {
        ...customization, 
        gradient: customGradient,
        color: undefined
      };
      
      setCustomization(newCustomization);
    } catch (error) {
      toast({
        title: "Invalid gradient",
        description: "Please use a valid CSS gradient",
        variant: "destructive"
      });
    }
  };

  const handleToggleAnimate = (checked: boolean) => {
    setCustomization({ ...customization, animate: checked });
  };

  const handleSave = () => {
    // Add validation if needed
    onUpdate(customization);
    toast({
      title: "Card customized",
      description: "Your card style has been updated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <CardPreview 
        teamMember={teamMember} 
        previewStyle={previewStyle} 
        animate={!!customization.animate}
      />
      
      {/* Color Presets */}
      <ColorSelector 
        customization={customization} 
        onSelectColor={handleSelectColor} 
      />
      
      {/* Gradient Presets */}
      <GradientSelector 
        customization={customization} 
        onSelectGradient={handleSelectGradient} 
      />
      
      {/* Custom Color Input */}
      <CustomColorInput 
        customColor={customColor}
        setCustomColor={setCustomColor}
        handleApplyCustomColor={handleApplyCustomColor}
      />
      
      {/* Custom Gradient Input */}
      <CustomGradientInput 
        customGradient={customGradient}
        setCustomGradient={setCustomGradient}
        handleApplyCustomGradient={handleApplyCustomGradient}
      />
      
      {/* Animation Toggle */}
      <AnimationToggle 
        animate={!!customization.animate}
        onToggle={handleToggleAnimate}
        disabled={!customization.gradient}
      />
      
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onUpdate({})}>
          Reset
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

export default CardCustomizer;
