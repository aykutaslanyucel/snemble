
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamMember, GradientAnimationType } from "@/types/TeamMemberTypes";
import "@/styles/animations.css";

interface CardPreviewProps {
  member: TeamMember;
}

export function CardPreview({ member }: CardPreviewProps) {
  const customization = member.customization || {};
  
  // Determine the background style
  const getBackgroundStyle = () => {
    if (customization.backgroundImage) {
      return {
        background: `url(${customization.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    if (customization.gradient) {
      return {
        background: customization.gradient,
        backgroundSize: "200% 200%",
      };
    }
    
    if (customization.color) {
      return {
        backgroundColor: customization.color,
      };
    }
    
    return {
      backgroundColor: '#f8fafc',
    };
  };

  // Determine the animation class based on the type
  const animationClass = customization.animate && customization.gradient ? 
    (customization.animationType && customization.animationType !== "none" ? 
      `animate-gradient-${customization.animationType}` : 
      "animate-gradient-gentle") : 
    "";

  // Define size classes for badges
  const badgeSizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-28 h-28"
  };
  
  // Get badge size class
  const sizeClass = badgeSizeClasses[customization.badgeSize as keyof typeof badgeSizeClasses] || badgeSizeClasses.medium;

  // Calculate badge position styles with size-specific offsets
  const getBadgePosition = () => {
    if (!customization.badge || !customization.badgePosition) return null;
    
    // More compact offsets to reduce spacing needs
    const getPositionStyles = () => {
      const offsets = {
        small: { top: "-8px", right: "-8px", bottom: "-8px", left: "-8px" },
        medium: { top: "-10px", right: "-10px", bottom: "-10px", left: "-10px" },
        large: { top: "-12px", right: "-12px", bottom: "-12px", left: "-12px" }
      };
      
      const offsetsBySize = offsets[customization.badgeSize as keyof typeof offsets] || offsets.medium;
      
      // Position mapping - only allow top-right and bottom-right
      const positions = {
        "top-right": { top: offsetsBySize.top, right: offsetsBySize.right },
        "bottom-right": { bottom: offsetsBySize.bottom, right: offsetsBySize.right }
      };
      
      return positions[customization.badgePosition as keyof typeof positions] || positions["top-right"];
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
          src={customization.badge} 
          alt="Badge" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  };

  return (
    <div className="w-full py-3 px-6 relative">
      {/* Render the badge separately outside the card */}
      {customization.badge && getBadgePosition()}
      
      <Card 
        className={`border relative ${animationClass}`}
        style={{
          ...getBackgroundStyle(),
          position: "relative",
          zIndex: 1
        }}
      >
        <CardHeader className="p-4">
          <CardTitle className="text-base">{member.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-gray-600">{member.position}</p>
          <p className="text-xs text-gray-500 mt-2">Preview</p>
        </CardContent>
      </Card>
    </div>
  );
}
