
import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";

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
  const [showPicker, setShowPicker] = useState(false);
  
  // Update local state when prop changes
  useEffect(() => {
    if (currentColor) {
      setColor(currentColor);
    }
  }, [currentColor]);
  
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    // Apply color changes immediately for better visual feedback
    onChange(newColor);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };
  
  // Handle input blur to apply color when user finishes typing
  const handleInputBlur = () => {
    onChange(color);
  };

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(!showPicker);
  };

  // Stop event propagation for all color picker interactions
  const handlePickerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full border shadow-sm cursor-pointer" 
            style={{ backgroundColor: color }}
            onClick={togglePicker}
          />
          <Button 
            variant="outline" 
            size="sm"
            type="button"
            onClick={togglePicker}
          >
            Pick Color
          </Button>
        </div>
      </div>
      
      {/* Simplified color picker without nesting Radix UI components */}
      {showPicker && (
        <div 
          className="absolute right-0 mt-2 bg-white border rounded-md shadow-md p-4 z-[100] color-picker-container"
          onClick={handlePickerClick}
          style={{ minWidth: '220px' }}
        >
          <div className="space-y-4">
            {/* Color picker */}
            <div onClick={handlePickerClick}>
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
                onBlur={handleInputBlur}
                onClick={handlePickerClick}
                className="flex-1 px-2 py-1 border rounded-md text-sm"
              />
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(color);
                  setShowPicker(false);
                }}
                type="button"
              >
                Apply
              </Button>
            </div>
            
            {/* Close button */}
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
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
