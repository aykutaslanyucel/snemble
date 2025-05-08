
import { motion } from "framer-motion";
import { Announcement } from "@/types/TeamMemberTypes";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";
import "../styles/announcements.css";

interface AnnouncementBannerProps {
  announcements: Announcement[];
  onDelete?: (id: string) => void;
}

export function AnnouncementBanner({ announcements, onDelete }: AnnouncementBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const activeAnnouncements = announcements.filter(announcement => 
    announcement.isActive !== false && 
    (!announcement.expiresAt || new Date(announcement.expiresAt) > new Date())
  );
  
  // Sort by priority if available
  const sortedAnnouncements = [...activeAnnouncements].sort((a, b) => 
    (b.priority || 0) - (a.priority || 0)
  );
  
  // Don't render if no active announcements
  if (sortedAnnouncements.length === 0) return null;
  
  const currentAnnouncement = sortedAnnouncements[currentIndex];
  
  // Go to next announcement after a delay
  useEffect(() => {
    if (sortedAnnouncements.length <= 1 || isPaused) return;
    
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedAnnouncements.length);
    }, 8000); // 8 seconds between announcements
    
    return () => clearTimeout(timer);
  }, [currentIndex, sortedAnnouncements.length, isPaused]);
  
  // Apply default theme if not provided
  const theme = currentAnnouncement.theme || {
    backgroundColor: "from-primary/5 via-primary/10 to-primary/5", 
    textColor: "text-foreground",
    borderColor: "border-white/10",
    animationStyle: "scroll" 
  };
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? sortedAnnouncements.length - 1 : prev - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => 
      (prev + 1) % sortedAnnouncements.length
    );
  };
  
  // Get animation class based on theme style
  const getAnimationClass = () => {
    switch(theme.animationStyle) {
      case "fade":
        return "animate-fade";
      case "flash":
        return "animate-flash";
      case "scroll":
        return "animate-scroll";
      default:
        return "";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`bg-gradient-to-r ${theme.backgroundColor} backdrop-blur-sm border-b ${theme.borderColor} relative`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container py-3 px-4 overflow-hidden">
        <div className={`flex items-center justify-between ${theme.textColor} ${getAnimationClass()}`}>
          <div className="flex-1 overflow-auto">
            {currentAnnouncement.htmlContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: currentAnnouncement.htmlContent }} 
                className="text-sm font-medium announcement-content"
              />
            ) : (
              <p className="text-sm font-medium">{currentAnnouncement.message}</p>
            )}
            <span className="text-xs text-muted-foreground block mt-1">
              {new Date(currentAnnouncement.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {sortedAnnouncements.length > 1 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full bg-background/80 hover:bg-background/90"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-3 w-3" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full bg-background/80 hover:bg-background/90"
              onClick={handleNext}
            >
              <ChevronRight className="h-3 w-3" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        )}
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1 h-6 w-6 rounded-full hover:bg-background/20"
            onClick={() => onDelete(currentAnnouncement.id)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
