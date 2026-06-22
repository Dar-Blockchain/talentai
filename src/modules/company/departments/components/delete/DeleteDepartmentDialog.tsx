import React, { useMemo } from "react";
import { useTranslation }  from "react-i18next";
import { Trash2, AlertTriangle, Users } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button }          from "@/modules/shared/ui/shadcn/button";
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
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>{t("pages.departments.modals.delete.title")}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("pages.departments.modals.delete.subtitle")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {displayError && (
            <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-destructive">{displayError}</p>
            </div>
          )}

          <p className="text-[13.5px] text-gray-600 leading-relaxed">
            {t("pages.departments.modals.delete.confirm_lead")}{" "}
            <strong className="text-gray-900">{departmentName}</strong>
            {t("pages.departments.modals.delete.confirm_trail")}
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2.5">
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            {t("pages.departments.modals.delete.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={deleting}>
            <Trash2 className="size-4" />
            {t("pages.departments.modals.delete.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDepartmentDialog;
