import React, { useEffect, useState, useMemo } from "react";
import { useTranslation }  from "react-i18next";
import { Pencil }          from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button }          from "@/modules/shared/ui/shadcn/button";
import DeptFormFields      from "../shared/DeptFormFields";
import { Department }      from "../../types";
import { resolveDepartmentApiMessage } from "../../utils/departmentI18n";

export interface EditDepartmentModalProps {
  open:        boolean;
  department:  Department | null;
  onClose:     () => void;
  onSave:      (name: string, description: string) => void;
  saving:      boolean;
  error:       string | null;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  open, department, onClose, onSave, saving, error,
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
    if (department) {
      setName(department.name);
      setDescription(String(department.description ?? ""));
      setNameError("");
    }
  }, [department]);

  const handleSave = () => {
    if (!name.trim()) { setNameError(t("pages.departments.form.name_required")); return; }
    onSave(name.trim(), description.trim());
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pencil className="size-4 text-primary" />
            </div>
            <DialogTitle>{t("pages.departments.modals.edit.title")}</DialogTitle>
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
            {t("pages.departments.modals.edit.cancel")}
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>
            {t("pages.departments.modals.edit.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentModal;
