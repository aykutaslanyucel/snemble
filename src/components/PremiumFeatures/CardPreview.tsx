
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamMember } from "@/types/TeamMemberTypes";
import "@/styles/animations.css";

interface CardPreviewProps {
  teamMember: TeamMember;
  previewStyle: {
    background: string;
  };
  animate: boolean;
}

export function CardPreview({ teamMember, previewStyle, animate }: CardPreviewProps) {
  return (
    <Card 
      className={`border ${animate ? "animate-gradient" : ""}`}
      style={previewStyle}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-base">{teamMember.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm">Card preview</p>
      </CardContent>
    </Card>
  );
}
