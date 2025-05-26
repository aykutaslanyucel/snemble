
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GradientAnimationType } from "@/types/TeamMemberTypes";

interface AnimationToggleProps {
  animate: boolean;
  animationType?: GradientAnimationType;
  onToggle: (checked: boolean) => void;
  onAnimationTypeChange?: (type: GradientAnimationType) => void;
  disabled: boolean;
}

export function AnimationToggle({ 
  animate, 
  animationType = "gentle",
  onToggle, 
  onAnimationTypeChange,
  disabled 
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
          onCheckedChange={onToggle}
          disabled={disabled}
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
            disabled={disabled}
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
