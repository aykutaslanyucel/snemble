
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamMember } from "@/types/TeamMemberTypes";
import "@/styles/animations.css";

interface CardPreviewProps {
  teamMember: TeamMember;
  previewStyle: {
    background: string;
  };
  animate: boolean;
  animationType?: string;
  badge?: string;
  badgePosition?: string;
  badgeSize?: string;
}

export function CardPreview({ 
  teamMember, 
  previewStyle, 
  animate, 
  animationType = "animate-gradient",
  badge,
  badgePosition = "top-right",
  badgeSize = "medium"
}: CardPreviewProps) {
  // Determine the animation class based on the type
  const animationClass = animate ? 
    (animationType && animationType !== "none" ? 
      `animate-gradient-${animationType}` : 
      "animate-gradient") : 
    "";

  // Define size classes for badges
  const badgeSizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  // Define position classes for badges
  const badgePositionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "center": "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  };

  // Get size and position classes
  const sizeClass = badgeSizeClasses[badgeSize as keyof typeof badgeSizeClasses] || badgeSizeClasses.medium;
  const positionClass = badgePositionClasses[badgePosition as keyof typeof badgePositionClasses] || badgePositionClasses["top-right"];

  return (
    <Card 
      className={`border relative ${animationClass}`}
      style={previewStyle}
    >
      {badge && (
        <div className={`absolute ${positionClass} ${sizeClass} rounded-full overflow-hidden z-10`}>
          <img 
            src={badge} 
            alt="Badge" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <CardHeader className="p-4">
        <CardTitle className="text-base">{teamMember.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm">Card preview</p>
      </CardContent>
    </Card>
  );
}
