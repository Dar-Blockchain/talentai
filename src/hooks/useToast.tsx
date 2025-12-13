import { createContext, useContext, useState, ReactNode } from "react";

type ToastOptions = {
  message: string;
  severity?: "success" | "error" | "warning" | "info";
};

type ToastContextType = {
  showToast: (options: ToastOptions) => void;
  closeToast: () => void;
  open: boolean;
  toastOptions: ToastOptions;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({
    message: "",
    severity: "info",
  });

  const showToast = (options: ToastOptions) => {
    setToastOptions(options);
    setOpen(true);
  };

  const closeToast = () => {
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, closeToast, open, toastOptions }}>
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
