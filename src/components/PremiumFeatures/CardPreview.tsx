
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

  // Define size classes for badges
  const badgeSizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-28 h-28"
  };
  
  // Get badge size class
  const sizeClass = badgeSizeClasses[badgeSize as keyof typeof badgeSizeClasses] || badgeSizeClasses.medium;

  // Calculate badge position styles - fully outside the card
  const getBadgeStyle = () => {
    if (!badge || !badgePosition) return {};
    
    const positions: Record<string, React.CSSProperties> = {
      "top-left": { 
        position: "absolute", 
        top: "-40%", 
        left: "-25%", 
        transform: "none"
      },
      "top-right": { 
        position: "absolute", 
        top: "-40%", 
        right: "-25%", 
        transform: "none"
      },
      "bottom-left": { 
        position: "absolute", 
        bottom: "-40%", 
        left: "-25%", 
        transform: "none"
      },
      "bottom-right": { 
        position: "absolute", 
        bottom: "-40%", 
        right: "-25%", 
        transform: "none"
      }
    };
    
    return positions[badgePosition] || positions["top-right"];
  };

  return (
    <div className="relative">
      {/* Badge placed outside card for "hat" effect */}
      {badge && (
        <div 
          className={`${sizeClass} pointer-events-none z-10`}
          style={getBadgeStyle()}
        >
          <img 
            src={badge} 
            alt="Badge" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <Card 
        className={`border relative ${animationClass}`}
        style={{
          ...previewStyle,
          backgroundSize: "200% 200%"
        }}
      >
        <CardHeader className="p-4">
          <CardTitle className="text-base">{teamMember.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm">Card preview</p>
        </CardContent>
      </Card>
    </div>
  );
}
