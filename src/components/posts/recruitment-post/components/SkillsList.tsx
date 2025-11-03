import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  FormHelperText,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";

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
  editable?: boolean;
  onSkillsChange?: (updatedSkills: Skill[]) => void;
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
  onClick?: () => void;
  sx?: any;
}> = ({ label, onDelete, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={onDelete ? <Close sx={{ fontSize: 18 }} /> : undefined}
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

const SkillsList: React.FC<SkillsListProps> = ({
  skills,
  title,
  editable = false,
  onSkillsChange,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(1);
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [error, setError] = useState("");

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onSkillsChange?.(updated);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      setError("Skill name is required");
      return;
    }

    if (newSkillLevel < 1 || newSkillLevel > 5) {
      setError("Skill level must be between 1 and 5");
      return;
    }

    const newSkill: Skill = {
      name: newSkillName.trim(),
      level: newSkillLevel.toString(),
      category: newSkillCategory.trim() || undefined,
    };

    onSkillsChange?.([...skills, newSkill]);
    setNewSkillName("");
    setNewSkillLevel(1);
    setNewSkillCategory("");
    setError("");
    setOpenDialog(false);
  };

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
            label={`${skill.name} (${getExperienceLevelFromNumber(skill.level)})`}
            onDelete={editable ? () => handleRemoveSkill(index) : undefined}
          />
        ))}

        {editable && (
          <Chip
            icon={<Add sx={{ fontSize: 18 }} />}
            label="Add Skill"
            onClick={() => setOpenDialog(true)}
            sx={{
              border: `1px dashed ${GREEN_MAIN}`,
              color: GREEN_MAIN,
              background: "transparent",
              fontSize: "0.75rem",
              height: "28px",
              "&:hover": {
                background: "rgba(0,255,157,0.1)",
              },
            }}
          />
        )}
      </Box>

      {/* Add Skill Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0F172A" }}>
          Add New Skill
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Skill Name"
            fullWidth
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            autoFocus
            error={!!error && !newSkillName.trim()}
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Skill Level: {getExperienceLevelFromNumber(newSkillLevel)}
            </Typography>
            <Slider
              value={newSkillLevel}
              min={1}
              max={5}
              step={1}
              marks
              valueLabelDisplay="off"
              onChange={(_, value) => setNewSkillLevel(value as number)}
              sx={{ color: GREEN_MAIN }}
            />
          </Box>

          <TextField
            label="Category (optional)"
            fullWidth
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
          />

          {error && <FormHelperText error>{error}</FormHelperText>}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", mt: 1 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setError("");
            }}
            sx={{ color: "#FF4D4D", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSkill}
            variant="contained"
            sx={{
              backgroundColor: GREEN_MAIN,
              color: "black",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "rgba(0,255,157,0.8)",
              },
            }}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsList;