import { Sparkles as SparklesIcon } from "lucide-react";
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
    <DialogHeader className="flex-row items-center gap-3 border-b border-[rgba(227,229,233,1)] px-6 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <SparklesIcon className="size-4.5 text-primary" />
      </div>
      <DialogTitle className="text-[18px] font-semibold text-foreground">
        {t(titleKey)}
      </DialogTitle>
    </DialogHeader>
  );
};

export default ModalHeader;
