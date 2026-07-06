import React, { memo, useCallback } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface DeleteMemberDialogProps {
  open: boolean;
  memberName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteMemberDialog: React.FC<DeleteMemberDialogProps> = ({ open, memberName, onCancel, onConfirm }) => {
  const { t } = useTranslation("dashboard");
  const m = useCallback((key: string) => t(`pages.employees.modals.delete.${key}`), [t]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent showCloseButton={false} className="max-w-xs gap-0 overflow-hidden rounded-[20px] p-0 shadow-[0_24px_60px_rgba(0,0,0,0.14)]">

        {/* Danger header */}
        <div className="flex flex-col items-center gap-1.5 border-b border-red-100 bg-red-50 px-6 pt-7 pb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl border-[1.5px] border-red-200 bg-red-100 shadow-[0_4px_14px_rgba(239,68,68,0.15)]">
            <Trash2 className="size-6 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-[1.05rem] font-extrabold leading-[1.3] text-slate-900">{m("title")}</p>
            <p className="mt-1 text-[0.775rem] text-slate-400">{m("subtitle")}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-center text-sm leading-relaxed text-slate-600">
            {m("body_pre")}{" "}
            <span className="font-bold text-slate-900">{memberName}</span>
            {" "}{m("body_post")}
          </p>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-200 bg-amber-50 px-[14px] py-[10px]">
            <TriangleAlert className="mt-px size-[15px] shrink-0 text-yellow-600" />
            <p className="text-[0.75rem] leading-relaxed text-amber-800">{m("warning")}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl py-5 font-semibold text-slate-500 hover:bg-slate-100"
            onClick={onCancel}
          >
            {m("cancel")}
          </Button>
          <Button
            className="flex-1 rounded-xl bg-red-500 py-5 font-bold text-white shadow-[0_4px_14px_rgba(239,68,68,0.35)] hover:bg-red-600 hover:shadow-[0_6px_20px_rgba(239,68,68,0.45)]"
            onClick={onConfirm}
          >
            {m("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DeleteMemberDialog);
