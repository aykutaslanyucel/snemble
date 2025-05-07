
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

  // Calculate badge position styles with fixed position
  const getBadgePosition = () => {
    if (!badge || !badgePosition) return null;
    
    const positions = {
      "top-left": { top: "-40px", left: "-30px" },
      "top-right": { top: "-40px", right: "-30px" },
      "bottom-left": { bottom: "-40px", left: "-30px" },
      "bottom-right": { bottom: "-40px", right: "-30px" }
    };
    
    const positionStyle = positions[badgePosition as keyof typeof positions] || positions["top-right"];
    
    return (
      <div 
        className={`${sizeClass} absolute z-[100]`}
        style={positionStyle}
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
