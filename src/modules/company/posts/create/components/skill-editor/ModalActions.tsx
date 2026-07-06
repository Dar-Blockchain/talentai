import { DialogActions } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
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
        variant="ghost"
        onClick={onClose}
        style={{ color: "rgba(133, 169, 227, 1)" }}
      >
        {t("create.post_form.skill_modal.cancel")}
      </Button>

      <Button
        variant="outline"
        onClick={onSave}
        disabled={disabled}
        className="h-[42px] w-[130px] rounded-[38px] text-sm font-semibold"
        style={{ borderColor: "rgba(77, 217, 163, 1)", color: "rgba(77, 217, 163, 1)" }}
      >
        {t(confirmKey)}
      </Button>
    </DialogActions>
  );
};

export default ModalActions;
