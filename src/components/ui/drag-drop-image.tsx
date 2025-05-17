
import React, { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload } from 'lucide-react';

interface DragDropImageProps {
  onImageSelect: (file: File | string) => void;
  initialUrl?: string;
  className?: string;
  allowUrl?: boolean;
}

export function DragDropImage({ 
  onImageSelect, 
  initialUrl = '', 
  className = '', 
  allowUrl = true 
}: DragDropImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(initialUrl);
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    // Check if the file is an image
    if (!file.type.match(/image.*/)) {
      alert('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
        onImageSelect(file);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  }, []);

  const handleUrlSubmit = useCallback(() => {
    if (imageUrl) {
      setPreview(imageUrl);
      onImageSelect(imageUrl);
    }
  }, [imageUrl, onImageSelect]);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 ${
          isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-dashed border-gray-300'
        } rounded-lg p-4 text-center cursor-pointer transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 mx-auto object-contain" 
              onError={() => setPreview('')}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Click or drop a new image to replace
            </p>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or click to select a file
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {allowUrl && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Or enter an image URL</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={handleUrlChange}
            />
            <Button type="button" onClick={handleUrlSubmit} className="flex-shrink-0">
              Use URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
