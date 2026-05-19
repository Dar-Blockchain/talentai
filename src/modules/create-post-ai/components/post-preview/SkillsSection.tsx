import { Box, Typography } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { HardSkill, SoftSkill, deleteHardSkill, deleteSoftSkill } from "../../store/createPostSlice";
import { hardSkillLevelLabel, softSkillLevelLabel } from "@/utils/postFormI18n";
import SectionCard from "@/components/ui/SectionCard";
import SkillChip from "./SkillChip";
import AddSkillButton from "./AddSkillButton";

interface Props {
  hardSkills: HardSkill[];
  softSkills: SoftSkill[];
  onEdit: (skill: any, index: number, type: "hard" | "soft") => void;
  onAdd: (type: "hard" | "soft") => void;
}

const SkillsSection = ({ hardSkills, softSkills, onEdit, onAdd }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("posts");

  return (
    <SectionCard>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 1.5 }}>{t("create.preview.section_skills")}</Typography>

      <Box sx={{ display: "flex", gap: 1, p: 1.5, borderRadius: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", mb: 2 }}>
        <InfoOutlined sx={{ fontSize: 16, color: "#3B82F6", flexShrink: 0, mt: "1px" }} />
        <Typography sx={{ fontSize: "12px", color: "#1E40AF", lineHeight: 1.5 }}>
          <Trans i18nKey="create.preview.skills_info" ns="posts" components={{ bold: <b /> }} />
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("create.preview.hard_skills")}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {hardSkills.map((skill, index) => (
            <SkillChip
              key={index}
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
              key={index}
              label={`${skill.name} (${softSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
              onDelete={() => dispatch(deleteSoftSkill(index))}
              onClick={() => onEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "soft")}
            />
          ))}
          <AddSkillButton skillType="soft" onClick={() => onAdd("soft")} />
        </Box>
      </Box>
    </SectionCard>
  );
};

export default SkillsSection;
