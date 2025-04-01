
import { motion } from "framer-motion";
import { Announcement } from "@/types/TeamMemberTypes";

interface AnnouncementBannerProps {
  announcement: Announcement;
}

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm border-b border-white/10">
      <div className="container py-3 px-4 overflow-hidden">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="flex items-center space-x-8 whitespace-nowrap">
            <p className="text-sm font-medium">{announcement.message}</p>
            <span className="text-xs text-muted-foreground">
              {announcement.timestamp.toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
