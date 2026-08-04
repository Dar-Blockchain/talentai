import React, { useMemo } from "react";
import { useTranslation }  from "react-i18next";
import { AlertTriangle, Users } from "lucide-react";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";
import { resolveDepartmentApiMessage } from "../../utils/departmentI18n";

export interface DeleteDepartmentDialogProps {
  open:           boolean;
  departmentName: string;
  memberCount?:   number;
  onClose:        () => void;
  onConfirm:      () => void;
  deleting:       boolean;
  error:          string | null;
}

const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  open, departmentName, memberCount, onClose, onConfirm, deleting, error,
}) => {
  const { t } = useTranslation("dashboard");
  const displayError = useMemo(
    () => resolveDepartmentApiMessage(error, t),
    [error, t],
  );

  return (
    <ConfirmDialog
      open={open}
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={deleting}
      title={t("pages.departments.modals.delete.title")}
      description={
        <>
          {t("pages.departments.modals.delete.confirm_lead")}{" "}
          <strong className="text-gray-900">{departmentName}</strong>
          {t("pages.departments.modals.delete.confirm_trail")}
        </>
      }
      cancelLabel={t("pages.departments.modals.delete.cancel")}
      confirmLabel={t("pages.departments.modals.delete.confirm")}
    >
      {displayError && (
        <div className="mt-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-left">
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2.5 text-left">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
          <p className="text-xs font-bold text-amber-800">
            {t("pages.departments.modals.delete.impact_title")}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Users className="size-3.5 text-amber-600 mt-px shrink-0" />
          <p className="text-[12.5px] text-amber-900 leading-relaxed">
            {memberCount != null && memberCount > 0
              ? t("pages.departments.modals.delete.impact_with_count", { count: memberCount })
              : t("pages.departments.modals.delete.impact_generic")}
          </p>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default DeleteDepartmentDialog;
