import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip } from "@mui/material";
import { Code2 as CodeOutlined } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
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
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {skills.map((skill, i) => {
          const level = skill.type === "soft"
            ? getSoftSkillLevelLabel(Number(skill.level) || 1)
            : getLevelFromNumber(skill.level || 1);
          return (
            <Chip key={i} label={`${skill.name} · ${level}`} size="small"
              sx={{ fontSize: "11px", fontWeight: 600, height: 24, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` }} />
          );
        })}
      </Box>
    </Card>
  );
};

export default SkillsCard;
