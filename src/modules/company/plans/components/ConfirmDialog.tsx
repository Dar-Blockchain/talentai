import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  confirmColor: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, body, confirmLabel, confirmColor,
  loading = false, onClose, onConfirm,
}) => {
  const { t } = useTranslation("dashboard");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-1300 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={!loading ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-[20px] bg-white p-6 shadow-2xl duration-150"
      >
        <div
          className="mb-4 flex size-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${confirmColor}15` }}
        >
          <AlertTriangle size={22} style={{ color: confirmColor }} />
        </div>

        <h2 className="text-[1.1rem] font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{body}</p>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            {t("pages.subscription.dialog.keep", "Keep Current")}
          </Button>
          <Button
            variant="default"
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
            style={{ backgroundColor: confirmColor }}
          >
            {loading ? t("pages.subscription.card.processing") : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
