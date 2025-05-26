
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ColorSelector } from "./ColorSelector";
import { GradientSelector } from "./GradientSelector";
import { AnimationToggle } from "./AnimationToggle";
import { BadgeSelector } from "./BadgeSelector";
import { BackgroundImageSelector } from "./BackgroundImageSelector";
import { CardPreview } from "./CardPreview";
import { TeamMemberCustomization, BadgePosition } from "@/types/TeamMemberTypes";

interface CardCustomizerProps {
  onClose: () => void;
  currentCustomization?: TeamMemberCustomization;
  onSave: (customization: TeamMemberCustomization) => void;
}

export function CardCustomizer({ onClose, currentCustomization, onSave }: CardCustomizerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("colors");
  const [customization, setCustomization] = useState<TeamMemberCustomization>(
    currentCustomization || {}
  );
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      setIsPremium(user.role === 'premium' || user.role === 'admin');
    }
  }, [user]);

  const handleColorChange = (color: string) => {
    setCustomization(prev => ({ ...prev, color, gradient: undefined }));
  };

  const handleGradientChange = (gradient: string) => {
    setCustomization(prev => ({ ...prev, gradient, color: undefined }));
  };

  const handleAnimationToggle = (animate: boolean) => {
    setCustomization(prev => ({ ...prev, animate }));
  };

  const handleAnimationTypeChange = (animationType: string) => {
    setCustomization(prev => ({ ...prev, animationType }));
  };

  const handleBadgeSelect = (badgeUrl: string) => {
    setCustomization(prev => ({ ...prev, badge: badgeUrl || undefined }));
  };

  const handleBadgePositionChange = (position: BadgePosition) => {
    setCustomization(prev => ({ ...prev, badgePosition: position }));
  };

  const handleBadgeSizeChange = (size: "small" | "medium" | "large") => {
    setCustomization(prev => ({ ...prev, badgeSize: size }));
  };

  const handleBackgroundImageChange = (imageUrl: string) => {
    setCustomization(prev => ({ ...prev, backgroundImage: imageUrl || undefined }));
  };

  const handleSave = async () => {
    try {
      await onSave(customization);
      toast({
        title: "Success",
        description: "Customization saved successfully!",
      });
      onClose();
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Error",
        description: "Failed to save customization. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setCustomization({});
    toast({
      title: "Reset",
      description: "Customization reset to default.",
    });
  };

  const premiumFeatures = ['gradients', 'animation', 'badges', 'backgrounds'];

  const FeatureWrapper = ({ children, feature, title }: { 
    children: React.ReactNode; 
    feature: string; 
    title: string; 
  }) => {
    const isFeaturePremium = premiumFeatures.includes(feature);
    
    if (isFeaturePremium && !isPremium) {
      return (
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="text-center p-4">
              <Badge variant="secondary" className="mb-2">Premium Feature</Badge>
              <p className="text-sm text-muted-foreground">
                Upgrade to access {title.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Controls */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Customize Card</h2>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="gradients">Gradients</TabsTrigger>
                <TabsTrigger value="animation">Animation</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Solid Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ColorSelector
                      selectedColor={customization.color || ""}
                      onColorChange={handleColorChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="gradients" className="space-y-4">
                <FeatureWrapper feature="gradients" title="Gradients">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gradient Backgrounds</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GradientSelector
                        selectedGradient={customization.gradient || ""}
                        onGradientChange={handleGradientChange}
                      />
                    </CardContent>
                  </Card>
                </FeatureWrapper>
              </TabsContent>
              
              <TabsContent value="animation" className="space-y-4">
                <FeatureWrapper feature="animation" title="Animations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Animation Effects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimationToggle
                        animate={customization.animate || false}
                        animationType={customization.animationType || "gentle"}
                        onAnimationToggle={handleAnimationToggle}
                        onAnimationTypeChange={handleAnimationTypeChange}
                      />
                    </CardContent>
                  </Card>
                </FeatureWrapper>
              </TabsContent>
              
              <TabsContent value="badges" className="space-y-4">
                <FeatureWrapper feature="badges" title="Badges">
                  <BadgeSelector
                    selectedBadge={customization.badge}
                    onSelectBadge={handleBadgeSelect}
                    onPositionChange={handleBadgePositionChange}
                    onSizeChange={handleBadgeSizeChange}
                    selectedPosition={customization.badgePosition || "top-right"}
                    selectedSize={customization.badgeSize || "medium"}
                  />
                </FeatureWrapper>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
          
          {/* Right Panel - Preview */}
          <div className="w-1/2 bg-muted/20 p-6 flex items-center justify-center">
            <CardPreview
              member={{
                id: "preview",
                name: "Preview User",
                position: "Sample Position",
                status: "available",
                projects: ["Sample Project"],
                lastUpdated: new Date(),
                user_id: "preview",
                customization: customization
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
