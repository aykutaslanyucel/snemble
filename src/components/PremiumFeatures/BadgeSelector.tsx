
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { BadgePosition } from "@/types/TeamMemberTypes";

interface BadgeSelectorProps {
  badges: Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;
  selectedBadge?: string;
  onSelectBadge: (badgeUrl: string | null) => void;
  onPositionChange: (position: BadgePosition) => void;
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
                onValueChange={(value) => onPositionChange(value as BadgePosition)} 
                className="grid grid-cols-2 gap-2"
              >
                {/* Position preview boxes - Only top-right and bottom-right allowed */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 border rounded-md bg-slate-50 relative" style={{ width: '90px', height: '90px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-15px', width: '30px', height: '30px', zIndex: 999 }}>
                      <div className="bg-primary rounded-full w-full h-full"></div>
                    </div>
                    <div className="w-full h-full border border-dashed border-gray-300"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top-right" id="top-right" />
                    <Label htmlFor="top-right">Top Right</Label>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 border rounded-md bg-slate-50 relative" style={{ width: '90px', height: '90px', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: '-20px', right: '-15px', width: '30px', height: '30px', zIndex: 999 }}>
                      <div className="bg-primary rounded-full w-full h-full"></div>
                    </div>
                    <div className="w-full h-full border border-dashed border-gray-300"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="bottom-right" />
                    <Label htmlFor="bottom-right">Bottom Right</Label>
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
                  <div className="h-12 w-12 rounded-full border bg-primary/20 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-primary/40"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">Small</Label>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-20 w-20 rounded-full border bg-primary/20 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/40"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-28 w-28 rounded-full border bg-primary/20 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-primary/40"></div>
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
