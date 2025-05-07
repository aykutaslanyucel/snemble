import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Trash2, ImageIcon, Plus } from "lucide-react";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/types/TeamMemberTypes";

export function BadgeManager() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    is_active: true
  });
  const [badgeImage, setBadgeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch badges
  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        // Fix: Convert the string timestamp to Date objects
        const convertedBadges: Badge[] = data.map(badge => ({
          ...badge,
          created_at: new Date(badge.created_at)
        }));
        setBadges(convertedBadges);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast({
        title: "Error",
        description: "Failed to load badges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setBadgeImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBadge = async () => {
    if (!badgeImage) {
      toast({
        title: "Image required",
        description: "Please upload a badge image",
        variant: "destructive",
      });
      return;
    }
    
    if (!newBadge.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a badge name",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // 1. Upload image to Storage
      const fileExt = badgeImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `badges/${fileName}`;
      
      // Check if badges storage bucket exists, create if not
      try {
        const { data: bucketData } = await supabase.storage.getBucket('badges');
        if (!bucketData) {
          await supabase.storage.createBucket('badges', {
            public: true,
            fileSizeLimit: 2097152 // 2MB
          });
        }
      } catch (error) {
        console.log("Creating badges bucket...");
        await supabase.storage.createBucket('badges', {
          public: true,
          fileSizeLimit: 2097152 // 2MB
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('badges')
        .upload(filePath, badgeImage);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('badges')
        .getPublicUrl(filePath);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // 2. Insert badge record
      const { data: badgeData, error: insertError } = await supabase
        .from('badges')
        .insert([
          {
            name: newBadge.name,
            description: newBadge.description || null,
            image_url: imageUrl,
            is_active: newBadge.is_active
          }
        ])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      // Fix: Parse the created_at as a Date object
      const newBadgeWithDate: Badge = {
        ...badgeData,
        created_at: new Date(badgeData.created_at)
      };
      
      // 3. Update local state
      setBadges([...badges, newBadgeWithDate]);
      
      // 4. Reset form
      setNewBadge({
        name: "",
        description: "",
        is_active: true
      });
      setBadgeImage(null);
      setImagePreview(null);
      setShowAddDialog(false);
      
      toast({
        title: "Badge added",
        description: "The badge has been added successfully",
      });
    } catch (error) {
      console.error("Error adding badge:", error);
      toast({
        title: "Error",
        description: "Failed to add badge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async () => {
    if (!deletingBadge) return;
    
    setLoading(true);
    try {
      // Delete from database
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', deletingBadge.id);
        
      if (error) throw error;
      
      // Try to delete the image file
      // Extract file path from URL
      const urlParts = deletingBadge.image_url.split('/');
      const filePath = urlParts[urlParts.length - 1];
      
      try {
        await supabase.storage
          .from('badges')
          .remove([`badges/${filePath}`]);
      } catch (storageError) {
        console.error("Error removing badge image:", storageError);
        // Continue even if image deletion fails
      }
      
      // Update local state
      setBadges(badges.filter(b => b.id !== deletingBadge.id));
      setDeletingBadge(null);
      
      toast({
        title: "Badge deleted",
        description: "The badge has been removed successfully",
      });
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast({
        title: "Error",
        description: "Failed to delete badge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Badge Management</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Badge
        </Button>
      </div>
      
      {loading && badges.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading badges...</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-muted-foreground">No badges have been added yet</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddDialog(true)}
          >
            Add Your First Badge
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Badge</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {badges.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell>
                  <div className="h-12 w-12 rounded-md overflow-hidden border">
                    <img 
                      src={badge.image_url} 
                      alt={badge.name} 
                      className="h-full w-full object-contain"
                    />
                  </div>
                </TableCell>
                <TableCell>{badge.name}</TableCell>
                <TableCell>{badge.description || "—"}</TableCell>
                <TableCell>
                  <UIBadge variant={badge.is_active ? "default" : "outline"}>
                    {badge.is_active ? "Active" : "Inactive"}
                  </UIBadge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setDeletingBadge(badge)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Add Badge Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Badge</DialogTitle>
            <DialogDescription>
              Upload a new badge image and provide details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="badge-image">Badge Image</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
                {imagePreview ? (
                  <div className="text-center">
                    <div className="h-32 w-32 mx-auto mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Badge Preview" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setBadgeImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="badge-upload" className="cursor-pointer text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG (max 2MB)
                    </p>
                    <input
                      id="badge-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-name">Name</Label>
              <Input
                id="badge-name"
                value={newBadge.name}
                onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                placeholder="Enter badge name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-description">Description (optional)</Label>
              <Input
                id="badge-description"
                value={newBadge.description}
                onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
                placeholder="Enter badge description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBadge} disabled={loading}>
              {loading ? "Adding..." : "Add Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBadge} onOpenChange={(open) => !open && setDeletingBadge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this badge? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBadge}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
