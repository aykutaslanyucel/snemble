import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { TeamMember, TeamMemberCustomization } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";

interface CardCustomizerProps {
  teamMember: TeamMember;
  onUpdate: (customization: TeamMemberCustomization) => void;
}

// Predefined gradients
const GRADIENTS = [
  "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
  "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)",
  "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
  "linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)",
  "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)",
];

// Predefined solid colors
const COLORS = [
  "#D3E4FD", // Blue - Available
  "#F2FCE2", // Green - Some Availability
  "#FEF7CD", // Yellow - Busy
  "#FFDEE2", // Red - Seriously Busy
  "#F1F0FB", // Purple - Away
  "#E5DEFF", // Lavender
];

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
      <Card 
        className={`border ${customization.animate ? "animate-gradient" : ""}`}
        style={previewStyle}
      >
        <CardHeader className="p-4">
          <CardTitle className="text-base">{teamMember.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm">Card preview</p>
        </CardContent>
      </Card>
      
      {/* Color Presets */}
      <div>
        <h3 className="text-sm font-medium mb-2">Solid Colors</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => handleSelectColor(color)}
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
      
      {/* Gradient Presets */}
      <div>
        <h3 className="text-sm font-medium mb-2">Gradient Presets</h3>
        <div className="flex flex-wrap gap-2">
          {GRADIENTS.map(gradient => (
            <button
              key={gradient}
              onClick={() => handleSelectGradient(gradient)}
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
      
      {/* Custom Color Input */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="custom-color">Custom Color (HEX)</Label>
          <Input 
            id="custom-color"
            value={customColor} 
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#RRGGBB"
          />
        </div>
        <Button onClick={handleApplyCustomColor} variant="outline" className="mb-px">
          Apply
        </Button>
      </div>
      
      {/* Custom Gradient Input */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="custom-gradient">Custom CSS Gradient</Label>
          <Input 
            id="custom-gradient"
            value={customGradient} 
            onChange={(e) => setCustomGradient(e.target.value)}
            placeholder="linear-gradient(...)"
          />
        </div>
        <Button onClick={handleApplyCustomGradient} variant="outline" className="mb-px">
          Apply
        </Button>
      </div>
      
      {/* Animation Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="animate-toggle" className="cursor-pointer">
          Animate gradient
        </Label>
        <Switch 
          id="animate-toggle"
          checked={!!customization.animate}
          onCheckedChange={handleToggleAnimate}
          disabled={!customization.gradient}
        />
      </div>
      
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
