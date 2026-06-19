import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/modules/settings/shared/components";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { keyFormSchema, DEFAULT_FORM, type KeyFormState } from "../../schemas/apiKeySchema";
import { KeyFormFields, DialogForm } from "./KeyFormFields";
import { cancelBtnClass, saveBtnClass } from "./styles";

type Props = {
  open: boolean;
  creating: boolean;
  onClose: () => void;
  onSubmit: (data: KeyFormState) => Promise<void>;
};

const CreateKeyDialog: React.FC<Props> = ({ open, creating, onClose, onSubmit }) => {
  const { t } = useTranslation("dashboard");
  const { control, handleSubmit, reset, formState: { errors } } = useForm<KeyFormState>({
    resolver: zodResolver(keyFormSchema),
    defaultValues: DEFAULT_FORM,
  });

  useEffect(() => {
    if (!open) reset(DEFAULT_FORM);
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-sm w-full rounded-2xl overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3">
          <span className="text-[1rem] font-bold text-gray-900">
            {t("pages.settings.api_keys.create_title")}
          </span>
        </div>
        <hr className="border-gray-200" />
        <DialogForm fields={<KeyFormFields control={control} errors={errors} />}>
          <button type="button" onClick={onClose} className={cancelBtnClass}>
            {t("pages.settings.api_keys.actions.cancel")}
          </button>
          <button type="button" onClick={handleSubmit(onSubmit)} disabled={creating} className={saveBtnClass}>
            {creating
              ? <Spinner size={14} className="border-white/40 border-t-white" />
              : t("pages.settings.api_keys.actions.create")}
          </button>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateKeyDialog;
