import React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { getLevelFromNumber } from '@/modules/company/posts/utils/postHelpers';
import EditSkillChip from "./EditSkillChip";
import EditAddSkillButton from "./EditAddSkillButton";

interface Skill {
  name: string;
  level: number;
  percentage: number;
}

interface Props {
  requiredSkills: Skill[];
  softSkills: Skill[];
  onAdd: (type: "hard" | "soft") => void;
  onEdit: (index: number, type: "hard" | "soft") => void;
  onDelete: (index: number, type: "hard" | "soft") => void;
}

const sectionTitle = {
  color: "rgba(84,98,116,1)", fontSize: "20px", fontWeight: 600,
} as const;

const EditSkillsSection: React.FC<Props> = ({
  requiredSkills, softSkills, onAdd, onEdit, onDelete,
}) => (
  <>
    {/* Info banner */}
    <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}>
      <Typography variant="subtitle2" sx={sectionTitle}>Required Skills</Typography>
      <Typography variant="subtitle2" sx={{ color: "rgba(77,217,163,1)", fontSize: "12px" }}>
        Total: 100%
      </Typography>
    </Box>

    <Box sx={{
      display: "flex", alignItems: "flex-start", gap: 1, p: 1,
      borderRadius: "12px", background: "rgba(240,249,255,1)",
      border: "1px solid rgba(122,200,240,1)",
    }}>
      <Image src="/icons/lightinfooutline.svg" alt="info" width={18} height={18} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ color: "rgba(84,98,116,1)", fontSize: "13px", fontWeight: 600 }}>
          About Skill Percentages
        </Typography>
        <Typography variant="subtitle2" sx={{ color: "rgba(84,98,116,1)", fontSize: "12px", fontWeight: 400 }}>
          The percentages represent the <b>relative importance</b> of each skill for this role. These
          percentages will be used to <b>match candidates</b> to your job requirements.
        </Typography>
      </Box>
    </Box>

    {/* Hard skills */}
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={sectionTitle}>Hard Skills</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
        {requiredSkills.map((skill, i) => (
          <EditSkillChip
            key={i}
            label={`${skill.name} (${getLevelFromNumber(skill.level)}) - ${skill.percentage}%`}
            onDelete={() => onDelete(i, "hard")}
            onClick={() => onEdit(i, "hard")}
          />
        ))}
        <EditAddSkillButton onClick={() => onAdd("hard")} />
      </Box>
    </Box>

    {/* Soft skills */}
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={sectionTitle}>Soft Skills</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
        {softSkills.map((skill, i) => (
          <EditSkillChip
            key={i}
            label={`${skill.name} (${skill.level}/5) - ${skill.percentage}%`}
            onDelete={() => onDelete(i, "soft")}
            onClick={() => onEdit(i, "soft")}
          />
        ))}
        <EditAddSkillButton onClick={() => onAdd("soft")} />
      </Box>
    </Box>
  </>
);

export default EditSkillsSection;
