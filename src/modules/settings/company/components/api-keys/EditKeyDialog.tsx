import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, Dialog, DialogTitle, Divider } from "@mui/material";
import type { ApiKey } from "@/modules/settings/company/types";
import { keyFormSchema, DEFAULT_FORM, type KeyFormState } from "../../schemas/apiKeySchema";
import { KeyFormFields, DialogForm } from "./KeyFormFields";
import { cancelBtnSx, saveBtnSx } from "./styles";

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
    <Dialog open={!!editingKey} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>
        {t("pages.settings.api_keys.edit_title")}
      </DialogTitle>
      <Divider />
      <DialogForm fields={<KeyFormFields control={control} errors={errors} />}>
        <Button onClick={onClose} size="small" sx={cancelBtnSx}>
          {t("pages.settings.api_keys.actions.cancel")}
        </Button>
        <Button onClick={handleSubmit(onSubmit)} size="small" disabled={isSubmitting} sx={saveBtnSx}>
          {isSubmitting
            ? <CircularProgress size={14} sx={{ color: "#fff" }} />
            : t("pages.settings.api_keys.actions.save")}
        </Button>
      </DialogForm>
    </Dialog>
  );
};

export default EditKeyDialog;
