
import { useState, useEffect } from "react";
import { Plus, AlertTriangle, Check } from "lucide-react";
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

interface BadgeData {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  is_active: boolean;
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

  const openAddBadgeModal = () => {
    setAddBadgeModalOpen(true);
  };

  const closeAddBadgeModal = () => {
    setAddBadgeModalOpen(false);
    setNewBadgeName("");
    setNewBadgeDescription("");
    setNewBadgeImageUrl("");
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

      // Update local state
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

  const handleDeleteBadge = async (id: string) => {
    try {
      const { error } = await supabase.from('badges').delete().eq('id', id);

      if (error) {
        console.error("Error deleting badge:", error);
        throw error;
      }

      // Update local state
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
            Create and manage badges for team members
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
                <Label htmlFor="badge-url">Badge Image URL</Label>
                <Input
                  id="badge-url"
                  value={newBadgeImageUrl}
                  onChange={(e) => setNewBadgeImageUrl(e.target.value)}
                  placeholder="https://example.com/badge.png"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a URL to an image that will be used as the badge
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
                className="border rounded-lg p-4 flex items-center justify-between"
              >
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={badge.is_active}
                    onCheckedChange={(checked) =>
                      handleToggleBadge(badge.id, checked)
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
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
                    <AlertTriangle className="h-4 w-4" />
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
