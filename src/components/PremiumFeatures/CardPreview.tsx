
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

  // Calculate badge position styles - more extreme positioning to ensure visibility
  const getBadgeStyle = () => {
    if (!badge || !badgePosition) return {};
    
    const positions: Record<string, React.CSSProperties> = {
      "top-left": { 
        position: "absolute", 
        top: "-60%", 
        left: "-35%", 
        transform: "none",
        zIndex: 50
      },
      "top-right": { 
        position: "absolute", 
        top: "-60%", 
        right: "-35%", 
        transform: "none",
        zIndex: 50
      },
      "bottom-left": { 
        position: "absolute", 
        bottom: "-60%", 
        left: "-35%", 
        transform: "none",
        zIndex: 50
      },
      "bottom-right": { 
        position: "absolute", 
        bottom: "-60%", 
        right: "-35%", 
        transform: "none",
        zIndex: 50
      }
    };
    
    return positions[badgePosition] || positions["top-right"];
  };

  return (
    <div className="relative w-full" style={{ position: "relative", overflow: "visible" }}>
      {/* Badge placed outside card for "hat" effect */}
      {badge && (
        <div 
          className={`${sizeClass} pointer-events-none z-50`}
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
          backgroundSize: "200% 200%",
          overflow: "visible" // Explicitly set overflow to visible
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
