import { createContext, useCallback, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { playNotificationSound, NotificationType } from "@/utils/notificationSounds";

type ToastOptions = {
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  playSound?: boolean; // Option to disable sound for a specific notification
};

type ToastContextType = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = useCallback((options: ToastOptions) => {
    const { message, severity = "info", playSound } = options;

    if (playSound !== false) {
      playNotificationSound(severity as NotificationType);
    }

    const trimmed = message.length > 100 ? message.slice(0, 100).trimEnd() + "…" : message;
    switch (severity) {
      case "success": toast.success(trimmed); break;
      case "error":   toast.error(trimmed);   break;
      case "warning": toast.warning(trimmed); break;
      default:        toast.info(trimmed);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
