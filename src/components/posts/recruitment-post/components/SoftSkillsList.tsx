import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormHelperText,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add, Close, InfoOutlined } from "@mui/icons-material";

const GREEN_MAIN = "#00FF9D";

interface SoftSkill {
  name: string;
  importance: string;
  percentage: number;
}

interface SoftSkillsListProps {
  skills: SoftSkill[];
  title: string;
  editable?: boolean;
  onSkillsChange?: (updatedSkills: SoftSkill[]) => void;
}

const importanceLevels = ["Junior", "Mid_Level", "Senior", "Expert"];

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

const SoftSkillsList: React.FC<SoftSkillsListProps> = ({
  skills,
  title,
  editable = false,
  onSkillsChange,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillImportance, setNewSkillImportance] = useState("Senior");
  const [error, setError] = useState("");

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onSkillsChange?.(updated);
  };

  const handleEditSkill = (index: number) => {
    const skill = skills[index];
    setEditingIndex(index);
    setNewSkillName(skill.name);
    setNewSkillImportance(skill.importance);
    setError("");
    setOpenDialog(true);
  };

  const handleAddNewSkill = () => {
    // Only allow one soft skill
    if (skills.length >= 1 && editingIndex === null) {
      return;
    }
    setEditingIndex(null);
    setNewSkillName("");
    setNewSkillImportance("Senior");
    setError("");
    setOpenDialog(true);
  };

  const handleSaveSkill = () => {
    if (!newSkillName.trim()) {
      setError("Skill name is required");
      return;
    }

    // For single soft skill, always set to 100%
    const updatedSkill: SoftSkill = {
      name: newSkillName.trim(),
      importance: newSkillImportance,
      percentage: 100,
    };

    let updatedSkills: SoftSkill[];
    if (editingIndex !== null) {
      // Update existing skill - replace it
      updatedSkills = [updatedSkill];
    } else {
      // Add new skill - only one allowed, so replace existing
      updatedSkills = [updatedSkill];
    }

    onSkillsChange?.(updatedSkills);

    setNewSkillName("");
    setNewSkillImportance("Senior");
    setError("");
    setEditingIndex(null);
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndex(null);
    setNewSkillName("");
    setNewSkillImportance("Senior");
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
      </Box>

      {/* Info note */}
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
              About Soft Skills
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
              Select <Box component="span" sx={{ fontWeight: 600 }}>one primary soft skill</Box> that is most important for this role.
              This will be used to <Box component="span" sx={{ fontWeight: 600 }}>match candidates</Box> based on their soft skill strengths.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {skills.map((skill: SoftSkill, index: number) => {
          const label = `${skill.name} (${skill.importance}) - ${skill.percentage}%`;

          return (
            <SkillChip
              key={index}
              label={label}
              onDelete={editable ? () => handleRemoveSkill(index) : undefined}
              onClick={editable ? () => handleEditSkill(index) : undefined}
            />
          );
        })}

        {editable && skills.length === 0 && (
          <Chip
            icon={<Add sx={{ fontSize: 18 }} />}
            label="Add Soft Skill"
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
          {editingIndex !== null ? "Edit Soft Skill" : "Add New Soft Skill"}
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

          <FormControl fullWidth>
            <InputLabel>Importance Level</InputLabel>
            <Select
              value={newSkillImportance}
              label="Importance Level"
              onChange={(e) => setNewSkillImportance(e.target.value)}
            >
              {importanceLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

export default SoftSkillsList;
