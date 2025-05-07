
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GradientPickerComponentProps {
  currentGradient: string;
  onChange: (gradient: string) => void;
  label?: string;
}

export function GradientPickerComponent({ 
  currentGradient, 
  onChange, 
  label = "Gradient" 
}: GradientPickerComponentProps) {
  const [startColor, setStartColor] = useState("#ffffff");
  const [endColor, setEndColor] = useState("#000000");
  const [angle, setAngle] = useState("90");
  const [gradientType, setGradientType] = useState("linear");
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate a preview gradient
  const getPreviewGradient = () => {
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
    } else {
      return `radial-gradient(circle, ${startColor}, ${endColor})`;
    }
  };
  
  const handleApplyGradient = () => {
    const gradient = getPreviewGradient();
    onChange(gradient);
    setIsOpen(false);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" type="button">
              Create Gradient
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-4"
            side="right"
            align="start"
            sideOffset={5}
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <div className="space-y-4">
              <div 
                className="w-full h-20 rounded-md shadow-inner border" 
                style={{ background: getPreviewGradient() }}
              />
              
              <Tabs defaultValue="colors">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="colors" className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Start Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: startColor }}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">Change</Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-3" 
                          onInteractOutside={(e) => e.preventDefault()}
                        >
                          <HexColorPicker 
                            color={startColor} 
                            onChange={setStartColor} 
                          />
                        </PopoverContent>
                      </Popover>
                      <Input 
                        value={startColor} 
                        onChange={(e) => setStartColor(e.target.value)}
                        className="w-24" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: endColor }}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">Change</Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-3" 
                          onInteractOutside={(e) => e.preventDefault()}
                        >
                          <HexColorPicker 
                            color={endColor} 
                            onChange={setEndColor} 
                          />
                        </PopoverContent>
                      </Popover>
                      <Input 
                        value={endColor} 
                        onChange={(e) => setEndColor(e.target.value)}
                        className="w-24" 
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Gradient Type</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant={gradientType === "linear" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGradientType("linear")}
                        type="button"
                      >
                        Linear
                      </Button>
                      <Button 
                        variant={gradientType === "radial" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGradientType("radial")}
                        type="button"
                      >
                        Radial
                      </Button>
                    </div>
                  </div>
                  
                  {gradientType === "linear" && (
                    <div className="space-y-2">
                      <Label>Angle ({angle}°)</Label>
                      <Input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={angle} 
                        onChange={(e) => setAngle(e.target.value)}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={handleApplyGradient} 
                className="w-full"
                type="button"
              >
                Apply Gradient
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div 
        className="h-8 w-full rounded-md shadow-inner border"
        style={{ background: currentGradient || getPreviewGradient() }}
      />
    </div>
  );
}
