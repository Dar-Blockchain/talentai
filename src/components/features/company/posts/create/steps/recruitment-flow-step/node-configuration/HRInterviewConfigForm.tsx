import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Chip,
} from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";

interface HRInterviewConfig {
  interviewMode: "ai" | "human";
  interviewType?: string; // Only used when interviewMode === 'human'
  focusAreas: string[];
  configured: boolean;
}

interface HRInterviewConfigFormProps {
  initialConfig?: HRInterviewConfig;
  onSave: (config: HRInterviewConfig) => void;
  onCancel: () => void;
}

const INTERVIEW_TYPES = [
  { value: "video", label: "Video Call", icon: <VideoCallIcon /> },
  { value: "phone", label: "Phone Call", icon: <PhoneIcon /> },
  { value: "in-person", label: "In-Person", icon: <BusinessIcon /> },
];

const FOCUS_AREAS = [
  {
    value: "culture_fit",
    label: "Culture Fit",
    description: "Company values and team dynamics",
  },
  {
    value: "work_experience",
    label: "Work Experience",
    description: "Previous roles and achievements",
  },
  {
    value: "motivation",
    label: "Motivation & Goals",
    description: "Career aspirations and drive",
  },
  {
    value: "technical_background",
    label: "Technical Background Review",
    description: "Overview of technical skills",
  },
  {
    value: "salary",
    label: "Salary Discussion",
    description: "Compensation expectations",
  },
];

