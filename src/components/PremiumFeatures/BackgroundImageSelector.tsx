
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DragDropImage } from '@/components/ui/drag-drop-image';
import { useToast } from "@/hooks/use-toast";

interface BackgroundImageSelectorProps {
  initialImage?: string;
  onSelect: (imageUrl: string) => void;
  onRemove: () => void;
}

export function BackgroundImageSelector({ 
  initialImage, 
  onSelect, 
  onRemove 
}: BackgroundImageSelectorProps) {
  const { toast } = useToast();

  const handleImageSelect = (fileOrUrl: File | string) => {
    try {
      if (typeof fileOrUrl === 'string') {
        onSelect(fileOrUrl);
      } else {
        // Convert file to base64 for immediate preview
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          onSelect(base64String);
        };
        reader.readAsDataURL(fileOrUrl);
      }
      
      toast({
        title: "Background set",
        description: "The background image has been applied",
      });
    } catch (error) {
      console.error('Error handling image:', error);
      toast({
        title: "Error",
        description: "Failed to set background image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <DragDropImage
        initialUrl={initialImage}
        onImageSelect={handleImageSelect}
      />
      
      {initialImage && (
        <div className="pt-2 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRemove}
          >
            Remove Image
          </Button>
        </div>
      )}
    </div>
  );
}
