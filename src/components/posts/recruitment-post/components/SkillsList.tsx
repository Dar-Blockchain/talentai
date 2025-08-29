import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const GREEN_MAIN = "#00FF9D";

interface Skill {
  name: string;
  level: string;
  importance?: string;
  category?: string;
  experienceLevel?: string;
}

interface SkillsListProps {
  skills: Skill[];
  title: string;
}

const getExperienceLevelFromNumber = (level: string | number): string => {
  const numLevel = parseInt(level.toString());
  if (numLevel <= 1) return "Entry Level";
  if (numLevel <= 2) return "Junior";
  if (numLevel <= 3) return "Mid-Level";
  if (numLevel <= 4) return "Senior";
  return "Expert";
};

const SkillChip: React.FC<{
  label: string;
  onDelete?: () => void;
  deleteIcon?: React.ReactElement;
  onClick?: () => void;
  sx?: any;
}> = ({ label, onDelete, deleteIcon, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    deleteIcon={deleteIcon}
    onClick={onClick}
    sx={{
      backgroundColor: GREEN_MAIN,
      color: "black",
      fontSize: "0.75rem",
      height: "28px",
      "&:hover": {
        backgroundColor: "rgba(0, 255, 157, 0.8)",
      },
      ...sx,
    }}
  />
);

const SkillsList: React.FC<SkillsListProps> = ({ skills, title }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{ color: "#0F172A", mb: 2, fontWeight: 700 }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {skills.map((skill: Skill, index: number) => (
          <SkillChip
            key={index}
            label={`${skill.name} (${getExperienceLevelFromNumber(
              skill.level
            )})`}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SkillsList;