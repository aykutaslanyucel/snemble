
import React, { useState, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  
  // Update local state when prop changes
  useEffect(() => {
    if (currentColor) {
      setColor(currentColor);
    }
  }, [currentColor]);
  
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };
  
  const handleApplyColor = () => {
    onChange(color);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
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
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Pick Color
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-4" 
              side="right"
              onPointerDownOutside={(e) => {
                // Prevent closing when clicking inside the color picker
                if (e.target instanceof Element) {
                  const target = e.target as Element;
                  if (target.closest('.react-colorful')) {
                    e.preventDefault();
                  }
                }
              }}
              onFocusOutside={(e) => {
                // Prevent focus events from closing if in color picker
                if (e.target instanceof Element) {
                  const target = e.target as Element;
                  if (target.closest('.react-colorful')) {
                    e.preventDefault();
                  }
                }
              }}
              onEscapeKeyDown={() => setIsOpen(false)}
            >
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                {/* Color picker */}
                <div className="react-colorful-wrapper" onClick={(e) => e.stopPropagation()}>
                  <HexColorPicker 
                    color={color} 
                    onChange={handleColorChange}
                  />
                </div>
                
                {/* Color input and apply button */}
                <div className="flex justify-between gap-2">
                  <input
                    type="text"
                    value={color}
                    onChange={handleInputChange}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-1 border rounded-md text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleApplyColor();
                    }}
                  >
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
