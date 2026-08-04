import { DialogFooter } from "@/modules/shared/ui/shadcn/dialog";
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
    <DialogFooter className="border-t border-[rgba(227,229,233,1)] px-6 py-4">
      <Button
        variant="ghost"
        onClick={onClose}
        className="h-[42px] w-[110px] rounded-full text-muted-foreground hover:text-foreground"
      >
        {t("create.post_form.skill_modal.cancel")}
      </Button>

      <Button
        variant="default"
        onClick={onSave}
        disabled={disabled}
        className="h-[42px] w-[130px] rounded-full text-sm font-semibold"
      >
        {t(confirmKey)}
      </Button>
    </DialogFooter>
  );
};

export default ModalActions;
