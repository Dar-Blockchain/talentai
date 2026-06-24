import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Code2, Users, Plus } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import AssessmentModal from "@/components/features/candidate/AssessmentModal";

type SkillType = "technical" | "soft";

const CONFIG = {
  technical: {
    Icon:        Code2,
    border:      "border-info-border",
    bg:          "bg-info-light",
    iconRing:    "border-info-border text-info",
    iconShadow:  "shadow-[0_4px_12px_rgb(37_99_235_/_0.10)]",
    btnBorder:   "border-info text-info hover:bg-info-light",
  },
  soft: {
    Icon:        Users,
    border:      "border-warning-border",
    bg:          "bg-warning-light",
    iconRing:    "border-warning-border text-warning",
    iconShadow:  "shadow-[0_4px_12px_rgb(217_119_6_/_0.10)]",
    btnBorder:   "border-warning text-warning hover:bg-warning-light",
  },
};

const EmptySkills: React.FC<{ type: SkillType }> = ({ type }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.skills.empty.${k}`) as string;
  const [openModal, setOpenModal] = useState(false);
  const { Icon, border, bg, iconRing, iconShadow, btnBorder } = CONFIG[type];

  return (
    <>
      <div className={cn(
        "py-10 px-4 text-center rounded-lg border-[1.5px] border-dashed",
        border, bg,
      )}>
        <div className={cn(
          "size-14 rounded-full bg-card border-[1.5px] flex items-center justify-center mx-auto mb-3",
          iconRing, iconShadow,
        )}>
          <Icon className="size-6" />
        </div>
        <p className="font-bold text-gray-900 text-[0.9rem] mb-1">
          {type === "technical" ? s("technical_title") : s("soft_title")}
        </p>
        <p className="text-muted-foreground text-[0.78rem] mb-4 max-w-xs mx-auto">
          {type === "technical" ? s("technical_desc") : s("soft_desc")}
        </p>
        <Button
          disabled
          size="sm"
          variant="outline"
          onClick={() => setOpenModal(true)}
          className={cn("text-[0.78rem] font-semibold rounded-lg", btnBorder)}
        >
          <Plus className="size-3.5 mr-1.5" />
          {type === "technical" ? s("technical_btn") : s("soft_btn")}
        </Button>
      </div>
      <AssessmentModal type={type} open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};

export default EmptySkills;
