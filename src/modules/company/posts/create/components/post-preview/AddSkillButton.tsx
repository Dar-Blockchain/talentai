import { Button } from "@/modules/shared/ui/shadcn/button";
import { Plus as AddOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  skillType: "hard" | "soft";
  onClick: () => void;
}

const AddSkillButton: React.FC<Props> = ({ skillType, onClick }) => {
  const { t } = useTranslation("posts");
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-[30px] rounded-2xl border-dashed border-gray-300 bg-gray-50 px-3 text-xs font-semibold text-gray-500 hover:bg-teal-50 hover:text-teal-600"
    >
      <AddOutlined size={14} />
      {t(skillType === "hard" ? "create.preview.btn_add_hard_skill" : "create.preview.btn_add_soft_skill")}
    </Button>
  );
};

export default AddSkillButton;
