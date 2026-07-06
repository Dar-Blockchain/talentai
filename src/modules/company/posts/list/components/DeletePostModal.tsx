import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface DeletePostModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({ open, onClose, onDelete, isDeleting }) => {
  const { t } = useTranslation("posts");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xs w-full rounded-2xl overflow-hidden p-0">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-11 rounded-xl bg-red-50 border-[1.5px] border-red-200 shrink-0">
              <AlertTriangle className="size-5 text-red-600" />
            </div>
            <p className="text-[16px] font-extrabold text-gray-900">
              {t("delete_modal.title")}
            </p>
          </div>

          <p className="text-[13px] text-gray-500 leading-relaxed mb-2">
            {t("delete_modal.body")}
          </p>
          <p className="text-[13px] font-semibold text-gray-600 mb-6">
            {t("delete_modal.warning")}
          </p>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" disabled={isDeleting} onClick={onClose}>
              {t("delete_modal.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 shadow-[0_4px_14px_rgba(224,62,92,0.25)]"
              loading={isDeleting}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              {t("delete_modal.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePostModal;
