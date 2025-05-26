
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TeamMember, TeamMemberCustomization, GradientAnimationType } from "@/types/TeamMemberTypes";
import { useToast } from "@/hooks/use-toast";
import { CardPreview } from './CardPreview';
import { ColorSelector } from './ColorSelector';
import { GradientSelector } from './GradientSelector';
import { AnimationToggle } from './AnimationToggle';
import { ColorPickerComponent } from './ColorPickerComponent';
import { GradientPickerComponent } from './GradientPickerComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeSelector } from './BadgeSelector';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/types/TeamMemberTypes";
import "@/styles/animations.css";
import { BackgroundImageSelector } from './BackgroundImageSelector';
import { Label } from "@/components/ui/label";
import { DragDropImage } from '@/components/ui/drag-drop-image';
import { useAdminSettings } from "@/hooks/useAdminSettings";

interface CardCustomizerProps {
  teamMember: TeamMember;
  onUpdate: (customization: TeamMemberCustomization) => void;
}

export function CardCustomizer({ teamMember, onUpdate }: CardCustomizerProps) {
  // Initialize with current customization or empty object with correct type
  const [customization, setCustomization] = useState<TeamMemberCustomization>(
    teamMember.customization || {}
  );
  
  // State for badges
  const [badges, setBadges] = useState<{ id: string; name: string; imageUrl: string }[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  
  const { toast } = useToast();
  const { settings } = useAdminSettings();

  // Used for preview
  const [previewStyle, setPreviewStyle] = useState({
    background: teamMember.customization?.gradient || teamMember.customization?.color || "#F1F0FB" 
  });

  // Load available badges on component mount
  useEffect(() => {
    const fetchBadges = async () => {
      setLoadingBadges(true);
      try {
        // Check if badges table exists
        const { data, error } = await supabase
          .from('badges')
          .select('id, name, image_url, is_active')
          .eq('is_active', true)
          .order('name');
          
        if (!error && data) {
          setBadges(data.map(badge => ({
            id: badge.id,
            name: badge.name,
            imageUrl: badge.image_url
          })));
        } else {
          console.log("No badges found or table doesn't exist");
          setBadges([]);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoadingBadges(false);
      }
    };
    
    // Check admin settings if badges are enabled
    const badgesEnabled = settings?.badges_enabled === undefined ? true : settings?.badges_enabled === true;
    
    if (badgesEnabled) {
      fetchBadges();
    } else {
      setBadges([]);
    }
  }, [settings]);

  // Update preview when customization changes
  useEffect(() => {
    let background = "";
    
    if (customization.backgroundImage) {
      background = `url(${customization.backgroundImage})`;
    } else if (customization.gradient) {
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
      gradient: undefined,
      backgroundImage: undefined // Remove background image if color is selected
    };
    
    setCustomization(newCustomization);
  };

  const handleSelectGradient = (gradient: string) => {
    console.log("Selected gradient:", gradient);
    const newCustomization = {
      ...customization,
      gradient,
      color: undefined,
      backgroundImage: undefined // Remove background image if gradient is selected
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
  
  const handleAnimationTypeChange = (type: GradientAnimationType) => {
    setCustomization({ ...customization, animationType: type });
  };
  
  const handleSelectBadge = (badgeUrl: string | null) => {
    if (badgeUrl) {
      setCustomization({ 
        ...customization, 
        badge: badgeUrl,
        badgePosition: customization.badgePosition || 'top-right',
        badgeSize: customization.badgeSize || 'medium'
      });
    } else {
      // Remove badge if null is selected
      const { badge, badgePosition, badgeSize, ...restCustomization } = customization;
      setCustomization(restCustomization);
    }
  };
  
  const handleBadgePositionChange = (position: 'top-right' | 'bottom-right') => {
    setCustomization({ ...customization, badgePosition: position });
  };
  
  const handleBadgeSizeChange = (size: 'small' | 'medium' | 'large') => {
    setCustomization({ ...customization, badgeSize: size });
  };

  const handleSetBackgroundImage = (imageSource: string | File) => {
    let imageUrl: string;
    
    if (typeof imageSource === 'string') {
      imageUrl = imageSource;
    } else {
      // For File objects, create a temporary URL
      imageUrl = URL.createObjectURL(imageSource);
    }
    
    setCustomization({ 
      ...customization, 
      backgroundImage: imageUrl,
      color: undefined,
      gradient: undefined 
    });
    
    toast({
      title: "Background image set",
      description: "Your card background has been updated",
    });
  };

  const handleRemoveBackgroundImage = () => {
    const { backgroundImage, ...restCustomization } = customization;
    setCustomization(restCustomization);
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
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Preview */}
      <div className="pb-2 border-b mb-4">
        <CardPreview 
          teamMember={teamMember} 
          previewStyle={previewStyle} 
          animate={!!customization.animate}
          animationType={customization.animationType}
          badge={customization.badge}
          badgePosition={customization.badgePosition}
          badgeSize={customization.badgeSize}
          backgroundImage={customization.backgroundImage}
        />
      </div>
      
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-2">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="space-y-4">
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
          
          {/* Animation Toggle (in presets for easy access) */}
          <AnimationToggle 
            animate={!!customization.animate}
            animationType={customization.animationType || "gentle"}
            onToggle={handleToggleAnimate}
            onAnimationTypeChange={handleAnimationTypeChange}
            disabled={!customization.gradient}
          />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          {/* Color Picker */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Custom Color</h3>
            <ColorPickerComponent
              currentColor={customization.color || "#ffffff"}
              onChange={handleColorPickerChange}
              label="Pick a Color"
            />
          </div>
          
          {/* Gradient Picker */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Custom Gradient</h3>
            <GradientPickerComponent 
              currentGradient={customization.gradient || ""}
              onChange={handleGradientPickerChange}
              label="Create Gradient"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-4">
          {/* Badge Selector */}
          <BadgeSelector
            badges={badges}
            selectedBadge={customization.badge}
            onSelectBadge={handleSelectBadge}
            onPositionChange={handleBadgePositionChange}
            onSizeChange={handleBadgeSizeChange}
            selectedPosition={customization.badgePosition}
            selectedSize={customization.badgeSize}
            isLoading={loadingBadges}
          />
        </TabsContent>
        
        <TabsContent value="background" className="space-y-4">
          {/* Background Image Selector with drag and drop */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Background Image</h3>
            <DragDropImage 
              initialUrl={customization.backgroundImage} 
              onImageSelect={handleSetBackgroundImage}
            />
          </div>
          
          {customization.backgroundImage && (
            <div className="pt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemoveBackgroundImage}
              >
                Remove Image
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
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
