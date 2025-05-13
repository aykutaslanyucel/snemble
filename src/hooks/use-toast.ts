
import { toast as sonnerToast } from "sonner";
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

// Define toast object interface for compatibility with Radix UI toast
export interface Toast extends ToastProps {
  id: string;
}

// Custom hook to provide typed toast functionality
export function useToast() {
  // Mock toasts array for compatibility with Radix UI toaster
  const toasts: Toast[] = [];
  
  const showToast = useCallback(
    ({ title, description, variant = "default", action }: ToastProps) => {
      switch (variant) {
        case "destructive":
          sonnerToast.error(title, { description, action });
          break;
        case "success":
          sonnerToast.success(title, { description, action });
          break;
        case "warning":
          sonnerToast.warning(title, { description, action });
          break;
        default:
          sonnerToast(title, { description, action });
      }
    },
    []
  );

  return { toast: showToast, toasts };
}

// Re-export toast from sonner for direct use
export { sonnerToast as toast };
