import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Button,
  Select,
  MenuItem,
  Slider,
  Collapse,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { softSkills } from "@/constants/skills";
import { experienceLevels } from "@/constants/profile";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const STEPS = ["Select Skills", "Settings"];

const labelSx = {
  fontFamily: "Poppins", fontWeight: 700, fontSize: "0.82rem", color: "#111827", mb: 1,
};

interface SoftSkillsConfig {
  softSkills: string[];
  subcategories: string[];
  assessmentLevel: string;
  passThreshold: number;
  configured: boolean;
}

interface Props {
  initialConfig?: SoftSkillsConfig;
  onSave: (config: SoftSkillsConfig) => void;
  onCancel: () => void;
}

const SoftSkillsConfigForm: React.FC<Props> = ({ initialConfig, onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialConfig?.softSkills || []);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(initialConfig?.subcategories || []);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [assessmentLevel, setAssessmentLevel] = useState(initialConfig?.assessmentLevel || "Mid Level");
  const [passThreshold, setPassThreshold] = useState(initialConfig?.passThreshold || 70);

  const handleSkillToggle = (name: string, hasSubcats: boolean) => {
    if (selectedSkills.includes(name)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== name));
      if (hasSubcats) {
        const skill = softSkills.find((s) => s.name === name);
        const vals = skill?.subcategories?.map((s) => s.value) || [];
        setSelectedSubcategories((prev) => prev.filter((s) => !vals.includes(s)));
      }
      if (expandedSkill === name) setExpandedSkill(null);
    } else {
      setSelectedSkills((prev) => [...prev, name]);
      if (hasSubcats) setExpandedSkill(name);
    }
  };

  const handleSubcatToggle = (skillName: string, val: string) => {
    if (!selectedSkills.includes(skillName)) setSelectedSkills((prev) => [...prev, skillName]);
    setSelectedSubcategories((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const handleSave = () => {
    onSave({
      softSkills: selectedSkills,
      subcategories: selectedSubcategories,
      assessmentLevel,
      passThreshold,
      configured: selectedSkills.length > 0,
    });
  };

  const canNext = selectedSkills.length > 0;

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

      {/* ── Step 0: Skill selection ── */}
      {step === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={labelSx}>Soft Skills</Typography>
          {softSkills.map((skill) => {
            const isSelected = selectedSkills.includes(skill.name);
            const hasSubcats = (skill.subcategories || []).length > 0;
            const isExpanded = expandedSkill === skill.name && isSelected && hasSubcats;

            return (
              <Box
                key={skill.name}
                sx={{
                  border: `1px solid ${isSelected ? TEAL : "#E5E7EB"}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  bgcolor: isSelected ? TEAL_BG : "#fff",
                  transition: "all 0.15s",
                }}
              >
                <Box
                  display="flex" alignItems="center" justifyContent="space-between"
                  sx={{ px: 1.5, py: 1, cursor: "pointer" }}
                  onClick={() => handleSkillToggle(skill.name, hasSubcats)}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSkillToggle(skill.name, hasSubcats)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        sx={{ color: TEAL, "&.Mui-checked": { color: TEAL } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: isSelected ? 600 : 400, color: isSelected ? TEAL : "#374151" }}>
                        {skill.name}
                      </Typography>
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isSelected && hasSubcats && (
                    <Box
                      onClick={(e) => { e.stopPropagation(); setExpandedSkill(isExpanded ? null : skill.name); }}
                      sx={{ display: "flex", alignItems: "center", cursor: "pointer", p: 0.5 }}
                    >
                      <ExpandMoreIcon sx={{ fontSize: 18, color: TEAL, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </Box>
                  )}
                </Box>

                {hasSubcats && (
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2, pb: 1.5, borderTop: `1px solid ${TEAL_BORDER}`, bgcolor: "#fff" }}>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF", mt: 1, mb: 0.75 }}>
                        Select specific aspects:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {skill.subcategories!.map((sub) => {
                          const active = selectedSubcategories.includes(sub.value);
                          return (
                            <Chip
                              key={sub.value}
                              label={sub.label}
                              size="small"
                              onClick={() => handleSubcatToggle(skill.name, sub.value)}
                              sx={{
                                fontFamily: "Poppins", fontSize: "11px", cursor: "pointer",
                                bgcolor: active ? TEAL_BG : "#F9FAFB",
                                border: `1px solid ${active ? TEAL : "#E5E7EB"}`,
                                color: active ? TEAL : "#6B7280",
                                transition: "all 0.15s",
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}

          {selectedSkills.length === 0 && (
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#EF4444", mt: 0.5 }}>
              Select at least one soft skill
            </Typography>
          )}
        </Box>
      )}

      {/* ── Step 1: Difficulty + Threshold + Summary ── */}
      {step === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={labelSx}>Assessment Difficulty</Typography>
            <Select
              fullWidth
              value={assessmentLevel}
              onChange={(e) => setAssessmentLevel(e.target.value)}
              sx={{ borderRadius: "10px", fontSize: "13px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
            >
              {experienceLevels.map((l) => (
                <MenuItem key={l} value={l} sx={{ fontFamily: "Poppins", fontSize: "13px" }}>{l}</MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography sx={labelSx}>Pass Threshold</Typography>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem", color: passThreshold >= 80 ? "#22c55e" : passThreshold >= 60 ? "#f59e0b" : "#ef4444" }}>
                {passThreshold}%
              </Typography>
            </Box>
            <Slider
              value={passThreshold}
              onChange={(_, v) => setPassThreshold(v as number)}
              step={5} min={0} max={100}
              sx={{ color: TEAL, "& .MuiSlider-thumb": { width: 20, height: 20 } }}
            />
          </Box>

          {/* Summary */}
          <Box sx={{ bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, borderRadius: "12px", p: 2 }}>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.72rem", color: TEAL, mb: 1.25, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Skills</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>{selectedSkills.length} selected</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Level</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>{assessmentLevel}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Pass threshold</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>{passThreshold}%</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                {selectedSkills.map((s) => (
                  <Chip key={s} label={s} size="small" sx={{ fontFamily: "Poppins", fontSize: "11px", bgcolor: "#fff", border: `1px solid ${TEAL_BORDER}`, color: TEAL }} />
                ))}
              </Box>
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
            disabled={!canNext}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", textTransform: "none",
              bgcolor: TEAL, color: "#fff", borderRadius: "10px", px: 3, boxShadow: "none",
              "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", textTransform: "none",
              bgcolor: TEAL, color: "#fff", borderRadius: "10px", px: 3, boxShadow: "none",
              "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
            }}
          >
            Save Configuration
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SoftSkillsConfigForm;
