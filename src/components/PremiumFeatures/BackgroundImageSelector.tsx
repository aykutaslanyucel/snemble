
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface BackgroundImageSelectorProps {
  currentImage?: string;
  onSelectImage: (imageUrl: string | null) => void;
}

export function BackgroundImageSelector({ 
  currentImage,
  onSelectImage
}: BackgroundImageSelectorProps) {
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const { isPremium } = useAuth();
  
  if (!isPremium) {
    return (
      <div className="border rounded-lg p-4 text-center">
        <h3 className="font-medium mb-2">Premium Feature</h3>
        <p className="text-sm text-muted-foreground">
          Background images are available for premium users only
        </p>
        <Button className="mt-4" variant="outline" size="sm" disabled>
          Upgrade to Premium
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-url" className="text-sm font-medium">
          Image URL
        </Label>
        <div className="flex gap-2 mt-1.5">
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button 
            onClick={() => onSelectImage(imageUrl)} 
            disabled={!imageUrl}
          >
            Apply
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Enter the URL of the image you want to use as your card background
        </p>
      </div>
      
      {currentImage && (
        <div className="p-2 border rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm truncate" style={{ maxWidth: "200px" }}>
              {currentImage}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                onSelectImage(null);
                setImageUrl('');
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
