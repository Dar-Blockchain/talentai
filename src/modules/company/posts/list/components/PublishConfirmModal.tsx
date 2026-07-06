import React from "react";
import { useTranslation } from "react-i18next";
import { Rocket, Pencil, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface PublishConfirmModalProps {
  open: boolean;
  publishing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
}

const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  open,
  publishing,
  onClose,
  onConfirm,
  onEdit,
}) => {
  const { t } = useTranslation("posts");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xs w-full rounded-2xl overflow-hidden p-0">
        <div className="h-1 bg-amber-500" />

        <div className="p-5">
          <div className="flex items-center justify-center size-[52px] rounded-2xl bg-amber-50 border-[1.5px] border-amber-200 mb-4">
            <Rocket className="size-6 text-amber-600" />
          </div>

          <p className="text-[16px] font-extrabold text-gray-900 mb-1.5">
            {t("detail.publish_modal.title")}
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
            {t("detail.publish_modal.body_pre")}{" "}
            <strong className="text-gray-900">
              {t("detail.publish_modal.body_highlight")}
            </strong>{" "}
            {t("detail.publish_modal.body_post")}
          </p>

          <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-red-50 border border-red-200 mb-6">
            <AlertTriangle className="size-4 text-red-600 shrink-0 mt-px" />
            <p className="text-[12px] text-red-800 leading-snug">
              {t("detail.publish_modal.warning")}
            </p>
          </div>

          {/* Edit / Publish */}
          <div className="flex gap-2">
            <Button disabled={publishing} onClick={onEdit} className="flex-1">
              <Pencil className="size-4" />
              {t("detail.publish_modal.edit_post", "Edit Post")}
            </Button>
            <Button
              variant="warning"
              className="flex-1"
              disabled={publishing}
              loading={publishing}
              onClick={onConfirm}
            >
              {!publishing && <Rocket className="size-4" />}
              {publishing
                ? t("detail.publish_modal.publishing")
                : t("detail.publish_modal.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublishConfirmModal;
