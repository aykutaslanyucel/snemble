
interface Announcement {
  message: string;
  timestamp: Date;
}

interface AnnouncementBannerProps {
  announcement: Announcement;
}

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  return (
    <div className="bg-primary/10 backdrop-blur-sm border-b">
      <div className="container py-2 px-4">
        <div className="flex items-center justify-between">
          <p className="text-sm">{announcement.message}</p>
          <span className="text-xs text-muted-foreground">
            {announcement.timestamp.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
