import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Select,
  MenuItem,
  Slider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { softSkills } from "@/constants/skills";
import { experienceLevels } from "@/constants/profileConstants";

interface SoftSkillsConfig {
  softSkills: string[];
  subcategories: string[];
  assessmentLevel: string;
  passThreshold: number;
  configured: boolean;
}

interface SoftSkillsConfigFormProps {
  initialConfig?: SoftSkillsConfig;
  onSave: (config: SoftSkillsConfig) => void;
  onCancel: () => void;
}

const SoftSkillsConfigForm: React.FC<SoftSkillsConfigFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>(
    initialConfig?.softSkills || []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    initialConfig?.subcategories || []
  );
  const [assessmentLevel, setAssessmentLevel] = useState<string>(
    initialConfig?.assessmentLevel || "Mid Level"
  );
  const [passThreshold, setPassThreshold] = useState<number>(
    initialConfig?.passThreshold || 70
  );

  const handleSoftSkillToggle = (
    skillName: string,
    hasSubcategories: boolean
  ) => {
    if (selectedSoftSkills.includes(skillName)) {
      // Remove skill and all its subcategories
      setSelectedSoftSkills((prev) => prev.filter((s) => s !== skillName));

      if (hasSubcategories) {
        const skill = softSkills.find((s) => s.name === skillName);
        const subcatValues =
          skill?.subcategories?.map((sub) => sub.value) || [];
        setSelectedSubcategories((prev) =>
          prev.filter((sub) => !subcatValues.includes(sub))
        );
      }
    } else {
      // Add skill
      setSelectedSoftSkills((prev) => [...prev, skillName]);
    }
  };

  const handleSubcategoryToggle = (skillName: string, subcatValue: string) => {
    // Ensure parent skill is selected
    if (!selectedSoftSkills.includes(skillName)) {
      setSelectedSoftSkills((prev) => [...prev, skillName]);
    }

    setSelectedSubcategories((prev) =>
      prev.includes(subcatValue)
        ? prev.filter((s) => s !== subcatValue)
        : [...prev, subcatValue]
    );
  };

  const handleSave = () => {
    const config: SoftSkillsConfig = {
      softSkills: selectedSoftSkills,
      subcategories: selectedSubcategories,
      assessmentLevel,
      passThreshold,
      configured: selectedSoftSkills.length > 0,
    };
    onSave(config);
  };

  const isValid = selectedSoftSkills.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Configure Soft Skills Assessment
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Select soft skills and subcategories to evaluate candidates
        </Typography>
      </Box>

      {/* Soft Skills Selection with Subcategories */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Soft Skills
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {softSkills.map((skill) => {
            const isSkillSelected = selectedSoftSkills.includes(skill.name);
            const skillSubcategories = skill.subcategories || [];
            const hasSubcategories = skillSubcategories.length > 0;

            return (
              <Accordion
                key={skill.name}
                expanded={isSkillSelected && hasSubcategories}
                onChange={() => {}}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px !important",
                  "&:before": { display: "none" },
                  boxShadow: isSkillSelected
                    ? "0 2px 8px rgba(0,0,0,0.1)"
                    : "none",
                }}
              >
                <AccordionSummary
                  expandIcon={hasSubcategories ? <ExpandMoreIcon /> : null}
                  sx={{
                    backgroundColor: isSkillSelected ? "#f0f7ff" : "white",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: isSkillSelected ? "#e3f2fd" : "#f5f5f5",
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSkillSelected}
                        onChange={() =>
                          handleSoftSkillToggle(skill.name, hasSubcategories)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        fontWeight={isSkillSelected ? 600 : 400}
                      >
                        {skill.name}
                      </Typography>
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </AccordionSummary>

                {hasSubcategories && (
                  <AccordionDetails sx={{ backgroundColor: "#fafafa", pt: 2 }}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Select specific aspects to assess:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        pl: 2,
                      }}
                    >
                      {skillSubcategories.map((subcat) => (
                        <FormControlLabel
                          key={subcat.value}
                          control={
                            <Checkbox
                              checked={selectedSubcategories.includes(
                                subcat.value
                              )}
                              onChange={() =>
                                handleSubcategoryToggle(
                                  skill.name,
                                  subcat.value
                                )
                              }
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" color="textSecondary">
                              {subcat.label}
                            </Typography>
                          }
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                )}
              </Accordion>
            );
          })}
        </Box>
        {selectedSoftSkills.length === 0 && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            Please select at least one soft skill
          </Typography>
        )}
      </FormControl>

      {/* Assessment Level */}
      {selectedSoftSkills.length > 0 && (
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
            Determines the complexity of scenarios and evaluation criteria
          </Typography>
        </FormControl>
      )}

      {/* Pass Threshold */}
      {selectedSoftSkills.length > 0 && (
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
                  backgroundColor: "#9c27b0",
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Minimum score percentage required to pass this evaluation
            (Currently: {passThreshold}%)
          </Typography>
        </FormControl>
      )}

      {/* Configuration Summary */}
      {selectedSoftSkills.length > 0 && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#f3e5f5",
            borderRadius: "8px",
            border: "1px solid #9c27b0",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 600, color: "#7b1fa2" }}
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
                color="secondary"
                sx={{ mt: 0.5 }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block" }}
              >
                Soft Skills ({selectedSoftSkills.length}):
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                {selectedSoftSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {selectedSubcategories.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: "block" }}
                >
                  Subcategories ({selectedSubcategories.length}):
                </Typography>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
                >
                  {selectedSubcategories.map((subcat) => {
                    const skill = softSkills.find((s) =>
                      s.subcategories?.some((sub) => sub.value === subcat)
                    );
                    const subcatLabel = skill?.subcategories?.find(
                      (s) => s.value === subcat
                    )?.label;
                    return (
                      <Chip
                        key={subcat}
                        label={subcatLabel}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

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

export default SoftSkillsConfigForm;