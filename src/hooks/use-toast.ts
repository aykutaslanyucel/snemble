
import { toast } from "sonner";
import { useCallback, type ReactNode } from "react";

// Define the toast variant types
export type ToastVariant = "default" | "destructive" | "success" | "warning";

// Define toast props interface
export interface ToastProps {
  title?: string;
  description?: string | ReactNode;
  variant?: ToastVariant;
  action?: ReactNode;
}

// Custom hook to provide typed toast functionality
export function useToast() {
  const showToast = useCallback(
    ({ title, description, variant = "default", action }: ToastProps) => {
      switch (variant) {
        case "destructive":
          toast.error(title, { description, action });
          break;
        case "success":
          toast.success(title, { description, action });
          break;
        case "warning":
          toast.warning(title, { description, action });
          break;
        default:
          toast(title, { description, action });
      }
    },
    []
  );

  return { toast: showToast };
}

// Re-export toast from sonner for direct use
export { toast };
