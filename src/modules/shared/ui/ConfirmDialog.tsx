import React from "react";
import { Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button, type ButtonProps } from "@/modules/shared/ui/shadcn/button";

type ConfirmDialogTone = "destructive" | "primary";

const TONE_STYLES: Record<ConfirmDialogTone, {
  iconBg: string;
  iconColor: string;
  confirmVariant: ButtonProps["variant"];
}> = {
  destructive: {
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",
    confirmVariant: "destructive",
  },
  primary: {
    iconBg: "#F0FDFA",
    iconColor: "#0D9488",
    confirmVariant: "default",
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Icon shown in the header roundel and on the confirm button. Defaults to Trash2. */
  icon?: LucideIcon;
  /** Disables both buttons and the close-on-backdrop-click behavior while an action is in flight. */
  loading?: boolean;
  /** Visual tone — destructive (red) for delete/withdraw actions, primary (teal) for neutral/positive ones like reactivate. */
  tone?: ConfirmDialogTone;
  /** Extra content rendered below the description (e.g. an impact/warning callout). */
  children?: React.ReactNode;
  className?: string;
}

/** Shared confirmation modal for destructive/irreversible actions (delete, withdraw, reactivate, …) across the app. */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  icon: Icon = Trash2,
  loading = false,
  tone = "destructive",
  children,
  className,
}: ConfirmDialogProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onCancel(); }}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-110 gap-0 overflow-hidden rounded-[22px] border border-gray-100 p-0 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] duration-200",
          className,
        )}
      >
        <div className="flex flex-col items-center px-8 pt-9 pb-7 text-center">
          <div
            className="mb-5 flex size-16 items-center justify-center rounded-full"
            style={{ backgroundColor: toneStyle.iconBg }}
          >
            <Icon size={24} color={toneStyle.iconColor} strokeWidth={2.25} />
          </div>

          <p className="mb-1.5 text-lg font-bold tracking-tight text-gray-900">
            {title}
          </p>

          {description && (
            <p className="text-[13px] font-medium leading-relaxed text-gray-500">
              {description}
            </p>
          )}

          {children}
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="h-12 flex-1 rounded-xl border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={toneStyle.confirmVariant}
              onClick={onConfirm}
              loading={loading}
              className="h-12 flex-1 rounded-xl font-bold"
            >
              <Icon size={17} />
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
