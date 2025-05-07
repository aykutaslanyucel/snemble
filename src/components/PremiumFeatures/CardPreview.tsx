
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamMember, GradientAnimationType } from "@/types/TeamMemberTypes";
import "@/styles/animations.css";

interface CardPreviewProps {
  teamMember: TeamMember;
  previewStyle: {
    background: string;
  };
  animate: boolean;
  animationType?: GradientAnimationType;
  badge?: string;
  badgePosition?: string;
  badgeSize?: string;
}

export function CardPreview({ 
  teamMember, 
  previewStyle, 
  animate, 
  animationType = "gentle",
  badge,
  badgePosition = "top-right",
  badgeSize = "medium"
}: CardPreviewProps) {
  // Determine the animation class based on the type
  const animationClass = animate && previewStyle.background.includes('gradient') ? 
    (animationType && animationType !== "none" ? 
      `animate-gradient-${animationType}` : 
      "animate-gradient-gentle") : 
    "";

  // Define size classes for badges with larger dimensions
  const badgeSizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-28 h-28"
  };

  // Calculate position values for badges with much larger offsets for "hat" effect
  // We'll use much more extreme offset values to make them extend well beyond the card
  const badgePositionValues = {
    "top-left": { top: "-40px", left: "-40px", transform: "none" },
    "top-right": { top: "-40px", right: "-40px", transform: "none" },
    "bottom-left": { bottom: "-40px", left: "-40px", transform: "none" },
    "bottom-right": { bottom: "-40px", right: "-40px", transform: "none" },
    "center": { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
  };

  // Get size and position styles
  const sizeClass = badgeSizeClasses[badgeSize as keyof typeof badgeSizeClasses] || badgeSizeClasses.medium;
  const positionStyle = badgePositionValues[badgePosition as keyof typeof badgePositionValues] || badgePositionValues["top-right"];

  return (
    <Card 
      className={`border relative ${animationClass}`}
      style={{
        ...previewStyle,
        backgroundSize: "200% 200%"
      }}
    >
      {badge && (
        <div 
          className={`absolute ${sizeClass} rounded-full overflow-hidden z-20 pointer-events-none`}
          style={positionStyle}
        >
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
