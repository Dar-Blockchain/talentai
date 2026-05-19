import { DialogActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  mode: "add" | "edit";
  disabled: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ModalActions = ({ mode, disabled, onClose, onSave }: Props) => {
  const { t } = useTranslation("posts");
  const confirmKey =
    mode === "edit" ? "create.post_form.skill_modal.btn_edit" : "create.post_form.skill_modal.btn_add";

  return (
    <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <Button
        variant="outlined"
        onClick={onClose}
        sx={{
          border: "none",
          background: "none",
          color: "rgba(133, 169, 227, 1)",
          "&:hover": { background: "none", color: "rgba(133, 169, 227, 0.8)" },
        }}
      >
        {t("create.post_form.skill_modal.cancel")}
      </Button>

      <Button
        variant="outlined"
        onClick={onSave}
        disabled={disabled}
        sx={{
          width: 130,
          borderColor: "rgba(77, 217, 163, 1)",
          color: "rgba(77, 217, 163, 1)",
          fontWeight: 600,
          borderRadius: "38px",
          py: 1.5,
          height: "42px",
          textTransform: "none",
          fontSize: "0.875rem",
          "&:hover": { backgroundColor: "rgba(77, 217, 163, 0.08)" },
        }}
      >
        {t(confirmKey)}
      </Button>
    </DialogActions>
  );
};

export default ModalActions;
