import React, { useState } from "react";
import { Paper, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssessmentModal from "../AssessmentModal";

type SkillType = "technical" | "soft";

interface EmptySkillsProps {
  type: SkillType;
}

const EmptySkills: React.FC<EmptySkillsProps> = ({ type }) => {
    const [openModal, setOpenModal] = useState(false)

  const isTechnical = type === "technical";

  const message = isTechnical
    ? "No Technical Skills Added"
    : "No Soft Skills Added";

  const subtext = isTechnical
    ? "Add your technical skills to get matched with relevant job opportunities."
    : "Add your soft skills to showcase how you collaborate and communicate.";

  const buttonBackground = isTechnical
    ? "rgba(11, 82, 198, 0.08)"
    : "rgba(250, 180, 70, 0.08)";
    
  const buttonColor = isTechnical
    ? "rgba(11, 82, 198, 1)"
    : "rgba(250, 180, 70, 1)";

  const buttonBackgroundHover = isTechnical
    ? "rgba(11, 82, 198, 0.06)"
    : "rgba(250, 180, 70, 0.06)";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "12px",
        background: "rgba(26, 26, 26, 0.03)",
        border: "1px solid rgba(157, 61, 255, 0.18)",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 500,
          color: "rgba(56, 68, 85, 1)",
          fontSize: "16px",
          mb: 1,
        }}
      >
        {message}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(118, 128, 142, 1)",
          fontSize: "14px",
          fontWeight: 500,
          mb: 3,
        }}
      >
        {subtext}
      </Typography>
      <Button
                onClick={() => setOpenModal(true)}
        disabled
        variant="outlined"
        startIcon={<AddIcon sx={{ color: buttonColor }} />}
        sx={{
          background: buttonBackground,
          border: `1px solid ${buttonColor}`,
          color: buttonColor,
          borderRadius: "38px",
          px: 2,
          py: 1,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          "&:hover": {
            background: buttonBackgroundHover,
          },
        }}
      >
        Add Your First {isTechnical ? "Technical" : "Soft"} Skill
      </Button>
                  <AssessmentModal
        type={isTechnical ? "technical" : "soft"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Paper>
  );
};

export default EmptySkills;
