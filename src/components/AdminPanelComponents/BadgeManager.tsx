import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BadgeData } from "@/types/BadgeTypes";

export function BadgeManager() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    image_url: "",
    visibility: "public" as "public" | "premium"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        toast({
          title: "Error",
          description: "Failed to load badges.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Transform data with proper typing
        const transformedBadges: BadgeData[] = data.map(badge => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          image_url: badge.image_url,
          is_active: badge.is_active,
          visibility: (badge.visibility as 'public' | 'premium') || 'public',
          created_at: badge.created_at
        }));
        setBadges(transformedBadges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast({
        title: "Error",
        description: "Failed to load badges.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBadge = async () => {
    if (!newBadge.name || !newBadge.image_url) {
      toast({
        title: "Validation Error",
        description: "Name and image URL are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('badges')
        .insert([{
          name: newBadge.name,
          description: newBadge.description,
          image_url: newBadge.image_url,
          visibility: newBadge.visibility,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating badge:', error);
        toast({
          title: "Error",
          description: "Failed to create badge.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const transformedBadge: BadgeData = {
          id: data.id,
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          is_active: data.is_active,
          visibility: (data.visibility as 'public' | 'premium') || 'public',
          created_at: data.created_at
        };
        setBadges([transformedBadge, ...badges]);
        setNewBadge({ name: "", description: "", image_url: "", visibility: "public" });
        toast({
          title: "Success",
          description: "Badge created successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      toast({
        title: "Error",
        description: "Failed to create badge.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBadge = async (badgeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('badges')
        .update({ is_active: isActive })
        .eq('id', badgeId);

      if (error) {
        console.error('Error updating badge:', error);
        toast({
          title: "Error",
          description: "Failed to update badge.",
          variant: "destructive",
        });
        return;
      }

      setBadges(badges.map(badge => 
        badge.id === badgeId ? { ...badge, is_active: isActive } : badge
      ));

      toast({
        title: "Success",
        description: `Badge ${isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating badge:', error);
      toast({
        title: "Error",
        description: "Failed to update badge.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBadgeVisibility = async (badgeId: string, visibility: "public" | "premium") => {
    try {
      const { error } = await supabase
        .from('badges')
        .update({ visibility })
        .eq('id', badgeId);

      if (error) {
        console.error('Error updating badge visibility:', error);
        toast({
          title: "Error",
          description: "Failed to update badge visibility.",
          variant: "destructive",
        });
        return;
      }

      setBadges(badges.map(badge => 
        badge.id === badgeId ? { ...badge, visibility } : badge
      ));

      toast({
        title: "Success",
        description: "Badge visibility updated successfully.",
      });
    } catch (error) {
      console.error('Error updating badge visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update badge visibility.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId);

      if (error) {
        console.error('Error deleting badge:', error);
        toast({
          title: "Error",
          description: "Failed to delete badge.",
          variant: "destructive",
        });
        return;
      }

      setBadges(badges.filter(badge => badge.id !== badgeId));
      toast({
        title: "Success",
        description: "Badge deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast({
        title: "Error",
        description: "Failed to delete badge.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `badges/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('badges')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image.",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('badges')
        .getPublicUrl(filePath);

      setNewBadge({ ...newBadge, image_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Badge</CardTitle>
          <CardDescription>
            Add a new badge that users can select for their profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="badge-name">Badge Name</Label>
              <Input
                id="badge-name"
                value={newBadge.name}
                onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                placeholder="Enter badge name"
              />
            </div>
            <div>
              <Label htmlFor="badge-visibility">Visibility</Label>
              <Select
                value={newBadge.visibility}
                onValueChange={(value: "public" | "premium") => 
                  setNewBadge({ ...newBadge, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (All Users)</SelectItem>
                  <SelectItem value="premium">Premium Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="badge-description">Description (Optional)</Label>
            <Textarea
              id="badge-description"
              value={newBadge.description}
              onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
              placeholder="Enter badge description"
            />
          </div>

          <div>
            <Label htmlFor="badge-image">Badge Image</Label>
            <div className="flex gap-2">
              <Input
                id="badge-image"
                value={newBadge.image_url}
                onChange={(e) => setNewBadge({ ...newBadge, image_url: e.target.value })}
                placeholder="Enter image URL or upload file"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleCreateBadge} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Badge"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Badges</CardTitle>
          <CardDescription>
            View and manage all existing badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {badge.image_url && (
                    <img 
                      src={badge.image_url} 
                      alt={badge.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{badge.name}</h4>
                    {badge.description && (
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <Badge variant={badge.visibility === 'premium' ? 'default' : 'secondary'}>
                        {badge.visibility}
                      </Badge>
                      <Badge variant={badge.is_active ? 'default' : 'destructive'}>
                        {badge.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={badge.visibility}
                    onValueChange={(value: "public" | "premium") => 
                      handleUpdateBadgeVisibility(badge.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Switch
                    checked={!!badge.is_active}
                    onCheckedChange={(checked) => handleToggleBadge(badge.id, checked)}
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteBadge(badge.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {badges.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No badges created yet. Create your first badge above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
