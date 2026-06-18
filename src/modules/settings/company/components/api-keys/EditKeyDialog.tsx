import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiKey } from "@/modules/settings/company/types";
import { Modal, Spinner } from "@/modules/settings/shared/components";
import { keyFormSchema, DEFAULT_FORM, type KeyFormState } from "../../schemas/apiKeySchema";
import { KeyFormFields, DialogForm } from "./KeyFormFields";
import { cancelBtnClass, saveBtnClass } from "./styles";

type Props = {
  editingKey: ApiKey | null;
  onClose: () => void;
  onSubmit: (data: KeyFormState) => Promise<void>;
};

const EditKeyDialog: React.FC<Props> = ({ editingKey, onClose, onSubmit }) => {
  const { t } = useTranslation("dashboard");
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<KeyFormState>({
    resolver: zodResolver(keyFormSchema),
    defaultValues: DEFAULT_FORM,
  });

  useEffect(() => {
    if (!editingKey) return;
    const existingIps = editingKey.ipWhitelist ?? [];
    reset({
      name:        editingKey.name,
      serviceName: editingKey.serviceName,
      scopes:      editingKey.scopes,
      rateLimit:   editingKey.rateLimit,
      expiresAt:   editingKey.expiresAt ? editingKey.expiresAt.slice(0, 10) : "",
      ipMode:      existingIps.length === 0 ? "all" : "custom",
      ipList:      existingIps.join(", "),
    });
  }, [editingKey, reset]);

  return (
    <Modal open={!!editingKey} onClose={onClose} maxWidth="sm">
      <div className="px-6 pt-5 pb-3">
        <span className="text-[1rem] font-bold text-gray-900">
          {t("pages.settings.api_keys.edit_title")}
        </span>
      </div>
      <hr className="border-gray-200" />
      <DialogForm fields={<KeyFormFields control={control} errors={errors} />}>
        <button type="button" onClick={onClose} className={cancelBtnClass}>
          {t("pages.settings.api_keys.actions.cancel")}
        </button>
        <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className={saveBtnClass}>
          {isSubmitting
            ? <Spinner size={14} className="border-white/40 border-t-white" />
            : t("pages.settings.api_keys.actions.save")}
        </button>
      </DialogForm>
    </Modal>
  );
};

export default EditKeyDialog;
