
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerComponentProps {
  currentColor: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPickerComponent({ 
  currentColor, 
  onChange, 
  label = "Color" 
}: ColorPickerComponentProps) {
  const [color, setColor] = useState(currentColor || "#ffffff");
  
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };
  
  const handleApplyColor = () => {
    onChange(color);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full border shadow-sm" 
            style={{ backgroundColor: color }}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Pick Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" side="right">
              <div className="space-y-4">
                <HexColorPicker 
                  color={color} 
                  onChange={handleColorChange} 
                />
                <div className="flex justify-between gap-2">
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded-md text-sm"
                  />
                  <Button size="sm" onClick={handleApplyColor}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
