import React from "react";
import { useTranslation } from "react-i18next";
import { Code2 as CodeOutlined } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { getLevelFromNumber, getSoftSkillLevelLabel, Skill } from '@/modules/company/posts/utils/postHelpers';
import SectionTitle from "./SectionTitle";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  skills: Skill[];
}

const SkillsCard: React.FC<Props> = ({ skills }) => {
  const { t } = useTranslation("posts");
  if (!skills.length) return null;

  return (
    <Card className="p-6 gap-0">
      <SectionTitle icon={<CodeOutlined size={15} />} title={t("detail.details.skills")} />
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => {
          const level = skill.type === "soft"
            ? getSoftSkillLevelLabel(Number(skill.level) || 1)
            : getLevelFromNumber(skill.level || 1);
          return (
            <Badge
              key={i}
              variant="outline"
              className="h-6 rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: TEAL_BG, color: TEAL, borderColor: TEAL_BORDER }}
            >
              {skill.name} · {level}
            </Badge>
          );
        })}
      </div>
    </Card>
  );
};

export default SkillsCard;
