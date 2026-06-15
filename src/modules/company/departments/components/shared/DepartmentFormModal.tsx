import React, { useEffect, useState, useMemo } from "react";
import { useTranslation }  from "react-i18next";
import { Building2, Plus, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button }          from "@/modules/shared/ui/shadcn/button";
import DeptFormFields      from "./DeptFormFields";
import { resolveDepartmentApiMessage } from "../../utils/departmentI18n";
import type { Department } from "../../types";

export interface DepartmentFormModalProps {
  open:        boolean;
  mode:        "create" | "edit";
  department?: Department | null;
  onClose:     () => void;
  onSave:      (name: string, description: string) => void;
  saving:      boolean;
  error:       string | null;
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open, mode, department, onClose, onSave, saving, error,
}) => {
  const { t } = useTranslation("dashboard");
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [nameError,   setNameError]   = useState("");

  const displayApiError = useMemo(
    () => resolveDepartmentApiMessage(error, t),
    [error, t],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      setName(""); setDescription(""); setNameError("");
    } else if (department) {
      setName(department.name);
      setDescription(String(department.description ?? ""));
      setNameError("");
    }
  }, [open, mode, department]);

  const handleSave = () => {
    if (!name.trim()) { setNameError(t("pages.departments.form.name_required")); return; }
    onSave(name.trim(), description.trim());
  };

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {isCreate
                ? <Building2 className="size-4 text-primary" />
                : <Pencil   className="size-4 text-primary" />}
            </div>
            <DialogTitle>
              {t(isCreate ? "pages.departments.modals.create.title" : "pages.departments.modals.edit.title")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <DeptFormFields
          name={name} description={description} nameError={nameError}
          onNameChange={v => { setName(v); if (nameError) setNameError(""); }}
          onDescChange={setDescription}
          apiError={displayApiError}
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t(isCreate ? "pages.departments.modals.create.cancel" : "pages.departments.modals.edit.cancel")}
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>
            {isCreate && <Plus className="size-4" />}
            {t(isCreate ? "pages.departments.modals.create.submit" : "pages.departments.modals.edit.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentFormModal;
