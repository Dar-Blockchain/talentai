import React, { useState, useMemo } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
  Typography,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import RepeatOutlined from "@mui/icons-material/RepeatOutlined";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CampaignIcon from "@mui/icons-material/Campaign";
import BugReportIcon from "@mui/icons-material/BugReport";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AppInput from "@/components/ui/AppInput";
import { ALL_SKILLS } from "@/constants/skills";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillTestConfig {
  skill: string;
  passingScore?: number;
  maxAttempts?: number;
}

interface Props {
  config: SkillTestConfig;
  onChange: (config: SkillTestConfig) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = "#8310FF";

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  development: { label: "Development", icon: CodeIcon, color: "#3B82F6" },
  web3:        { label: "Web3",        icon: AccountTreeIcon, color: "#8B5CF6" },
  ai:          { label: "AI",          icon: SmartToyIcon,   color: "#06B6D4" },
  marketing:   { label: "Marketing",   icon: CampaignIcon,   color: "#F59E0B" },
  qa:          { label: "QA",          icon: BugReportIcon,  color: "#EF4444" },
  business:    { label: "Business",    icon: BusinessCenterIcon, color: "#10B981" },
};

const CATEGORY_ORDER = ["development", "web3", "ai", "marketing", "qa", "business"];

// ─── Component ────────────────────────────────────────────────────────────────

const SkillTestForm: React.FC<Props> = ({ config, onChange }) => {
  const [skillSearch, setSkillSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    return CATEGORY_ORDER.map((catId) => ({
      catId,
      meta: CATEGORY_META[catId],
      skills: ALL_SKILLS.filter(
        (s) => s.category === catId && (!q || s.label.toLowerCase().includes(q))
      ),
    })).filter((g) => g.skills.length > 0);
  }, [skillSearch]);

  const totalVisible = filteredGroups.reduce((n, g) => n + g.skills.length, 0);

  // Find category of selected skill
  const selectedSkillCat = config.skill
    ? ALL_SKILLS.find((s) => s.label === config.skill)?.category
    : undefined;
  const selectedMeta = selectedSkillCat ? CATEGORY_META[selectedSkillCat] : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Skill Select ─────────────────────────────────────── */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Skill to assess
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#EF4444", fontWeight: 700, lineHeight: 1 }}>*</Typography>
        </Box>

        <FormControl fullWidth size="small">
          <Select
            value={config.skill}
            onChange={(e) => onChange({ ...config, skill: e.target.value as string })}
            onClose={() => setSkillSearch("")}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 340,
                  borderRadius: "12px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                  mt: 0.75,
                  overflow: "hidden",
                },
              },
              autoFocus: false,
            }}
            sx={{
              borderRadius: "10px",
              bgcolor: "#FAFAFA",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#C4B5FD" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PURPLE, borderWidth: 2 },
              "& .MuiSelect-select": { py: "10px" },
            }}
            renderValue={(val) => {
              if (!val) {
                return (
                  <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                    Choose a skill to test…
                  </Typography>
                );
              }
              const CatIcon = selectedMeta?.icon;
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  {CatIcon && selectedMeta && (
                    <Box sx={{
                      width: 26, height: 26, borderRadius: "7px",
                      bgcolor: `${selectedMeta.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <CatIcon sx={{ fontSize: 14, color: selectedMeta.color }} />
                    </Box>
                  )}
                  <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>
                    {val}
                  </Typography>
                  {selectedMeta && (
                    <Chip
                      label={selectedMeta.label}
                      size="small"
                      sx={{
                        height: 18, fontSize: "10px", fontWeight: 600,
                        bgcolor: `${selectedMeta.color}15`,
                        color: selectedMeta.color,
                        border: `1px solid ${selectedMeta.color}30`,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}
                </Box>
              );
            }}
          >
            {/* ── Sticky search bar ── */}
            <MenuItem
              disableRipple
              onKeyDown={(e) => e.stopPropagation()}
              sx={{
                position: "sticky", top: 0, zIndex: 2,
                bgcolor: "#fff", p: 1.25,
                borderBottom: "1px solid #F3F4F6",
                "&:hover": { bgcolor: "#fff" },
                "&.Mui-focusVisible": { bgcolor: "#fff" },
              }}
            >
              <TextField
                size="small" fullWidth autoFocus
                placeholder="Search skills…"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px", bgcolor: "#F8FAFC", fontSize: "13px",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#C4B5FD" },
                    "&.Mui-focused fieldset": { borderColor: PURPLE, borderWidth: 1.5 },
                  },
                  "& input": { py: "7px" },
                }}
              />
            </MenuItem>

            {/* ── Grouped skill options ── */}
            {filteredGroups.flatMap(({ catId, meta, skills }) => {
              const CatIcon = meta.icon;
              return [
                <ListSubheader
                  key={`header-${catId}`}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.75,
                    fontSize: "10px", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: meta.color,
                    bgcolor: `${meta.color}0D`,
                    lineHeight: "30px", px: 2,
                    borderTop: "1px solid #F3F4F6",
                  }}
                >
                  <CatIcon sx={{ fontSize: 13 }} />
                  {meta.label}
                </ListSubheader>,
                ...skills.map((s) => {
                  const isSelected = config.skill === s.label;
                  return (
                    <MenuItem
                      key={s.label}
                      value={s.label}
                      sx={{
                        fontSize: "13px",
                        color: isSelected ? meta.color : "#374151",
                        fontWeight: isSelected ? 700 : 400,
                        px: 2.5, py: "7px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        "&:hover": { bgcolor: `${meta.color}0D` },
                        "&.Mui-selected": {
                          bgcolor: `${meta.color}12`,
                          "&:hover": { bgcolor: `${meta.color}1A` },
                        },
                      }}
                    >
                      {s.label}
                      {isSelected && (
                        <CheckCircleOutlined sx={{ fontSize: 15, color: meta.color, ml: 1 }} />
                      )}
                    </MenuItem>
                  );
                }),
              ];
            })}

            {/* ── Empty state ── */}
            {totalVisible === 0 && (
              <MenuItem disabled sx={{ py: 3, justifyContent: "center" }}>
                <Box sx={{ textAlign: "center" }}>
                  <SearchOutlined sx={{ fontSize: 28, color: "#D1D5DB", mb: 0.5 }} />
                  <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                    No skills match &ldquo;{skillSearch}&rdquo;
                  </Typography>
                </Box>
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

      {/* ── Score + Attempts ─────────────────────────────────── */}
      <Box sx={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2,
        p: 2, borderRadius: "10px",
        bgcolor: "#F9FAFB", border: "1px solid #F3F4F6",
      }}>
        {/* Passing Score */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 1 }}>
            <EmojiEventsOutlined sx={{ fontSize: 14, color: "#F59E0B" }} />
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Passing Score
            </Typography>
          </Box>
          <AppInput
            label=""
            type="number"
            placeholder="e.g. 70"
            value={String(config.passingScore ?? "")}
            onChange={(e) =>
              onChange({
                ...config,
                passingScore: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", mt: 0.5 }}>
            Minimum % to pass
          </Typography>
        </Box>

        {/* Max Attempts */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 1 }}>
            <RepeatOutlined sx={{ fontSize: 14, color: "#3B82F6" }} />
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Max Attempts
            </Typography>
          </Box>
          <AppInput
            label=""
            type="number"
            placeholder="e.g. 3"
            value={String(config.maxAttempts ?? "")}
            onChange={(e) =>
              onChange({
                ...config,
                maxAttempts: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", mt: 0.5 }}>
            Leave empty for unlimited
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SkillTestForm;
