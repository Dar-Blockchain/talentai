import React, { useState, useMemo } from "react";
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
  Alert,
  Paper,
} from "@mui/material";
import { Add, Close, InfoOutlined } from "@mui/icons-material";

const GREEN_MAIN = "#00FF9D";

interface Skill {
  name: string;
  level: string;
  importance?: string;
  category?: string;
  experienceLevel?: string;
  percentage?: number;
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(1);
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [newSkillPercentage, setNewSkillPercentage] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onSkillsChange?.(updated);
  };

  const handleEditSkill = (index: number) => {
    const skill = skills[index];
    setEditingIndex(index);
    setNewSkillName(skill.name);
    setNewSkillLevel(parseInt(skill.level) || 1);
    setNewSkillCategory(skill.category || "");
    setNewSkillPercentage(skill.percentage);
    setError("");
    setOpenDialog(true);
  };

  const handleAddNewSkill = () => {
    setEditingIndex(null);
    setNewSkillName("");
    setNewSkillLevel(1);
    setNewSkillCategory("");
    setNewSkillPercentage(undefined);
    setError("");
    setOpenDialog(true);
  };

  const calculateTotalPercentage = (skillsList: Skill[]): number => {
    return skillsList.reduce((sum, skill) => {
      return sum + (skill.percentage || 0);
    }, 0);
  };

  const handleSaveSkill = () => {
    if (!newSkillName.trim()) {
      setError("Skill name is required");
      return;
    }

    if (newSkillLevel < 1 || newSkillLevel > 5) {
      setError("Skill level must be between 1 and 5");
      return;
    }

    if (newSkillPercentage === undefined || newSkillPercentage === null) {
      setError("Percentage is required and must be between 0 and 100");
      return;
    }

    if (newSkillPercentage < 0 || newSkillPercentage > 100) {
      setError("Percentage must be between 0 and 100");
      return;
    }

    const updatedSkill: Skill = {
      name: newSkillName.trim(),
      level: newSkillLevel.toString(),
      category: newSkillCategory.trim() || undefined,
      percentage: newSkillPercentage,
    };

    let updatedSkills: Skill[];
    if (editingIndex !== null) {
      // Update existing skill
      updatedSkills = skills.map((skill, index) => 
        index === editingIndex ? updatedSkill : skill
      );
    } else {
      // Add new skill
      updatedSkills = [...skills, updatedSkill];
    }

    // Validate total percentage equals 100%
    const totalPercentage = calculateTotalPercentage(updatedSkills);
    if (totalPercentage !== 100) {
      setError(`Total percentage must equal 100%. Current total: ${totalPercentage}%`);
      return;
    }

    onSkillsChange?.(updatedSkills);

    setNewSkillName("");
    setNewSkillLevel(1);
    setNewSkillCategory("");
    setNewSkillPercentage(undefined);
    setError("");
    setEditingIndex(null);
    setOpenDialog(false);
  };

  // Calculate current total percentage
  const totalPercentage = useMemo(() => {
    return calculateTotalPercentage(skills);
  }, [skills]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    setNewSkillName("");
    setNewSkillLevel(1);
    setNewSkillCategory("");
    setNewSkillPercentage(undefined);
    setError("");
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: "#0F172A", fontWeight: 700 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: totalPercentage === 100 ? "#00C853" : totalPercentage > 100 ? "#FF4D4D" : "#FF9800",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          Total: {totalPercentage}%
          {totalPercentage !== 100 && (
            <span style={{ marginLeft: "8px" }}>
              ({totalPercentage < 100 ? `Need ${100 - totalPercentage}% more` : `${totalPercentage - 100}% over`})
            </span>
          )}
        </Typography>
      </Box>

      {totalPercentage !== 100 && editable && (
        <Alert 
          severity={totalPercentage > 100 ? "error" : "warning"} 
          sx={{ mb: 2, fontSize: "0.875rem" }}
        >
          {totalPercentage < 100 
            ? `Total percentage must equal 100%. Please add ${100 - totalPercentage}% more.`
            : `Total percentage exceeds 100%. Please reduce by ${totalPercentage - 100}%.`}
        </Alert>
      )}

      {/* Percentage Explanation */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          backgroundColor: "#F0F9FF",
          border: "1px solid #BAE6FD",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <InfoOutlined sx={{ color: "#0284C7", fontSize: "1.2rem", mt: 0.2, flexShrink: 0 }} />
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#0C4A6E",
                fontWeight: 600,
                mb: 0.5,
                fontSize: "0.875rem",
              }}
            >
              About Skill Percentages
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "#075985",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
              }}
            >
              The percentages represent the <Box component="span" sx={{ fontWeight: 600 }}>relative importance</Box> of each skill for this role. 
              These percentages will be used to <Box component="span" sx={{ fontWeight: 600 }}>match candidates</Box> to your job requirements. 
              Skills with higher percentages will have more weight in the matching algorithm, helping you find candidates 
              who best fit your most critical skill needs. The total must equal 100% to ensure accurate candidate matching.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {skills.map((skill: Skill, index: number) => {
          const levelText = getExperienceLevelFromNumber(skill.level);
          const percentageText = skill.percentage !== undefined ? `${skill.percentage}%` : '';
          const label = percentageText 
            ? `${skill.name} (${levelText}) - ${percentageText}`
            : `${skill.name} (${levelText})`;
          
          return (
            <SkillChip
              key={index}
              label={label}
              onDelete={editable ? () => handleRemoveSkill(index) : undefined}
              onClick={editable ? () => handleEditSkill(index) : undefined}
            />
          );
        })}

        {editable && (
          <Chip
            icon={<Add sx={{ fontSize: 18 }} />}
            label="Add Skill"
            onClick={handleAddNewSkill}
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

      {/* Add/Edit Skill Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0F172A" }}>
          {editingIndex !== null ? "Edit Skill" : "Add New Skill"}
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
            label="Percentage (0-100) *"
            type="number"
            fullWidth
            required
            value={newSkillPercentage !== undefined ? newSkillPercentage : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setNewSkillPercentage(undefined);
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setNewSkillPercentage(numValue);
                }
              }
            }}
            inputProps={{ min: 0, max: 100 }}
            helperText={
              editingIndex !== null
                ? `Required: Set the importance percentage for candidate matching. This determines how much weight this skill has when matching candidates. Current total: ${calculateTotalPercentage(skills.filter((_, i) => i !== editingIndex))}%`
                : `Required: Set the importance percentage for candidate matching. Higher percentages mean this skill is more critical for the role. Current total: ${totalPercentage}%`
            }
            error={!!error && (error.includes("Percentage") || error.includes("Total"))}
          />

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
            onClick={handleCloseDialog}
            sx={{ color: "#FF4D4D", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSkill}
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
            {editingIndex !== null ? "Save Changes" : "Add Skill"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsList;