import { DialogHeader, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  skillType: "hard" | "soft";
  mode: "add" | "edit";
}

const ModalHeader = ({ skillType, mode }: Props) => {
  const { t } = useTranslation("posts");

  const titleKey =
    skillType === "hard"
      ? mode === "edit"
        ? "create.post_form.skill_modal.title_edit_hard"
        : "create.post_form.skill_modal.title_add_hard"
      : mode === "edit"
        ? "create.post_form.skill_modal.title_edit_soft"
        : "create.post_form.skill_modal.title_add_soft";

  return (
    <DialogHeader className="border-b border-[rgba(227,229,233,1)] pb-4 text-black">
      <DialogTitle className="text-[20px] font-semibold text-[rgba(41,210,145,1)]">
        {t(titleKey)}
      </DialogTitle>
    </DialogHeader>
  );
};

export default ModalHeader;
