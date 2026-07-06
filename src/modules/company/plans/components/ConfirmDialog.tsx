import React from "react";
import { useTranslation } from "react-i18next";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!loading ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl"
      >
        <h2 className="px-6 pt-5 text-[1.05rem] font-bold text-gray-900">{title}</h2>
        <p className="px-6 py-4 text-sm text-gray-600">{body}</p>
        <div className="flex justify-end gap-2 px-6 pb-5 pt-1">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("pages.subscription.dialog.keep", "Keep Current")}
          </Button>
          <Button
            variant="default"
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
