import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const STEPS = ["Interview Mode", "Focus Areas"];

const labelSx = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.82rem", color: "#111827", mb: 1 };

const INTERVIEW_MODES = [
  {
    value: "ai",
    label: "AI-Powered Interview",
    description: "Automated interview conducted by AI agent based on focus areas",
    icon: <SmartToyIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: "human",
    label: "Human Interview",
    description: "Traditional interview conducted by your HR team",
    icon: <PersonIcon sx={{ fontSize: 20 }} />,
  },
];

const INTERVIEW_TYPES = [
  { value: "video", label: "Video Call", icon: <VideoCallIcon sx={{ fontSize: 18 }} /> },
  { value: "phone", label: "Phone Call", icon: <PhoneIcon sx={{ fontSize: 18 }} /> },
  { value: "in-person", label: "In-Person", icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
];

const FOCUS_AREAS = [
  { value: "culture_fit", label: "Culture Fit", description: "Company values and team dynamics" },
  { value: "work_experience", label: "Work Experience", description: "Previous roles and achievements" },
  { value: "motivation", label: "Motivation & Goals", description: "Career aspirations and drive" },
  { value: "technical_background", label: "Technical Background", description: "Overview of technical skills" },
  { value: "salary", label: "Salary Discussion", description: "Compensation expectations" },
];

interface HRInterviewConfig {
  interviewMode: "ai" | "human";
  interviewType?: string;
  focusAreas: string[];
  configured: boolean;
}

interface Props {
  initialConfig?: HRInterviewConfig;
  onSave: (config: HRInterviewConfig) => void;
  onCancel: () => void;
}

const HRInterviewConfigForm: React.FC<Props> = ({ initialConfig, onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  const [interviewMode, setInterviewMode] = useState<"ai" | "human">(initialConfig?.interviewMode || "ai");
  const [interviewType, setInterviewType] = useState(initialConfig?.interviewType || "video");
  const [focusAreas, setFocusAreas] = useState<string[]>(initialConfig?.focusAreas || []);

  const toggleFocusArea = (val: string) =>
    setFocusAreas((prev) => prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]);

  const handleSave = () =>
    onSave({
      interviewMode,
      interviewType: interviewMode === "human" ? interviewType : undefined,
      focusAreas,
      configured: true,
    });

  const isValid = interviewMode === "ai" ? focusAreas.length > 0 : true;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Step indicator ── */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4 }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: i < step ? TEAL : i === step ? TEAL_BG : "#F3F4F6",
                border: `2px solid ${i <= step ? TEAL : "#E5E7EB"}`,
                transition: "all 0.2s",
              }}>
                {i < step
                  ? <CheckCircleIcon sx={{ fontSize: 16, color: "#fff" }} />
                  : <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "11px", color: i === step ? TEAL : "#9CA3AF" }}>{i + 1}</Typography>
                }
              </Box>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", fontWeight: i === step ? 700 : 500, color: i === step ? TEAL : "#9CA3AF", whiteSpace: "nowrap" }}>
                {label}
              </Typography>
            </Box>
            {i < STEPS.length - 1 && (
              <Box sx={{ flex: 1, height: 2, bgcolor: i < step ? TEAL : "#E5E7EB", mx: 0.5, mb: 2.2, transition: "all 0.2s" }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* ── Step 0: Mode + Type ── */}
      {step === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography sx={labelSx}>Interview Mode</Typography>
          {INTERVIEW_MODES.map((mode) => {
            const active = interviewMode === mode.value;
            return (
              <Box
                key={mode.value}
                onClick={() => setInterviewMode(mode.value as "ai" | "human")}
                sx={{
                  border: `2px solid ${active ? TEAL : "#E5E7EB"}`,
                  borderRadius: "12px", p: 2,
                  bgcolor: active ? TEAL_BG : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  "&:hover": { borderColor: TEAL, bgcolor: TEAL_BG },
                  display: "flex", alignItems: "flex-start", gap: 1.5,
                }}
              >
                <Box sx={{
                  width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                  bgcolor: active ? "rgba(13,148,136,0.15)" : "#F3F4F6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: active ? TEAL : "#9CA3AF",
                }}>
                  {mode.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "13px", color: active ? TEAL : "#111827" }}>
                    {mode.label}
                  </Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF", mt: 0.25 }}>
                    {mode.description}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0, mt: 0.25,
                  border: `2px solid ${active ? TEAL : "#D1D5DB"}`,
                  bgcolor: active ? TEAL : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />}
                </Box>
              </Box>
            );
          })}

          {/* Interview type — only for human */}
          {interviewMode === "human" && (
            <Box sx={{ mt: 0.5 }}>
              <Typography sx={{ ...labelSx, mt: 1 }}>Interview Format</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {INTERVIEW_TYPES.map((type) => {
                  const active = interviewType === type.value;
                  return (
                    <Box
                      key={type.value}
                      onClick={() => setInterviewType(type.value)}
                      sx={{
                        flex: 1, border: `1px solid ${active ? TEAL : "#E5E7EB"}`,
                        borderRadius: "10px", p: 1.5, cursor: "pointer",
                        bgcolor: active ? TEAL_BG : "#fff", transition: "all 0.15s",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                        "&:hover": { borderColor: TEAL, bgcolor: TEAL_BG },
                      }}
                    >
                      <Box sx={{ color: active ? TEAL : "#9CA3AF" }}>{type.icon}</Box>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? TEAL : "#6B7280" }}>
                        {type.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ── Step 1: Focus areas + summary ── */}
      {step === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography sx={labelSx}>
            Focus Areas
            {interviewMode === "human" && (
              <Typography component="span" sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 400, color: "#9CA3AF", ml: 1 }}>
                (optional)
              </Typography>
            )}
          </Typography>

          {FOCUS_AREAS.map((area) => {
            const active = focusAreas.includes(area.value);
            return (
              <Box
                key={area.value}
                onClick={() => toggleFocusArea(area.value)}
                sx={{
                  border: `1px solid ${active ? TEAL : "#E5E7EB"}`,
                  borderRadius: "10px", px: 1.5, py: 1.25,
                  bgcolor: active ? TEAL_BG : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 1.25,
                  "&:hover": { borderColor: TEAL, bgcolor: TEAL_BG },
                }}
              >
                <Checkbox
                  checked={active}
                  onChange={() => toggleFocusArea(area.value)}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                  sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: TEAL } }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? TEAL : "#374151" }}>
                    {area.label}
                  </Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF" }}>
                    {area.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {focusAreas.length === 0 && interviewMode === "ai" && (
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#EF4444" }}>
              Select at least one focus area for AI interview
            </Typography>
          )}

          {/* Summary */}
          <Box sx={{ bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, borderRadius: "12px", p: 2, mt: 0.5 }}>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.72rem", color: TEAL, mb: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Mode</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                  {interviewMode === "ai" ? "AI-Powered" : "Human"}
                </Typography>
              </Box>
              {interviewMode === "human" && (
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Format</Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                    {INTERVIEW_TYPES.find((t) => t.value === interviewType)?.label}
                  </Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Focus areas</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                  {focusAreas.length > 0 ? focusAreas.length + " selected" : "None"}
                </Typography>
              </Box>
              {focusAreas.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {focusAreas.map((v) => (
                    <Chip key={v} label={FOCUS_AREAS.find((a) => a.value === v)?.label} size="small"
                      sx={{ fontFamily: "Poppins", fontSize: "11px", bgcolor: "#fff", border: `1px solid ${TEAL_BORDER}`, color: TEAL }} />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Footer ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, pt: 2, borderTop: "1px solid #F3F4F6" }}>
        <Button
          onClick={step === 0 ? onCancel : () => setStep(0)}
          startIcon={step > 0 ? <ArrowBackIcon sx={{ fontSize: 15 }} /> : undefined}
          sx={{
            fontFamily: "Poppins", fontWeight: 600, fontSize: "13px", textTransform: "none",
            color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "10px", px: 2.5,
            "&:hover": { bgcolor: "#F9FAFB" },
          }}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step === 0 ? (
          <Button
            variant="contained"
            onClick={() => setStep(1)}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", textTransform: "none",
              bgcolor: TEAL, borderRadius: "10px", px: 3, boxShadow: "none",
              "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isValid}
            sx={{
              fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", textTransform: "none",
              bgcolor: TEAL, borderRadius: "10px", px: 3, boxShadow: "none",
              "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}
          >
            Save Configuration
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HRInterviewConfigForm;
