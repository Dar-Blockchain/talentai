import { Box, Typography } from "@mui/material";
import { Info as InfoOutlined } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { HardSkill, SoftSkill, deleteHardSkill, deleteSoftSkill } from "../../store/createPostSlice";
import { hardSkillLevelLabel, softSkillLevelLabel } from "../../utils";
import { Card } from "@/modules/shared/ui/shadcn/card";
import SkillChip from "./SkillChip";
import AddSkillButton from "./AddSkillButton";

interface EditableSkill {
  name: string;
  level: number;
  percentage: number;
}

interface Props {
  hardSkills: HardSkill[];
  softSkills: SoftSkill[];
  onEdit: (skill: EditableSkill, index: number, type: "hard" | "soft") => void;
  onAdd: (type: "hard" | "soft") => void;
}

const SkillsSection = ({ hardSkills, softSkills, onEdit, onAdd }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <Card className="p-6 gap-0">
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.5 }}>{t("create.preview.section_skills")}</Typography>

      <Box sx={{ display: "flex", gap: 1, p: 1.5, borderRadius: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", mb: 2 }}>
        <InfoOutlined size={16} color="#3B82F6" className="shrink-0 mt-px" />
        <Typography sx={{ fontSize: "12px", color: "#1E40AF", lineHeight: 1.5 }}>
          <Trans i18nKey="create.preview.skills_info" ns="posts" components={{ bold: <b /> }} />
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("create.preview.hard_skills")}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {hardSkills.map((skill, index) => (
            <SkillChip
              key={`hard-${skill.name}-${index}`}
              label={`${skill.name} (${hardSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
              onDelete={() => dispatch(deleteHardSkill(index))}
              onClick={() => onEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "hard")}
            />
          ))}
          <AddSkillButton skillType="hard" onClick={() => onAdd("hard")} />
        </Box>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("create.preview.soft_skills")}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {softSkills.map((skill, index) => (
            <SkillChip
              key={`soft-${skill.name}-${index}`}
              label={`${skill.name} (${softSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
              onDelete={softSkills.length > 1 ? () => dispatch(deleteSoftSkill(index)) : undefined}
              onClick={() => onEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "soft")}
            />
          ))}
          <AddSkillButton skillType="soft" onClick={() => onAdd("soft")} />
        </Box>
      </Box>
    </Card>
  );
};

export default SkillsSection;
