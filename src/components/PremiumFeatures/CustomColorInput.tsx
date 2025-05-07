
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomColorInputProps {
  customColor: string;
  setCustomColor: (color: string) => void;
  handleApplyCustomColor: () => void;
}

export function CustomColorInput({ customColor, setCustomColor, handleApplyCustomColor }: CustomColorInputProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="custom-color">Custom Color (HEX)</Label>
        <Input 
          id="custom-color"
          value={customColor} 
          onChange={(e) => setCustomColor(e.target.value)}
          placeholder="#RRGGBB"
        />
      </div>
      <Button onClick={handleApplyCustomColor} variant="outline" className="mb-px">
        Apply
      </Button>
    </div>
  );
}
