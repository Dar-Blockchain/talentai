import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Code2, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import AssessmentModal from "@/modules/candidate/interviews/components/AssessmentModal";

type SkillType = "technical" | "soft";

const ICONS: Record<SkillType, React.ElementType> = {
  technical: Code2,
  soft: MessageCircle,
};

const EmptySkills: React.FC<{ type: SkillType }> = ({ type }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.skills.empty.${k}`) as string;
  const [openModal, setOpenModal] = useState(false);
  const Icon = ICONS[type];

  return (
    <>
      <div className="py-10 px-4 text-center rounded-lg border-[1.5px] border-dashed border-gray-300 bg-gray-50">
        <div className="size-14 rounded-full bg-card border-[1.5px] border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-3">
          <Icon className="size-6 text-gray-400" />
        </div>
        <p className="font-bold text-gray-900 text-[0.9rem] mb-1">
          {type === "technical" ? s("technical_title") : s("soft_title")}
        </p>
        <p className="text-muted-foreground text-[0.78rem] mb-4 max-w-xs mx-auto">
          {type === "technical" ? s("technical_desc") : s("soft_desc")}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setOpenModal(true)}
          className="text-[0.78rem] font-semibold rounded-lg cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          <Plus className="size-3.5 mr-1.5" />
          {type === "technical" ? s("technical_btn") : s("soft_btn")}
        </Button>
        <AssessmentModal type={type} open={openModal} onClose={() => setOpenModal(false)} />
      </div>
    </>
  );
};

export default EmptySkills;
