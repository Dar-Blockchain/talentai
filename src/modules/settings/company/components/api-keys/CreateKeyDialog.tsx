import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, Dialog, DialogTitle, Divider } from "@mui/material";
import { keyFormSchema, DEFAULT_FORM, type KeyFormState } from "../../schemas/apiKeySchema";
import { KeyFormFields, DialogForm } from "./KeyFormFields";
import { cancelBtnSx, saveBtnSx } from "./styles";

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>
        {t("pages.settings.api_keys.create_title")}
      </DialogTitle>
      <Divider />
      <DialogForm fields={<KeyFormFields control={control} errors={errors} />}>
        <Button onClick={onClose} size="small" sx={cancelBtnSx}>
          {t("pages.settings.api_keys.actions.cancel")}
        </Button>
        <Button onClick={handleSubmit(onSubmit)} size="small" disabled={creating} sx={saveBtnSx}>
          {creating
            ? <CircularProgress size={14} sx={{ color: "#fff" }} />
            : t("pages.settings.api_keys.actions.create")}
        </Button>
      </DialogForm>
    </Dialog>
  );
};

export default CreateKeyDialog;
