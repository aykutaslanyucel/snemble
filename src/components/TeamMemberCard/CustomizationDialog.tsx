
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CustomizationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  premiumCustomization: Record<string, string>;
  onUpdate: (field: string, value: Record<string, string>) => void;
}

export function CustomizationDialog({ 
  isOpen, 
  setIsOpen, 
  premiumCustomization, 
  onUpdate 
}: CustomizationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Premium Customization</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Card Color</label>
            <div className="grid grid-cols-5 gap-2">
              {["bg-purple-100", "bg-blue-100", "bg-green-100", "bg-pink-100", "bg-yellow-100"].map(color => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full",
                    color,
                    premiumCustomization.color === color && "ring-2 ring-offset-2 ring-primary"
                  )}
                  onClick={() => onUpdate("customization", {
                    ...premiumCustomization,
                    color
                  })}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Hat Style</label>
            <div className="flex gap-2">
              {["🎩", "👑", "🎓", "⛑️", "🪖"].map(hat => (
                <button
                  key={hat}
                  className={cn(
                    "p-2 rounded hover:bg-secondary",
                    premiumCustomization.hat === hat && "bg-secondary"
                  )}
                  onClick={() => onUpdate("customization", {
                    ...premiumCustomization,
                    hat
                  })}
                >
                  {hat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status Emoji</label>
            <div className="flex gap-2">
              {["😊", "🚀", "💪", "✨", "🌟"].map(emoji => (
                <button
                  key={emoji}
                  className={cn(
                    "p-2 rounded hover:bg-secondary",
                    premiumCustomization.emoji === emoji && "bg-secondary"
                  )}
                  onClick={() => onUpdate("customization", {
                    ...premiumCustomization,
                    emoji
                  })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
