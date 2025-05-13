import { useState, useCallback } from "react";
import { Announcement } from "@/types/TeamMemberTypes";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "./ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChevronUp, ChevronDown, Trash2, AlertCircle, Calendar, MessageSquarePlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onUpdateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

const DEFAULT_COLORS = [
  { bg: "from-blue-500/10 via-blue-600/20 to-blue-500/10", text: "text-blue-700" },
  { bg: "from-green-500/10 via-green-600/20 to-green-500/10", text: "text-green-700" },
  { bg: "from-red-500/10 via-red-600/20 to-red-500/10", text: "text-red-700" },
  { bg: "from-purple-500/10 via-purple-600/20 to-purple-500/10", text: "text-purple-700" },
  { bg: "from-yellow-500/10 via-yellow-600/20 to-yellow-500/10", text: "text-yellow-700" },
];

const ANIMATION_STYLES = [
  { value: "scroll", label: "Scroll" },
  { value: "fade", label: "Fade" },
  { value: "flash", label: "Flash" },
  { value: "none", label: "None" },
];

export function AnnouncementManager({ 
  announcements, 
  onAddAnnouncement, 
  onUpdateAnnouncement, 
  onDeleteAnnouncement 
}: AnnouncementManagerProps) {
  const [newAnnouncement, setNewAnnouncement] = useState({
    message: "",
    htmlContent: "",
    priority: 0,
    expiresAt: null as Date | null,
    theme: {
      backgroundColor: "from-primary/5 via-primary/10 to-primary/5", 
      textColor: "text-foreground",
      borderColor: "border-white/10",
      animationStyle: "scroll" as "scroll" | "fade" | "flash" | "none"
    },
    isActive: true
  });
  
  const [currentTab, setCurrentTab] = useState("create");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const handleAddAnnouncement = useCallback(async () => {
    if (!newAnnouncement.message.trim() && !newAnnouncement.htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter an announcement message",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const id = uuidv4();
      const timestamp = new Date();
      
      const announcement: Announcement = {
        id: id,
        message: newAnnouncement.message,
        htmlContent: newAnnouncement.htmlContent || undefined,
        timestamp: timestamp,
        expiresAt: newAnnouncement.expiresAt || undefined,
        priority: newAnnouncement.priority,
        theme: newAnnouncement.theme,
        isActive: true
      };
      
      console.log("Adding announcement:", announcement);
      
      // Save to Supabase directly - created_by is now optional with updated RLS policies
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          id: id,
          message: newAnnouncement.message,
          html_content: newAnnouncement.htmlContent || null,
          timestamp: timestamp.toISOString(),
          expires_at: newAnnouncement.expiresAt?.toISOString() || null,
          priority: newAnnouncement.priority,
          theme: newAnnouncement.theme,
          is_active: true
        })
        .select();
        
      if (error) {
        console.error("Supabase insertion error:", error);
        throw error;
      }
      
      console.log("Successfully inserted announcement:", data);
      
      // If successful, update UI
      onAddAnnouncement(announcement);
      
      // Reset form
      setNewAnnouncement({
        message: "",
        htmlContent: "",
        priority: 0,
        expiresAt: null,
        theme: {
          backgroundColor: "from-primary/5 via-primary/10 to-primary/5", 
          textColor: "text-foreground",
          borderColor: "border-white/10",
          animationStyle: "scroll" as "scroll" | "fade" | "flash" | "none"
        },
        isActive: true
      });
      
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      
      // Close the sheet after adding
      setIsOpen(false);
      
    } catch (error: any) {
      console.error("Error adding announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    }
  }, [newAnnouncement, onAddAnnouncement, toast]);
  
  const handleUpdateAnnouncementTheme = async (id: string, theme: any) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('announcements')
        .update({ theme })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in UI
      onUpdateAnnouncement(id, { theme });
      
      toast({
        title: "Theme Updated",
        description: "Announcement appearance has been updated.",
      });
    } catch (error) {
      console.error("Error updating announcement theme:", error);
      toast({
        title: "Error",
        description: "Failed to update appearance",
        variant: "destructive",
      });
    }
  };
  
  const handleColorSelect = (bgColor: string, textColor: string) => {
    setNewAnnouncement({
      ...newAnnouncement,
      theme: {
        ...newAnnouncement.theme,
        backgroundColor: bgColor,
        textColor: textColor
      }
    });
  };
  
  const handleAnimationSelect = (style: "scroll" | "fade" | "flash" | "none") => {
    setNewAnnouncement({
      ...newAnnouncement,
      theme: {
        ...newAnnouncement.theme,
        animationStyle: style
      }
    });
  };
  
  const handleMovePriority = async (id: string, direction: "up" | "down") => {
    const currentIndex = announcements.findIndex(a => a.id === id);
    if (currentIndex === -1) return;
    
    const currentPriority = announcements[currentIndex].priority || 0;
    const newPriority = direction === "up" ? currentPriority + 1 : Math.max(0, currentPriority - 1);
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('announcements')
        .update({ priority: newPriority })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in UI
      onUpdateAnnouncement(id, { priority: newPriority });
    } catch (error) {
      console.error("Error updating announcement priority:", error);
      toast({
        title: "Error",
        description: "Failed to change announcement priority",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in UI
      onUpdateAnnouncement(id, { isActive });
      
      toast({
        title: isActive ? "Announcement Activated" : "Announcement Deactivated",
        description: isActive 
          ? "The announcement is now visible to all users."
          : "The announcement has been hidden from users.",
      });
    } catch (error) {
      console.error("Error toggling announcement status:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement status",
        variant: "destructive",
      });
    }
  };
  
  const handleExpiryDateChange = (value: string) => {
    // Set time to end of the selected day
    if (value) {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      setNewAnnouncement({
        ...newAnnouncement,
        expiresAt: date
      });
    } else {
      setNewAnnouncement({
        ...newAnnouncement,
        expiresAt: null
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="bg-white/5">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Announcements
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Team Announcements</SheetTitle>
          <SheetDescription>
            Create and manage announcements for your team
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="create" value={currentTab} onValueChange={setCurrentTab} className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="manage">Manage ({announcements.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input 
                id="message" 
                value={newAnnouncement.message} 
                onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                placeholder="Short summary (optional)" 
                className="text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Message Content</Label>
              <div className="rounded-md">
                <RichTextEditor 
                  value={newAnnouncement.htmlContent} 
                  onChange={(html) => setNewAnnouncement({...newAnnouncement, htmlContent: html})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Expires On</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  onChange={(e) => handleExpiryDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Today as min date
                  className="text-foreground"
                />
              </div>
              {newAnnouncement.expiresAt && (
                <p className="text-xs text-muted-foreground">
                  This announcement will expire at the end of {new Date(newAnnouncement.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Input 
                type="number" 
                min="0"
                value={newAnnouncement.priority} 
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement, 
                  priority: parseInt(e.target.value) || 0
                })}
                className="text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Higher numbers appear first
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Appearance</Label>
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map((color, i) => (
                  <Button 
                    key={i}
                    type="button" 
                    className={`h-8 w-full bg-gradient-to-r ${color.bg} border ${
                      newAnnouncement.theme.backgroundColor === color.bg ? 'ring-2 ring-primary' : ''
                    }`}
                    variant="outline"
                    onClick={() => handleColorSelect(color.bg, color.text)}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Animation Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ANIMATION_STYLES.map(style => (
                  <Button 
                    key={style.value}
                    type="button" 
                    variant={newAnnouncement.theme.animationStyle === style.value ? "default" : "outline"}
                    className="h-8"
                    onClick={() => handleAnimationSelect(style.value as "scroll" | "fade" | "flash" | "none")}
                  >
                    {style.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button className="w-full" onClick={handleAddAnnouncement}>
                Post Announcement
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4 mt-4">
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">No announcements yet</p>
                <Button 
                  variant="link" 
                  onClick={() => setCurrentTab("create")}
                  className="mt-2"
                >
                  Create your first announcement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {[...announcements]
                  .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                  .map((announcement) => {
                    // Make sure the announcement has a valid Date object for timestamp
                    const timestamp = announcement.timestamp instanceof Date 
                      ? announcement.timestamp 
                      : new Date(announcement.timestamp);
                    
                    return (
                      <Card key={announcement.id} className="p-4 relative">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleMovePriority(announcement.id, "up")}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleMovePriority(announcement.id, "down")}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 z-50">
                              <div className="space-y-3">
                                <h4 className="font-medium">Are you sure?</h4>
                                <p className="text-sm text-muted-foreground">
                                  This will permanently delete this announcement.
                                </p>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      onDeleteAnnouncement(announcement.id);
                                      toast({
                                        title: "Announcement deleted",
                                        description: "The announcement has been removed",
                                      });
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="pr-20">
                          {announcement.htmlContent ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: announcement.htmlContent }} 
                              className="text-sm mb-2 announcement-content"
                            />
                          ) : (
                            <p className="text-sm mb-2">{announcement.message}</p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {timestamp.toLocaleDateString()}
                            </Badge>
                            
                            {announcement.priority ? (
                              <Badge variant="outline">
                                Priority: {announcement.priority}
                              </Badge>
                            ) : null}
                            
                            {announcement.expiresAt && (
                              <Badge variant="outline" className="text-yellow-600">
                                Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            variant={announcement.isActive !== false ? "default" : "secondary"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleToggleActive(announcement.id, announcement.isActive === false)}
                          >
                            {announcement.isActive !== false ? "Active" : "Inactive"}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
