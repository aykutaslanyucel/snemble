
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AnimationToggleProps {
  animate: boolean;
  onToggle: (checked: boolean) => void;
  disabled: boolean;
}

export function AnimationToggle({ animate, onToggle, disabled }: AnimationToggleProps) {
  return (
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
  );
}
