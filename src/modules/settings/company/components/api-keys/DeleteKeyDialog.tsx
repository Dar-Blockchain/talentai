import React from "react";
import { useTranslation } from "react-i18next";
import type { ApiKey } from "@/modules/settings/company/types";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { cancelBtnClass, deleteBtnClass } from "./styles";

type Props = {
  target: ApiKey | null;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteKeyDialog: React.FC<Props> = ({ target, onClose, onConfirm }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-xs w-full rounded-2xl overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3">
          <span className="text-[1rem] font-bold text-gray-900">
            {t("pages.settings.api_keys.delete_title")}
          </span>
        </div>
        <hr className="border-gray-200" />
        <div className="px-6 py-5">
          <p className="text-[0.88rem] text-gray-700">
            {t("pages.settings.api_keys.delete_confirm", { name: target?.name })}
          </p>
          <p className="text-[0.78rem] text-gray-400 mt-2">
            {t("pages.settings.api_keys.delete_warning")}
          </p>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-end gap-2 px-6 py-4">
          <button type="button" onClick={onClose} className={cancelBtnClass}>
            {t("pages.settings.api_keys.actions.cancel")}
          </button>
          <button type="button" onClick={onConfirm} className={deleteBtnClass}>
            {t("pages.settings.api_keys.actions.delete")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteKeyDialog;
