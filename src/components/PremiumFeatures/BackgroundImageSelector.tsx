
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackgroundImageSelectorProps {
  currentImage?: string;
  onSelectImage: (url: string | null) => void;
}

export function BackgroundImageSelector({ 
  currentImage, 
  onSelectImage 
}: BackgroundImageSelectorProps) {
  const [imageUrlInput, setImageUrlInput] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.match('image.*')) {
        toast({
          title: "Error",
          description: "Please drop an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Create URL from file
      const url = URL.createObjectURL(file);
      onSelectImage(url);
      setImageUrlInput(url);
      toast({
        title: "Image Set",
        description: "Your background image has been set",
      });
    }
  };
  
  const handleSetImage = () => {
    if (!imageUrlInput) {
      onSelectImage(null);
      toast({
        title: "Image Removed",
        description: "Your background image has been removed",
      });
      return;
    }
    
    try {
      new URL(imageUrlInput);
      onSelectImage(imageUrlInput);
      toast({
        title: "Image Set",
        description: "Your background image has been set",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveImage = () => {
    onSelectImage(null);
    setImageUrlInput('');
    toast({
      title: "Image Removed",
      description: "Your background image has been removed",
    });
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`
          border-2 border-dashed rounded-md p-8 text-center
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Drag and drop your image here
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="background-url">Or enter an image URL</Label>
        <div className="flex gap-2">
          <Input 
            id="background-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSetImage} type="button">
            Set
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the URL of the image you want to use as background
        </p>
      </div>
      
      {currentImage && (
        <div className="pt-2 flex justify-between items-center">
          <Label>Current background image:</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRemoveImage}
          >
            Remove Image
          </Button>
        </div>
      )}
    </div>
  );
}
