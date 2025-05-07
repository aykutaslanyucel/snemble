
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomGradientInputProps {
  customGradient: string;
  setCustomGradient: (gradient: string) => void;
  handleApplyCustomGradient: () => void;
}

export function CustomGradientInput({ 
  customGradient, 
  setCustomGradient, 
  handleApplyCustomGradient 
}: CustomGradientInputProps) {
  // This component is kept for backward compatibility but is no longer actively used
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="custom-gradient">Custom CSS Gradient</Label>
        <Input 
          id="custom-gradient"
          value={customGradient} 
          onChange={(e) => setCustomGradient(e.target.value)}
          placeholder="linear-gradient(...)"
        />
      </div>
      <Button onClick={handleApplyCustomGradient} variant="outline" className="mb-px">
        Apply
      </Button>
    </div>
  );
}
