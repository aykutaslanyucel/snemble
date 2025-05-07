
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

  // Calculate badge position styles with reasonable pixel values based on badge size
  const getBadgePosition = () => {
    if (!badge || !badgePosition) return null;
    
    // Adjust offset based on badge size
    const getPositionStyles = () => {
      // Base offsets for different badge sizes
      const offsets = {
        small: { top: "-10px", right: "-10px", bottom: "-10px", left: "-10px" },
        medium: { top: "-15px", right: "-15px", bottom: "-15px", left: "-15px" },
        large: { top: "-20px", right: "-20px", bottom: "-20px", left: "-20px" }
      };
      
      const offsetsBySize = offsets[badgeSize as keyof typeof offsets] || offsets.medium;
      
      // Position mapping
      const positions = {
        "top-left": { top: offsetsBySize.top, left: offsetsBySize.left },
        "top-right": { top: offsetsBySize.top, right: offsetsBySize.right },
        "bottom-left": { bottom: offsetsBySize.bottom, left: offsetsBySize.left },
        "bottom-right": { bottom: offsetsBySize.bottom, right: offsetsBySize.right }
      };
      
      return positions[badgePosition as keyof typeof positions] || positions["top-right"];
    };
    
    const positionStyle = getPositionStyles();
    
    return (
      <div 
        className={`${sizeClass} absolute badge-element`}
        style={{
          ...positionStyle,
          zIndex: 5,
          pointerEvents: "none" // Make badge non-interactive in preview
        }}
      >
        <img 
          src={badge} 
          alt="Badge" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  };

  return (
    <div className="w-full py-10 px-6 relative">
      {/* Render the badge separately outside the card */}
      {badge && getBadgePosition()}
      
      <Card 
        className={`border relative ${animationClass}`}
        style={{
          ...previewStyle,
          backgroundSize: "200% 200%",
          position: "relative",
          zIndex: 1
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
