import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: "xs" | "sm";
  children: React.ReactNode;
}

const maxWidthClass = { xs: "max-w-xs", sm: "max-w-sm" } as const;

const Modal: React.FC<ModalProps> = ({ open, onClose, maxWidth = "sm", children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl w-full shadow-xl ${maxWidthClass[maxWidth]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
