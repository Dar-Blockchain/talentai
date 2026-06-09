import React from "react";
import { Box, Typography } from "@mui/material";
import CancelOutlined       from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlined  from "@mui/icons-material/CheckCircleOutlined";
import { PostAssessmentData } from "../../types";
import { SectionLabel } from "../assessmentAtoms";

interface Props {
  requiredSkills: PostAssessmentData["requiredSkills"];
}

const RequiredSkillsCard: React.FC<Props> = ({ requiredSkills }) => {
  if (!requiredSkills || requiredSkills.all.length === 0) return null;
  return (
    <Box sx={{ borderRadius: "16px", border: "1px solid #F3F4F6", px: 2.5, py: 2 }}>
      <SectionLabel>Required Skills</SectionLabel>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {requiredSkills.all.map((skill, i) => {
          const met = requiredSkills.demonstrated.includes(skill);
          return (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.125, py: 0.5, borderRadius: "99px",
              bgcolor: met ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${met ? "#BBF7D0" : "#FECACA"}` }}>
              {met
                ? <CheckCircleOutlined sx={{ fontSize: 12, color: "#10B981" }} />
                : <CancelOutlined     sx={{ fontSize: 12, color: "#EF4444" }} />}
              <Typography sx={{ fontSize: "0.73rem", fontWeight: 600, color: met ? "#065F46" : "#991B1B" }}>{skill}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RequiredSkillsCard;
