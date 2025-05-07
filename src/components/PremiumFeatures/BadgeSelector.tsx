
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface BadgeSelectorProps {
  badges: Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;
  selectedBadge?: string;
  onSelectBadge: (badgeUrl: string | null) => void;
  onPositionChange: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  selectedPosition?: string;
  selectedSize?: string;
  isLoading?: boolean;
}

export function BadgeSelector({
  badges,
  selectedBadge,
  onSelectBadge,
  onPositionChange,
  onSizeChange,
  selectedPosition = 'top-right',
  selectedSize = 'medium',
  isLoading = false
}: BadgeSelectorProps) {
  const { isPremium } = useAuth();
  const [tab, setTab] = useState<string>("select");
  
  // When no badges are available or still loading
  const renderPlaceholder = () => {
    if (isLoading) {
      return (
        <div className="py-10 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading badges...</p>
        </div>
      );
    }
    
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No badges available</p>
        {isPremium && (
          <p className="text-xs mt-2">Contact an admin to add badges</p>
        )}
        {!isPremium && (
          <p className="text-xs mt-2">Upgrade to premium to use badges</p>
        )}
      </div>
    );
  };
  
  if (!isPremium) {
    return (
      <div className="border rounded-lg p-4 text-center">
        <h3 className="font-medium mb-2">Premium Feature</h3>
        <p className="text-sm text-muted-foreground">
          Badges are available for premium users only
        </p>
        <Button className="mt-4" variant="outline" size="sm" disabled>
          Upgrade to Premium
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="select">Select Badge</TabsTrigger>
          <TabsTrigger value="settings" disabled={!selectedBadge}>Position & Size</TabsTrigger>
        </TabsList>
        
        <TabsContent value="select">
          {badges.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`
                      border rounded-md p-2 cursor-pointer transition-all
                      hover:shadow-md aspect-square flex flex-col items-center justify-center
                      ${selectedBadge === badge.imageUrl ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => onSelectBadge(badge.imageUrl)}
                  >
                    <div className="h-16 w-16 mb-2 flex items-center justify-center">
                      <img 
                        src={badge.imageUrl} 
                        alt={badge.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-center text-gray-600 line-clamp-1">{badge.name}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onSelectBadge(null)}
              >
                Remove Badge
              </Button>
            </>
          ) : renderPlaceholder()}
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Position</h3>
              <RadioGroup 
                value={selectedPosition} 
                onValueChange={(value) => onPositionChange(value as any)} 
                className="grid grid-cols-3 gap-2"
              >
                {/* Top Left */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-2 border rounded-md relative h-24 w-24 bg-slate-50">
                    <div className="absolute top-0 left-0 h-8 w-8 rounded-full border overflow-visible flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                      <div className="h-6 w-6 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top-left" id="top-left" />
                    <Label htmlFor="top-left" className="text-xs">Top Left</Label>
                  </div>
                </div>
                
                {/* Top Right */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-2 border rounded-md relative h-24 w-24 bg-slate-50">
                    <div className="absolute top-0 right-0 h-8 w-8 rounded-full border overflow-visible flex items-center justify-center" style={{ transform: 'translate(50%, -50%)' }}>
                      <div className="h-6 w-6 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top-right" id="top-right" />
                    <Label htmlFor="top-right" className="text-xs">Top Right</Label>
                  </div>
                </div>
                
                {/* Bottom Left */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-2 border rounded-md relative h-24 w-24 bg-slate-50">
                    <div className="absolute bottom-0 left-0 h-8 w-8 rounded-full border overflow-visible flex items-center justify-center" style={{ transform: 'translate(-50%, 50%)' }}>
                      <div className="h-6 w-6 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-left" id="bottom-left" />
                    <Label htmlFor="bottom-left" className="text-xs">Bottom Left</Label>
                  </div>
                </div>
                
                {/* Bottom Right */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-2 border rounded-md relative h-24 w-24 bg-slate-50">
                    <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full border overflow-visible flex items-center justify-center" style={{ transform: 'translate(50%, 50%)' }}>
                      <div className="h-6 w-6 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="bottom-right" />
                    <Label htmlFor="bottom-right" className="text-xs">Bottom Right</Label>
                  </div>
                </div>
                
                {/* Center */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-2 border rounded-md relative h-24 w-24 bg-slate-50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border overflow-visible flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="center" />
                    <Label htmlFor="center" className="text-xs">Center</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Size</h3>
              <RadioGroup 
                value={selectedSize} 
                onValueChange={(value) => onSizeChange(value as any)} 
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-12 w-12 rounded-full border flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">Small</Label>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-20 w-20 rounded-full border flex items-center justify-center">
                    <div className="h-18 w-18 rounded-full bg-muted"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-28 w-28 rounded-full border flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-muted"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large">Large</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="pt-2">
              <Button onClick={() => setTab("select")} variant="outline" className="w-full">
                Back to Badge Selection
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {selectedBadge && (
        <div className="pt-2 border-t">
          <Badge variant="outline" className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            Badge Selected
          </Badge>
        </div>
      )}
    </div>
  );
}
