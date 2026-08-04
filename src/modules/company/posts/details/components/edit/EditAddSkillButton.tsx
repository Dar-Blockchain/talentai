import React from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Plus as AddIcon } from "lucide-react";

interface Props {
  onClick: () => void;
}

const EditAddSkillButton: React.FC<Props> = ({ onClick }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="h-[29px] rounded-2xl border-dashed border-[rgba(98,111,134,1)] bg-[rgba(48,185,216,0.06)] font-medium text-[13px] text-[rgba(95,168,211,1)] hover:bg-[rgba(77,217,163,0.08)] disabled:border-gray-200 disabled:text-gray-400"
  >
    <AddIcon size={16} color="rgba(98,111,134,1)" />
    Add Skill
  </Button>
);

export default EditAddSkillButton;
