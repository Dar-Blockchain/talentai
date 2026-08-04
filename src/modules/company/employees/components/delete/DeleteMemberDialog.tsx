import React, { memo, useCallback } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";

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
    <ConfirmDialog
      open={open}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={m("title")}
      description={
        <>
          {m("body_pre")}{" "}
          <span className="font-bold text-gray-900">{memberName}</span>
          {" "}{m("body_post")}
        </>
      }
      cancelLabel={m("cancel")}
      confirmLabel={m("confirm")}
    >
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-200 bg-amber-50 px-[14px] py-[10px] text-left">
        <TriangleAlert className="mt-px size-[15px] shrink-0 text-yellow-600" />
        <p className="text-[0.75rem] leading-relaxed text-amber-800">{m("warning")}</p>
      </div>
    </ConfirmDialog>
  );
};

export default memo(DeleteMemberDialog);
