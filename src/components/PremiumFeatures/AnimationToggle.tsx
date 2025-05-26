
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GradientAnimationType } from "@/types/TeamMemberTypes";

interface AnimationToggleProps {
  animate: boolean;
  animationType?: GradientAnimationType;
  onAnimationToggle: (checked: boolean) => void;
  onAnimationTypeChange?: (type: GradientAnimationType) => void;
}

export function AnimationToggle({ 
  animate, 
  animationType = "gentle",
  onAnimationToggle, 
  onAnimationTypeChange
}: AnimationToggleProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="animate-toggle" className="cursor-pointer">
          Animate gradient
        </Label>
        <Switch 
          id="animate-toggle"
          checked={animate}
          onCheckedChange={onAnimationToggle}
        />
      </div>
      
      {animate && onAnimationTypeChange && (
        <div className="pt-2">
          <Label htmlFor="animation-type" className="text-sm mb-1 block">
            Animation Style
          </Label>
          <Select 
            value={animationType} 
            onValueChange={(value) => onAnimationTypeChange(value as GradientAnimationType)}
          >
            <SelectTrigger id="animation-type" className="w-full">
              <SelectValue placeholder="Select animation style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gentle">Gentle</SelectItem>
              <SelectItem value="smooth">Smooth</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
