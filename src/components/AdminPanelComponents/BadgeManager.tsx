
import { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeVisibility } from "@/types/TeamMemberTypes";

interface BadgeData {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  visibility: BadgeVisibility;
  created_at: string;
}

interface BadgeManagerProps {
  badgesEnabled?: boolean;
}

export function BadgeManager({ badgesEnabled = true }: BadgeManagerProps) {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBadgeModalOpen, setAddBadgeModalOpen] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeDescription, setNewBadgeDescription] = useState("");
  const [newBadgeImageUrl, setNewBadgeImageUrl] = useState("");
  const [newBadgeVisibility, setNewBadgeVisibility] = useState<BadgeVisibility>("public");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching badges:", error);
          throw error;
        }

        if (data) {
          setBadges(data);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
        toast({
          title: "Error",
          description: "Failed to load badges. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [toast]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
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
      
      // Create URL from file for preview
      const url = URL.createObjectURL(file);
      setNewBadgeImageUrl(url);
      toast({
        title: "Image Added",
        description: "Your badge image has been set for preview"
      });
    }
  }, [toast]);

  const openAddBadgeModal = () => {
    setAddBadgeModalOpen(true);
  };

  const closeAddBadgeModal = () => {
    setAddBadgeModalOpen(false);
    setNewBadgeName("");
    setNewBadgeDescription("");
    setNewBadgeImageUrl("");
    setNewBadgeVisibility("public");
  };

  const handleAddBadge = async () => {
    if (!newBadgeName || !newBadgeImageUrl) {
      toast({
        title: "Error",
        description: "Badge name and image URL are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('badges')
        .insert([
          {
            name: newBadgeName,
            description: newBadgeDescription,
            image_url: newBadgeImageUrl,
            visibility: newBadgeVisibility,
            is_active: true,
          },
        ]);

      if (error) {
        console.error("Error adding badge:", error);
        throw error;
      }

      // Refresh badges
      const { data } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setBadges(data);
      }

      toast({
        title: "Success",
        description: "Badge added successfully.",
      });
      closeAddBadgeModal();
    } catch (error) {
      console.error("Error adding badge:", error);
      toast({
        title: "Error",
        description: "Failed to add badge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBadge = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('badges')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error("Error updating badge:", error);
        throw error;
      }

      setBadges(
        badges.map((badge) =>
          badge.id === id ? { ...badge, is_active: isActive } : badge
        )
      );

      toast({
        title: "Success",
        description: `Badge ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error("Error toggling badge:", error);
      toast({
        title: "Error",
        description: "Failed to update badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateVisibility = async (id: string, visibility: BadgeVisibility) => {
    try {
      const { error } = await supabase
        .from('badges')
        .update({ visibility })
        .eq('id', id);

      if (error) {
        console.error("Error updating badge visibility:", error);
        throw error;
      }

      setBadges(
        badges.map((badge) =>
          badge.id === id ? { ...badge, visibility } : badge
        )
      );

      toast({
        title: "Success",
        description: "Badge visibility updated.",
      });
    } catch (error) {
      console.error("Error updating badge visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update badge visibility.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBadge = async (id: string) => {
    try {
      const { error } = await supabase.from('badges').delete().eq('id', id);

      if (error) {
        console.error("Error deleting badge:", error);
        throw error;
      }

      setBadges(badges.filter((badge) => badge.id !== id));

      toast({
        title: "Success",
        description: "Badge deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast({
        title: "Error",
        description: "Failed to delete badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!badgesEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badge Manager</CardTitle>
          <CardDescription>
            Create and manage badges for team members
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Badges are disabled</h3>
          <p className="text-muted-foreground mb-4">
            Enable badges in the Badge Settings panel before managing them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Badge Manager</CardTitle>
          <CardDescription>
            Create and manage badges for team members with visibility controls
          </CardDescription>
        </div>
        <Dialog open={addBadgeModalOpen} onOpenChange={setAddBadgeModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddBadgeModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Badge</DialogTitle>
              <DialogDescription>
                Create a new badge for team members to use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="badge-name">Badge Name</Label>
                <Input
                  id="badge-name"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="e.g., Gold Star"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge-desc">Description (Optional)</Label>
                <Input
                  id="badge-desc"
                  value={newBadgeDescription}
                  onChange={(e) => setNewBadgeDescription(e.target.value)}
                  placeholder="e.g., Awarded for excellence"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Badge Image</Label>
                <div 
                  className={`
                    border-2 border-dashed rounded-md p-6 text-center transition-colors
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop your image here
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="badge-url">Or enter an image URL</Label>
                  <Input
                    id="badge-url"
                    value={newBadgeImageUrl}
                    onChange={(e) => setNewBadgeImageUrl(e.target.value)}
                    placeholder="https://example.com/badge.png"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge-visibility">Visibility</Label>
                <Select value={newBadgeVisibility} onValueChange={(value: BadgeVisibility) => setNewBadgeVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (All Users)</SelectItem>
                    <SelectItem value="premium">Premium Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {newBadgeVisibility === 'public' 
                    ? 'Available to all users including non-premium' 
                    : 'Only available to premium users'}
                </p>
              </div>

              {newBadgeImageUrl && (
                <div className="mt-4 border rounded-lg p-4 flex justify-center">
                  <img
                    src={newBadgeImageUrl}
                    alt="Badge preview"
                    className="h-20 w-20 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/200x200?text=Error";
                      toast({
                        title: "Image Error",
                        description: "The provided URL could not be loaded.",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeAddBadgeModal}>
                Cancel
              </Button>
              <Button onClick={handleAddBadge}>Add Badge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-10 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading badges...</p>
          </div>
        ) : badges.length === 0 ? (
          <div className="py-10 text-center border rounded-lg">
            <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No badges found</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first badge
            </p>
            <Button onClick={openAddBadgeModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Badge
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-14 w-14 mr-3 flex items-center justify-center">
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{badge.name}</h3>
                        {badge.is_active && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      {badge.description && (
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Visibility</Label>
                    <Select 
                      value={badge.visibility} 
                      onValueChange={(value: BadgeVisibility) => handleUpdateVisibility(badge.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Active</Label>
                    <Switch
                      checked={badge.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleBadge(badge.id, checked)
                      }
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this badge?"
                        )
                      ) {
                        handleDeleteBadge(badge.id);
                      }
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Delete Badge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
