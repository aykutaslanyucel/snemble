
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TeamMember, TeamMemberCustomization } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { CardPreview } from './CardPreview';
import { ColorSelector } from './ColorSelector';
import { GradientSelector } from './GradientSelector';
import { AnimationToggle } from './AnimationToggle';
import { ColorPickerComponent } from './ColorPickerComponent';
import { GradientPickerComponent } from './GradientPickerComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CardCustomizerProps {
  teamMember: TeamMember;
  onUpdate: (customization: TeamMemberCustomization) => void;
}

export function CardCustomizer({ teamMember, onUpdate }: CardCustomizerProps) {
  // Initialize with current customization or empty object with correct type
  const [customization, setCustomization] = useState<TeamMemberCustomization>(
    teamMember.customization || {}
  );
  
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
      console.log("Updating preview with background:", background);
      setPreviewStyle({ background });
    }
  }, [customization]);

  const handleSelectColor = (color: string) => {
    console.log("Selected color:", color);
    const newCustomization = {
      ...customization,
      color,
      gradient: undefined // Remove gradient if color is selected
    };
    
    setCustomization(newCustomization);
  };

  const handleSelectGradient = (gradient: string) => {
    console.log("Selected gradient:", gradient);
    const newCustomization = {
      ...customization,
      gradient,
      color: undefined // Remove color if gradient is selected
    };
    
    setCustomization(newCustomization);
  };

  const handleColorPickerChange = (color: string) => {
    console.log("Color picker change:", color);
    handleSelectColor(color);
  };

  const handleGradientPickerChange = (gradient: string) => {
    console.log("Gradient picker change:", gradient);
    handleSelectGradient(gradient);
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
      
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="space-y-6 py-4">
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
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 py-4">
          {/* Color Picker */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Custom Color</h3>
            <ColorPickerComponent
              currentColor={customization.color || "#ffffff"}
              onChange={handleColorPickerChange}
              label="Pick a Color"
            />
          </div>
          
          {/* Gradient Picker */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Custom Gradient</h3>
            <GradientPickerComponent 
              currentGradient={customization.gradient || ""}
              onChange={handleGradientPickerChange}
              label="Create Gradient"
            />
          </div>
        </TabsContent>
      </Tabs>
      
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
