import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  Chip,
  Autocomplete,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import {
  CATEGORIES,
  ALL_SKILLS,
} from "@/constants/skills";
import { experienceLevels } from "@/constants/profile";

// Map assessment levels to default star ratings
const LEVEL_TO_STARS: Record<string, number> = {
  "Entry Level": 2,
  Junior: 2,
  "Mid Level": 3,
  Senior: 4,
  Expert: 5,
};

interface SkillLevel {
  name: string;
  requiredLevel: number; // 1-5
}

interface TechnicalSkillsConfig {
  categories: string[];
  skills: SkillLevel[];
  assessmentLevel: string;
  passThreshold: number;
  configured: boolean;
}

interface TechnicalSkillsConfigFormProps {
  initialConfig?: TechnicalSkillsConfig;
  onSave: (config: TechnicalSkillsConfig) => void;
  onCancel: () => void;
}

const TechnicalSkillsConfigForm: React.FC<TechnicalSkillsConfigFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialConfig?.categories || []
  );
  const [selectedSkills, setSelectedSkills] = useState<SkillLevel[]>(
    initialConfig?.skills || []
  );
  const [assessmentLevel, setAssessmentLevel] = useState<string>(
    initialConfig?.assessmentLevel || "Mid Level"
  );
  const [passThreshold, setPassThreshold] = useState<number>(
    initialConfig?.passThreshold || 70
  );

  // Filter skills based on selected categories
  const availableSkills = ALL_SKILLS.filter(
    (skill) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(skill.category)
  ).map((skill) => skill.label);

  // When categories change, filter out skills that are no longer available
  useEffect(() => {
    if (selectedCategories.length > 0) {
      setSelectedSkills((prev) =>
        prev.filter((skill) => availableSkills.includes(skill.name))
      );
    }
  }, [selectedCategories]);

  // When assessment level changes, update all skill levels to match
  useEffect(() => {
    const defaultLevel = LEVEL_TO_STARS[assessmentLevel] || 3;
    setSelectedSkills((prev) =>
      prev.map((skill) => ({ ...skill, requiredLevel: defaultLevel }))
    );
  }, [assessmentLevel]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSkillsChange = (newSkillNames: string[]) => {
    // Add new skills with default level based on assessment level
    const defaultLevel = LEVEL_TO_STARS[assessmentLevel] || 3;
    const newSkills = newSkillNames.map((skillName) => {
      const existing = selectedSkills.find((s) => s.name === skillName);
      return existing || { name: skillName, requiredLevel: defaultLevel };
    });
    setSelectedSkills(newSkills);
  };

  const handleSkillLevelChange = (skillName: string, level: number) => {
    setSelectedSkills((prev) =>
      prev.map((skill) =>
        skill.name === skillName ? { ...skill, requiredLevel: level } : skill
      )
    );
  };

  const handleSave = () => {
    const config: TechnicalSkillsConfig = {
      categories: selectedCategories,
      skills: selectedSkills,
      assessmentLevel,
      passThreshold,
      configured: selectedCategories.length > 0 && selectedSkills.length > 0,
    };
    onSave(config);
  };

  const isValid = selectedCategories.length > 0 && selectedSkills.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Configure Technical Skills Assessment
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Select skill categories and specific skills to assess candidates
        </Typography>
      </Box>

      {/* Category Selection */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Skill Categories
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              icon={category.icon}
              onClick={() => handleCategoryToggle(category.id)}
              color={
                selectedCategories.includes(category.id) ? "primary" : "default"
              }
              variant={
                selectedCategories.includes(category.id) ? "filled" : "outlined"
              }
              sx={{
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          ))}
        </Box>
        {selectedCategories.length === 0 && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            Please select at least one category
          </Typography>
        )}
      </FormControl>

      {/* Skill Selection */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Required Skills
        </Typography>
        <Autocomplete
          multiple
          options={availableSkills}
          value={selectedSkills.map((s) => s.name)}
          onChange={(_, newValue) => handleSkillsChange(newValue)}
          disabled={selectedCategories.length === 0}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                selectedCategories.length === 0
                  ? "Select categories first"
                  : "Select skills to assess"
              }
              variant="outlined"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option}
                label={option}
                {...getTagProps({ index })}
                color="primary"
                size="small"
              />
            ))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              minHeight: "48px",
            },
          }}
        />
        {selectedSkills.length === 0 && selectedCategories.length > 0 && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            Please select at least one skill
          </Typography>
        )}
      </FormControl>

      {/* Assessment Level */}
      {selectedSkills.length > 0 && (
        <FormControl fullWidth>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Assessment Difficulty Level
          </Typography>
          <Select
            value={assessmentLevel}
            onChange={(e) => setAssessmentLevel(e.target.value)}
            variant="outlined"
          >
            {experienceLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            Determines the difficulty level of assessment questions
          </Typography>
        </FormControl>
      )}

      {/* Skill Level Requirements */}
      {selectedSkills.length > 0 && (
        <FormControl fullWidth>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Required Proficiency Level per Skill
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Skill</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Required Level
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedSkills.map((skill) => (
                  <TableRow key={skill.name}>
                    <TableCell>
                      <Chip
                        label={skill.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Rating
                        value={skill.requiredLevel}
                        onChange={(_, newValue) => {
                          if (newValue !== null) {
                            handleSkillLevelChange(skill.name, newValue);
                          }
                        }}
                        max={5}
                        icon={<StarIcon fontSize="inherit" />}
                        emptyIcon={<StarIcon fontSize="inherit" />}
                      />
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#666" }}
                      >
                        ({skill.requiredLevel}/5)
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            Set the minimum proficiency level required for each skill
          </Typography>
        </FormControl>
      )}

      {/* Pass Threshold */}
      {selectedSkills.length > 0 && (
        <FormControl fullWidth>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Pass Threshold
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={passThreshold}
              onChange={(_, newValue) => setPassThreshold(newValue as number)}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${value}%`}
              step={5}
              marks
              min={0}
              max={100}
              sx={{
                "& .MuiSlider-valueLabel": {
                  backgroundColor: "#1976d2",
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Minimum score percentage required to pass this assessment
            (Currently: {passThreshold}%)
          </Typography>
        </FormControl>
      )}

      {/* Configuration Summary */}
      {selectedSkills.length > 0 && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#f0f7ff",
            borderRadius: "8px",
            border: "1px solid #2196f3",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 600, color: "#1976d2" }}
          >
            📋 Configuration Summary
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block" }}
              >
                Assessment Level:
              </Typography>
              <Chip
                label={assessmentLevel}
                size="small"
                color="primary"
                sx={{ mt: 0.5 }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block" }}
              >
                Skills to Assess ({selectedSkills.length}):
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                {selectedSkills.map((skill) => (
                  <Chip
                    key={skill.name}
                    label={`${skill.name} (${skill.requiredLevel}★)`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block" }}
              >
                Pass Threshold:
              </Typography>
              <Chip
                label={`${passThreshold}% minimum`}
                size="small"
                color={
                  passThreshold >= 80
                    ? "success"
                    : passThreshold >= 60
                    ? "warning"
                    : "default"
                }
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 2 }}
      >
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          Save Configuration
        </Button>
      </Box>
    </Box>
  );
};

export default TechnicalSkillsConfigForm;