const HRInterviewConfigForm: React.FC<HRInterviewConfigFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [interviewMode, setInterviewMode] = useState<"ai" | "human">(
    initialConfig?.interviewMode || "human"
  );
  const [interviewType, setInterviewType] = useState<string>(
    initialConfig?.interviewType || "video"
  );
  const [focusAreas, setFocusAreas] = useState<string[]>(
    initialConfig?.focusAreas || []
  );

  const handleFocusAreaToggle = (value: string) => {
    setFocusAreas((prev) =>
      prev.includes(value)
        ? prev.filter((area) => area !== value)
        : [...prev, value]
    );
  };

  const handleSave = () => {
    const config: HRInterviewConfig = {
      interviewMode,
      interviewType: interviewMode === "human" ? interviewType : undefined,
      focusAreas,
      configured: true, // Always configured once mode is selected
    };
    onSave(config);
  };

  // AI mode requires focus areas, Human mode is always valid
  const isValid = interviewMode === "ai" ? focusAreas.length > 0 : true;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Configure HR Interview
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Set up interview format and key focus areas for candidate evaluation
        </Typography>
      </Box>

      {/* Interview Mode Selection */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Interview Mode
        </Typography>
        <RadioGroup
          value={interviewMode}
          onChange={(e) => setInterviewMode(e.target.value as "ai" | "human")}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* AI Interview Option */}
            <Box
              sx={{
                border: "2px solid",
                borderColor: interviewMode === "ai" ? "#1976d2" : "#e0e0e0",
                borderRadius: "12px",
                p: 2,
                backgroundColor: interviewMode === "ai" ? "#e3f2fd" : "white",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor:
                    interviewMode === "ai" ? "#bbdefb" : "#f5f5f5",
                  transform: "translateX(4px)",
                },
              }}
              onClick={() => setInterviewMode("ai")}
            >
              <FormControlLabel
                value="ai"
                control={<Radio />}
                label={
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <SmartToyIcon
                        color={interviewMode === "ai" ? "primary" : "disabled"}
                      />
                      <Typography
                        variant="body1"
                        fontWeight={interviewMode === "ai" ? 600 : 400}
                      >
                        🤖 AI-Powered Interview
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ pl: 4 }}
                    >
                      Automated interview conducted by AI agent based on focus
                      areas
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {/* Human Interview Option */}
            <Box
              sx={{
                border: "2px solid",
                borderColor: interviewMode === "human" ? "#1976d2" : "#e0e0e0",
                borderRadius: "12px",
                p: 2,
                backgroundColor:
                  interviewMode === "human" ? "#e3f2fd" : "white",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor:
                    interviewMode === "human" ? "#bbdefb" : "#f5f5f5",
                  transform: "translateX(4px)",
                },
              }}
              onClick={() => setInterviewMode("human")}
            >
              <FormControlLabel
                value="human"
                control={<Radio />}
                label={
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <PersonIcon
                        color={
                          interviewMode === "human" ? "primary" : "disabled"
                        }
                      />
                      <Typography
                        variant="body1"
                        fontWeight={interviewMode === "human" ? 600 : 400}
                      >
                        👤 Human Interview
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ pl: 4 }}
                    >
                      Traditional interview conducted by your HR team
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </RadioGroup>
      </FormControl>

      {/* Interview Type (Only for Human Mode) */}
      {interviewMode === "human" && (
        <FormControl fullWidth>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Interview Type
          </Typography>
          <RadioGroup
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {INTERVIEW_TYPES.map((type) => (
                <Box
                  key={type.value}
                  sx={{
                    border: "1px solid",
                    borderColor:
                      interviewType === type.value ? "primary.main" : "#e0e0e0",
                    borderRadius: "8px",
                    p: 1.5,
                    backgroundColor:
                      interviewType === type.value ? "#f0f7ff" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor:
                        interviewType === type.value ? "#e3f2fd" : "#f5f5f5",
                      transform: "translateX(4px)",
                    },
                  }}
                  onClick={() => setInterviewType(type.value)}
                >
                  <FormControlLabel
                    value={type.value}
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {type.icon}
                        <Typography variant="body1">{type.label}</Typography>
                      </Box>
                    }
                  />
                </Box>
              ))}
            </Box>
          </RadioGroup>
        </FormControl>
      )}

      {/* Focus Areas */}
      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Focus Areas
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mb: 1.5, display: "block" }}
        >
          Select the key areas to cover during the interview
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {FOCUS_AREAS.map((area) => {
            const isSelected = focusAreas.includes(area.value);
            return (
              <Box
                key={area.value}
                sx={{
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "#e0e0e0",
                  borderRadius: "8px",
                  p: 1.5,
                  backgroundColor: isSelected ? "#f0f7ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isSelected ? "#e3f2fd" : "#f5f5f5",
                    borderColor: isSelected ? "primary.main" : "#bdbdbd",
                  },
                }}
                onClick={() => handleFocusAreaToggle(area.value)}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleFocusAreaToggle(area.value)}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        variant="body1"
                        fontWeight={isSelected ? 600 : 400}
                      >
                        {area.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {area.description}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            );
          })}
        </Box>
        {focusAreas.length === 0 && interviewMode === "ai" && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            Please select at least one focus area for AI interview
          </Typography>
        )}
        {focusAreas.length === 0 && interviewMode === "human" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Focus areas are optional for human interviews
          </Typography>
        )}
      </FormControl>

      {/* Selected Configuration Preview */}
      {focusAreas.length > 0 && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            📋 Interview Configuration
          </Typography>

          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Interview Mode:
            </Typography>
            <Chip
              label={
                interviewMode === "ai"
                  ? "🤖 AI-Powered Interview"
                  : "👤 Human Interview"
              }
              color={interviewMode === "ai" ? "info" : "primary"}
              size="small"
            />
          </Box>

          {interviewMode === "human" && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Interview Type:
              </Typography>
              <Chip
                label={
                  INTERVIEW_TYPES.find((t) => t.value === interviewType)?.label
                }
                icon={
                  INTERVIEW_TYPES.find((t) => t.value === interviewType)?.icon
                }
                color="primary"
                size="small"
              />
            </Box>
          )}

          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Focus Areas ({focusAreas.length}):
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {focusAreas.map((areaValue) => {
                const area = FOCUS_AREAS.find((a) => a.value === areaValue);
                return (
                  <Chip
                    key={areaValue}
                    label={area?.label}
                    size="small"
                    color="secondary"
                  />
                );
              })}
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

export default HRInterviewConfigForm;