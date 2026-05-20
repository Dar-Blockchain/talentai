import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography,
} from "@mui/material";
import type { ApiKey } from "@/modules/settings/company/types";
import { cancelBtnSx, deleteBtnSx } from "./styles";

type Props = {
  target: ApiKey | null;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteKeyDialog: React.FC<Props> = ({ target, onClose, onConfirm }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
      <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>
        {t("pages.settings.api_keys.delete_title")}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography sx={{ fontSize: "0.88rem", color: "#374151" }}>
          {t("pages.settings.api_keys.delete_confirm", { name: target?.name })}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.75 }}>
          {t("pages.settings.api_keys.delete_warning")}
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} size="small" sx={cancelBtnSx}>
          {t("pages.settings.api_keys.actions.cancel")}
        </Button>
        <Button onClick={onConfirm} size="small" sx={deleteBtnSx}>
          {t("pages.settings.api_keys.actions.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteKeyDialog;
