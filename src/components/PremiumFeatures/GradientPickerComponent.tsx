
import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GRADIENT_ANGLES, RADIAL_POSITIONS } from './CardCustomizerPresets';

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
  const [radialPosition, setRadialPosition] = useState("center");
  const [showPicker, setShowPicker] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<"start" | "end" | null>(null);
  
  // Parse current gradient on component mount
  useEffect(() => {
    if (currentGradient) {
      try {
        // Check if it's a linear gradient
        if (currentGradient.includes('linear-gradient')) {
          setGradientType("linear");
          
          // Extract angle
          const angleMatch = currentGradient.match(/linear-gradient\((\d+)deg/);
          if (angleMatch && angleMatch[1]) {
            setAngle(angleMatch[1]);
          }
          
          // Extract colors
          const colorsMatch = currentGradient.match(/linear-gradient\(\d+deg,\s*([^,]+),\s*([^)]+)\)/);
          if (colorsMatch && colorsMatch[1] && colorsMatch[2]) {
            setStartColor(colorsMatch[1].trim());
            setEndColor(colorsMatch[2].trim());
          }
        } 
        // Check if it's a radial gradient
        else if (currentGradient.includes('radial-gradient')) {
          setGradientType("radial");
          
          // Extract position
          const positionMatch = currentGradient.match(/radial-gradient\(circle at ([^,]+)/);
          if (positionMatch && positionMatch[1]) {
            setRadialPosition(positionMatch[1].trim());
          }
          
          // Extract colors
          const colorsMatch = currentGradient.match(/radial-gradient\(circle(?:\s+at\s+[^,]+)?,\s*([^,]+),\s*([^)]+)\)/);
          if (colorsMatch && colorsMatch[1] && colorsMatch[2]) {
            setStartColor(colorsMatch[1].trim());
            setEndColor(colorsMatch[2].trim());
          }
        }
      } catch (error) {
        console.error("Error parsing gradient:", error);
      }
    }
  }, [currentGradient]);
  
  // Generate a preview gradient
  const getPreviewGradient = () => {
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
    } else {
      return `radial-gradient(circle at ${radialPosition}, ${startColor}, ${endColor})`;
    }
  };
  
  const handleApplyGradient = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const gradient = getPreviewGradient();
    onChange(gradient);
    setShowPicker(false);
  };

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(!showPicker);
  };

  // Stop event propagation for all gradient picker interactions
  const handlePickerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleColorPickerClick = (type: "start" | "end", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveColorPicker(activeColorPicker === type ? null : type);
  };
  
  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <Button 
          variant="outline" 
          size="sm" 
          type="button"
          onClick={togglePicker}
        >
          Create Gradient
        </Button>
      </div>
      
      <div 
        className="h-8 w-full rounded-md shadow-inner border cursor-pointer"
        style={{ background: currentGradient || getPreviewGradient() }}
        onClick={togglePicker}
      />

      {/* Gradient picker */}
      {showPicker && (
        <div 
          className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border rounded-md shadow-md p-4 z-[100] color-picker-container"
          onClick={handlePickerClick}
          style={{ minWidth: '320px' }}
        >
          <div className="space-y-4">
            <div 
              className="w-full h-20 rounded-md shadow-inner border" 
              style={{ background: getPreviewGradient() }}
            />
            
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="colors" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Start Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-md border cursor-pointer"
                      style={{ backgroundColor: startColor }}
                      onClick={(e) => handleColorPickerClick("start", e)}
                    />
                    <Input 
                      value={startColor} 
                      onChange={(e) => setStartColor(e.target.value)}
                      className="w-24" 
                    />
                  </div>

                  {activeColorPicker === "start" && (
                    <div className="mt-2 p-2 border rounded-md bg-white dark:bg-gray-700 shadow-md">
                      <HexColorPicker 
                        color={startColor} 
                        onChange={setStartColor} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>End Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-md border cursor-pointer"
                      style={{ backgroundColor: endColor }}
                      onClick={(e) => handleColorPickerClick("end", e)}
                    />
                    <Input 
                      value={endColor} 
                      onChange={(e) => setEndColor(e.target.value)}
                      className="w-24" 
                    />
                  </div>

                  {activeColorPicker === "end" && (
                    <div className="mt-2 p-2 border rounded-md bg-white dark:bg-gray-700 shadow-md">
                      <HexColorPicker 
                        color={endColor} 
                        onChange={setEndColor} 
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Gradient Type</Label>
                  <RadioGroup 
                    value={gradientType} 
                    onValueChange={setGradientType}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="linear" id="linear" />
                      <Label htmlFor="linear">Linear</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radial" id="radial" />
                      <Label htmlFor="radial">Radial</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {gradientType === "linear" && (
                  <div className="space-y-2">
                    <Label>Angle ({angle}°)</Label>
                    <div className="space-y-2">
                      <Input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={angle} 
                        onChange={(e) => setAngle(e.target.value)}
                      />
                      <Select value={angle} onValueChange={setAngle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select angle" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADIENT_ANGLES.map((angleOption) => (
                            <SelectItem key={angleOption.value} value={angleOption.value}>
                              {angleOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {gradientType === "radial" && (
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={radialPosition} onValueChange={setRadialPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {RADIAL_POSITIONS.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            
            <Button 
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker(false);
              }}
              className="w-full"
              type="button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
