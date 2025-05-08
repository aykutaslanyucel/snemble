// Import necessary components and hooks at the top
import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

interface BadgeManagerProps {
  badgesEnabled?: boolean;
}

export function BadgeManager({ badgesEnabled = true }: BadgeManagerProps) {
  const [badges, setBadges] = useState([]);
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
        description: "Failed to add badge.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBadge = async (id: string, is_active: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('badges')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) {
        console.error("Error updating badge:", error);
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
        description: "Badge status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating badge:", error);
      toast({
        title: "Error",
        description: "Failed to update badge status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {badgesEnabled === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-md mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Badges Currently Disabled</h3>
              <p className="text-yellow-700 dark:text-yellow-500 text-sm mt-1">
                You can still manage badges, but they won't be visible to users until you enable them again.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">All Badges</h3>
        <Button onClick={openAddBadgeModal} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Badge
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-center py-8 col-span-full">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading badges...</p>
          </div>
        ) : (
          badges.map((badge) => (
            <Card key={badge.id}>
              <CardHeader>
                <CardTitle>{badge.name}</CardTitle>
                <CardDescription>{badge.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <img
                  src={badge.image_url}
                  alt={badge.name}
                  className="w-24 h-24 object-contain rounded-md mb-3"
                />
                <Switch
                  checked={badge.is_active}
                  onCheckedChange={() => handleToggleBadge(badge.id, badge.is_active)}
                  disabled={loading || badgesEnabled === false}
                />
                <Label htmlFor="active" className="mt-2 text-sm text-muted-foreground">
                  {badge.is_active ? 'Active' : 'Inactive'}
                </Label>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={addBadgeModalOpen} onOpenChange={setAddBadgeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Badge</DialogTitle>
            <DialogDescription>
              Create a new badge to reward your team members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newBadgeName}
                onChange={(e) => setNewBadgeName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newBadgeDescription}
                onChange={(e) => setNewBadgeDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">
                Image URL
              </Label>
              <Input
                id="image_url"
                type="url"
                value={newBadgeImageUrl}
                onChange={(e) => setNewBadgeImageUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeAddBadgeModal}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddBadge} disabled={loading}>
              {loading ? "Adding..." : "Add Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
