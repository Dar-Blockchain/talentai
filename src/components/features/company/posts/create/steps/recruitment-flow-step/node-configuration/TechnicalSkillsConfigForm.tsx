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
  Slider,
  Rating,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CATEGORIES, ALL_SKILLS } from "@/constants/skills";
import { experienceLevels } from "@/constants/profile";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const LEVEL_TO_STARS: Record<string, number> = {
  "Entry Level": 2,
  Junior: 2,
  "Mid Level": 3,
  Senior: 4,
  Expert: 5,
};

const STEPS = ["Select Skills", "Proficiency", "Threshold"];

interface SkillLevel {
  name: string;
  requiredLevel: number;
}

interface TechnicalSkillsConfig {
  categories: string[];
  skills: SkillLevel[];
  assessmentLevel: string;
  passThreshold: number;
  configured: boolean;
}

interface Props {
  initialConfig?: TechnicalSkillsConfig;
  onSave: (config: TechnicalSkillsConfig) => void;
  onCancel: () => void;
}

const labelSx = {
  fontFamily: "Poppins", fontWeight: 700, fontSize: "0.82rem", color: "#111827", mb: 1,
};

const TechnicalSkillsConfigForm: React.FC<Props> = ({ initialConfig, onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialConfig?.categories || []);
  const [selectedSkills, setSelectedSkills] = useState<SkillLevel[]>(initialConfig?.skills || []);
  const [assessmentLevel, setAssessmentLevel] = useState(initialConfig?.assessmentLevel || "Mid Level");
  const [passThreshold, setPassThreshold] = useState(initialConfig?.passThreshold || 70);

  const availableSkills = ALL_SKILLS.filter(
    (s) => selectedCategories.length === 0 || selectedCategories.includes(s.category)
  ).map((s) => s.label);

  useEffect(() => {
    if (selectedCategories.length > 0)
      setSelectedSkills((prev) => prev.filter((s) => availableSkills.includes(s.name)));
  }, [selectedCategories]);

  useEffect(() => {
    const defaultLevel = LEVEL_TO_STARS[assessmentLevel] || 3;
    setSelectedSkills((prev) => prev.map((s) => ({ ...s, requiredLevel: defaultLevel })));
  }, [assessmentLevel]);

  const handleCategoryToggle = (id: string) =>
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSkillsChange = (names: string[]) => {
    const defaultLevel = LEVEL_TO_STARS[assessmentLevel] || 3;
    setSelectedSkills(names.map((name) => selectedSkills.find((s) => s.name === name) || { name, requiredLevel: defaultLevel }));
  };

  const handleSave = () => {
    onSave({
      categories: selectedCategories,
      skills: selectedSkills,
      assessmentLevel,
      passThreshold,
      configured: selectedCategories.length > 0 && selectedSkills.length > 0,
    });
  };

  const canNext0 = selectedCategories.length > 0 && selectedSkills.length > 0;
  const canNext1 = true;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Step indicator ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0, mb: 2.5 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: i < step ? TEAL : i === step ? TEAL_BG : "#F3F4F6",
                  border: `2px solid ${i <= step ? TEAL : "#E5E7EB"}`,
                  transition: "all 0.2s",
                }}
              >
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

      {/* ── Step 0: Categories + Skills ── */}
      {step === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={labelSx}>Skill Categories</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat.id);
                return (
                  <Chip
                    key={cat.id}
                    label={cat.label}
                    icon={cat.icon}
                    onClick={() => handleCategoryToggle(cat.id)}
                    sx={{
                      cursor: "pointer", fontFamily: "Poppins", fontSize: "12px", fontWeight: 500,
                      bgcolor: active ? TEAL_BG : "#F9FAFB",
                      border: `1px solid ${active ? TEAL : "#E5E7EB"}`,
                      color: active ? TEAL : "#374151",
                      "& .MuiChip-icon": { color: active ? TEAL : "#9CA3AF" },
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: TEAL_BG, borderColor: TEAL },
                    }}
                  />
                );
              })}
            </Box>
            {selectedCategories.length === 0 && (
              <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#EF4444", mt: 0.75 }}>
                Select at least one category
              </Typography>
            )}
          </Box>

          <Box>
            <Typography sx={labelSx}>Required Skills</Typography>
            <Autocomplete
              multiple
              options={availableSkills}
              value={selectedSkills.map((s) => s.name)}
              onChange={(_, v) => handleSkillsChange(v)}
              disabled={selectedCategories.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={selectedCategories.length === 0 ? "Select categories first" : "Search and select skills…"}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{ bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, color: TEAL, fontFamily: "Poppins", fontSize: "11px" }}
                  />
                ))
              }
            />
            {selectedSkills.length === 0 && selectedCategories.length > 0 && (
              <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#EF4444", mt: 0.75 }}>
                Select at least one skill
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* ── Step 1: Assessment level + proficiency ── */}
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
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF", mt: 0.5 }}>
              Sets the difficulty of assessment questions
            </Typography>
          </Box>

          <Box>
            <Typography sx={labelSx}>Required Proficiency per Skill</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {selectedSkills.map((skill, idx) => (
                <Box
                  key={skill.name}
                  display="flex" alignItems="center" justifyContent="space-between"
                  sx={{
                    py: 1.25, px: 1.5,
                    bgcolor: idx % 2 === 0 ? "#FAFAFA" : "#fff",
                    borderRadius: idx === 0 ? "10px 10px 0 0" : idx === selectedSkills.length - 1 ? "0 0 10px 10px" : 0,
                    border: "1px solid #F3F4F6",
                    borderTop: idx === 0 ? "1px solid #F3F4F6" : "none",
                  }}
                >
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                    {skill.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating
                      value={skill.requiredLevel}
                      onChange={(_, v) => { if (v) setSelectedSkills((prev) => prev.map((s) => s.name === skill.name ? { ...s, requiredLevel: v } : s)); }}
                      max={5}
                      icon={<StarIcon sx={{ fontSize: 18, color: TEAL }} />}
                      emptyIcon={<StarIcon sx={{ fontSize: 18, color: "#E5E7EB" }} />}
                    />
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF", minWidth: 28 }}>
                      {skill.requiredLevel}/5
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Step 2: Pass threshold + summary ── */}
      {step === 2 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
              sx={{
                color: TEAL,
                "& .MuiSlider-thumb": { width: 20, height: 20 },
                "& .MuiSlider-valueLabel": { bgcolor: TEAL },
              }}
            />
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF" }}>
              Minimum score to pass this assessment
            </Typography>
          </Box>

          {/* Summary */}
          <Box sx={{ bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, borderRadius: "12px", p: 2 }}>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: TEAL, mb: 1.25, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Configuration Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Level</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>{assessmentLevel}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Skills</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>{selectedSkills.length} selected</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#6B7280" }}>Pass threshold</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#111827" }}>{passThreshold}%</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Footer buttons ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, pt: 2, borderTop: "1px solid #F3F4F6" }}>
        <Button
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
          startIcon={step > 0 ? <ArrowBackIcon sx={{ fontSize: 15 }} /> : undefined}
          sx={{
            fontFamily: "Poppins", fontWeight: 600, fontSize: "13px", textTransform: "none",
            color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "10px", px: 2.5,
            "&:hover": { bgcolor: "#F9FAFB" },
          }}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 ? !canNext0 : !canNext1}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", textTransform: "none",
              bgcolor: TEAL, borderRadius: "10px", px: 3, boxShadow: "none",
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
              bgcolor: TEAL, borderRadius: "10px", px: 3, boxShadow: "none",
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

export default TechnicalSkillsConfigForm;
