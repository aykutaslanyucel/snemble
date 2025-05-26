
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { BadgePosition, BadgeVisibility } from "@/types/TeamMemberTypes";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BadgeData {
  id: string;
  name: string;
  image_url: string;
  visibility: BadgeVisibility;
  is_active: boolean;
}

interface BadgeSelectorProps {
  selectedBadge?: string;
  onSelectBadge: (badgeUrl: string | null) => void;
  onPositionChange: (position: BadgePosition) => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  selectedPosition?: string;
  selectedSize?: string;
  isLoading?: boolean;
}

export function BadgeSelector({
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
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const { toast } = useToast();
  
  // For drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Filter badges based on user permissions
        const filteredBadges = data?.filter(badge => {
          if (badge.visibility === 'public') return true;
          if (badge.visibility === 'premium' && isPremium) return true;
          return false;
        }) || [];

        setBadges(filteredBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
        toast({
          title: "Error",
          description: "Failed to load badges",
          variant: "destructive"
        });
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, [isPremium, toast]);
  
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
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Custom badge uploads are only available for premium users",
        variant: "destructive"
      });
      return;
    }
    
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
      onSelectBadge(url);
      toast({
        title: "Badge Added",
        description: "Your custom badge image has been set"
      });
    }
  }, [onSelectBadge, toast, isPremium]);
  
  const handleCustomUrlAdd = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Custom badge URLs are only available for premium users",
        variant: "destructive"
      });
      return;
    }
    
    if (!customImageUrl) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive"
      });
      return;
    }
    
    // Simple URL validation
    try {
      new URL(customImageUrl);
      onSelectBadge(customImageUrl);
      toast({
        title: "Badge Added",
        description: "Your custom badge image has been set"
      });
      setCustomImageUrl('');
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
    }
  };
  
  // When no badges are available or still loading
  const renderPlaceholder = () => {
    if (isLoading || loadingBadges) {
      return (
        <div className="py-10 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading badges...</p>
        </div>
      );
    }
    
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">
          {badges.length === 0 ? "No badges available" : "No badges match your access level"}
        </p>
        {!isPremium && (
          <p className="text-xs mt-2">Upgrade to premium to access more badges</p>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="select">Select Badge</TabsTrigger>
          <TabsTrigger value="custom" disabled={!isPremium}>Custom Badge</TabsTrigger>
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
                      ${selectedBadge === badge.image_url ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => onSelectBadge(badge.image_url)}
                  >
                    <div className="h-16 w-16 mb-2 flex items-center justify-center">
                      <img 
                        src={badge.image_url} 
                        alt={badge.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-center text-gray-600 line-clamp-1">{badge.name}</span>
                    {badge.visibility === 'premium' && (
                      <Badge variant="outline" className="text-xs mt-1">Premium</Badge>
                    )}
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
        
        <TabsContent value="custom">
          {!isPremium ? (
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Premium Feature</h3>
              <p className="text-sm text-muted-foreground">
                Custom badges are available for premium users only
              </p>
              <Button className="mt-4" variant="outline" size="sm" disabled>
                Upgrade to Premium
              </Button>
            </div>
          ) : (
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
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="badge-url">Or enter an image URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="badge-url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="flex-1"
                  />
                  <Button onClick={handleCustomUrlAdd}>Add</Button>
                </div>
              </div>
              
              {selectedBadge && (
                <div className="mt-4 p-4 border rounded-md">
                  <h4 className="text-sm font-medium mb-2">Current Badge</h4>
                  <div className="flex items-center justify-center">
                    <img 
                      src={selectedBadge} 
                      alt="Selected badge" 
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => onSelectBadge(null)}
                  >
                    Remove Badge
                  </Button>
                </div>
              )}
            </div>
          )}
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
