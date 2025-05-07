
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { updateTeamMember } from "@/lib/teamMemberUtils";
import { TeamMember } from "@/types/TeamMemberTypes";
import { Sparkles, Palette, Paintbrush, CheckCircle, RefreshCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const COLOR_PRESETS = {
  blue: { color: "#D3E4FD", gradient: "#B3D4FF" },
  green: { color: "#F2FCE2", gradient: "#D2ECB2" },
  yellow: { color: "#FEF7CD", gradient: "#FEE69D" },
  red: { color: "#FFDEE2", gradient: "#FFBEC2" },
  purple: { color: "#E5DEFF", gradient: "#D6BCFA" }
};

const GRADIENT_PRESETS = [
  "linear-gradient(90deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)",
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(90deg, hsla(29, 92%, 70%, 1) 0%, hsla(0, 87%, 73%, 1) 100%)",
  "linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)",
  "linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)",
  "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)"
];

interface CardCustomizerProps {
  teamMember: TeamMember;
  onUpdate: () => void;
}

export function CardCustomizer({ teamMember, onUpdate }: CardCustomizerProps) {
  const [mode, setMode] = useState<'solid' | 'gradient'>('solid');
  const [animate, setAnimate] = useState(false);
  const [selectedColor, setSelectedColor] = useState(teamMember.customization?.color || COLOR_PRESETS.blue.color);
  const [selectedGradient, setSelectedGradient] = useState(teamMember.customization?.gradient || GRADIENT_PRESETS[0]);
  const [customColor, setCustomColor] = useState(teamMember.customization?.color || '#D3E4FD');
  const [customGradient, setCustomGradient] = useState(teamMember.customization?.gradient || GRADIENT_PRESETS[0]);
  const [saving, setSaving] = useState(false);
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize from team member customization if available
    if (teamMember.customization) {
      setMode(teamMember.customization.gradient ? 'gradient' : 'solid');
      setAnimate(!!teamMember.customization.animate);
      if (teamMember.customization.color) {
        setSelectedColor(teamMember.customization.color);
        setCustomColor(teamMember.customization.color);
      }
      if (teamMember.customization.gradient) {
        setSelectedGradient(teamMember.customization.gradient);
        setCustomGradient(teamMember.customization.gradient);
      }
    }
  }, [teamMember]);

  if (!isPremium) {
    return (
      <Card className="border-dashed border-2 border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Premium Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Upgrade to premium to customize your capacity card with custom colors and animations.
          </p>
          <Button variant="premium" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    if (!teamMember.id) return;
    
    setSaving(true);
    try {
      const customization = {
        ...teamMember.customization,
        color: mode === 'solid' ? selectedColor : null,
        gradient: mode === 'gradient' ? selectedGradient : null,
        animate: mode === 'gradient' ? animate : false
      };
      
      await updateTeamMember(teamMember.id, { customization });
      toast({
        title: "Customization saved",
        description: "Your card styling has been updated.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving customization:", error);
      toast({
        title: "Error saving customization",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetCustomization = async () => {
    if (!teamMember.id) return;
    
    setSaving(true);
    try {
      await updateTeamMember(teamMember.id, { 
        customization: null 
      });
      
      // Reset local state
      setMode('solid');
      setAnimate(false);
      setSelectedColor(COLOR_PRESETS.blue.color);
      setSelectedGradient(GRADIENT_PRESETS[0]);
      setCustomColor('#D3E4FD');
      setCustomGradient(GRADIENT_PRESETS[0]);
      
      toast({
        title: "Customization reset",
        description: "Your card styling has been reset to default.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error resetting customization:", error);
      toast({
        title: "Error resetting customization",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Customize Capacity Card
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'solid' | 'gradient')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="solid">Solid Color</TabsTrigger>
            <TabsTrigger value="gradient">Gradient</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solid">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Object.entries(COLOR_PRESETS).map(([name, { color }]) => (
                <button
                  key={name}
                  className={`h-10 rounded-md transition-all ${
                    selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Label htmlFor="custom-color">Custom:</Label>
              <Input 
                id="custom-color" 
                type="color" 
                value={customColor} 
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedColor(e.target.value);
                }}
                className="w-16 h-8 p-1"
              />
              <span className="text-sm text-muted-foreground">{customColor}</span>
            </div>
          </TabsContent>
          
          <TabsContent value="gradient">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {GRADIENT_PRESETS.map((gradient, index) => (
                <button
                  key={index}
                  className={`h-12 rounded-md transition-all ${
                    selectedGradient === gradient ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ background: gradient }}
                  onClick={() => setSelectedGradient(gradient)}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="animate"
                checked={animate}
                onCheckedChange={setAnimate}
              />
              <Label htmlFor="animate">Animate gradient</Label>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium">Live Preview:</h3>
          <div
            className={`w-full h-24 rounded-xl border shadow-inner bg-cover ${
              mode === 'gradient' && animate ? 'animate-gradient' : ''
            }`}
            style={{
              background: mode === 'solid' ? selectedColor : selectedGradient,
              backgroundSize: mode === 'gradient' ? '400% 400%' : undefined,
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetCustomization}
          disabled={saving}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Customization'}
        </Button>
      </CardFooter>
    </Card>
  );
}
