import React, { useState } from "react";
import {
  Box, TextField, InputAdornment, MenuItem, Select, Chip, Button,
  Drawer, Typography, Slider, Divider, IconButton, Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import BookmarkBorderOutlined from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkOutlined from "@mui/icons-material/BookmarkOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";

export interface FilterState {
  nameSearch: string;
  skillSearch: string;
  postFilter: string;
  scoreMin: number;
  scoreMax: number;
  dateFrom: string;
  dateTo: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
}

export const DEFAULT_FILTERS: FilterState = {
  nameSearch: "",
  skillSearch: "",
  postFilter: "all",
  scoreMin: 0,
  scoreMax: 100,
  dateFrom: "",
  dateTo: "",
};

interface PostOption { id: string; title: string }

interface Props {
  filters: FilterState;
  postOptions: PostOption[];
  resultCount: number;
  presets: FilterPreset[];
  onChange: (f: FilterState) => void;
  onClear: () => void;
  onSavePreset: (name: string, filters: FilterState) => void;
  onDeletePreset: (id: string) => void;
  onApplyPreset: (filters: FilterState) => void;
}


const inputSx = { fontSize: "0.82rem", borderRadius: "10px", height: 38 };
const selectSx = {
  fontSize: "0.82rem", height: 38, borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
};
const labelSx = { fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", mb: 0.75 };

function isDefaultFilters(f: FilterState) {
  return (
    !f.nameSearch && !f.skillSearch &&
    f.postFilter === "all" &&
    f.scoreMin === 0 && f.scoreMax === 100 &&
    !f.dateFrom && !f.dateTo
  );
}

function countActiveFilters(f: FilterState) {
  let n = 0;
  if (f.nameSearch) n++;
  if (f.skillSearch) n++;
  if (f.postFilter !== "all") n++;
  if (f.scoreMin > 0 || f.scoreMax < 100) n++;
  if (f.dateFrom || f.dateTo) n++;
  return n;
}

const ApplicationFilters: React.FC<Props> = ({
  filters, postOptions, resultCount, presets,
  onChange, onClear, onSavePreset, onDeletePreset, onApplyPreset,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);

  const activeCount = countActiveFilters(filters);
  const hasFilters = activeCount > 0;

  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const handleSave = () => {
    const name = presetName.trim();
    if (!name) return;
    onSavePreset(name, filters);
    setPresetName("");
    setSavingPreset(false);
  };

  return (
    <>
      {/* ── Top bar ── */}
      <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", p: 2, mb: 2.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
        {/* Name search */}
        <TextField
          placeholder="Search by candidate name…"
          size="small"
          value={filters.nameSearch}
          onChange={(e) => set({ nameSearch: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
            sx: inputSx,
          }}
          sx={{ flex: "1 1 180px", minWidth: 160, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
        />

        {/* Skill search */}
        <TextField
          placeholder="Filter by skill…"
          size="small"
          value={filters.skillSearch}
          onChange={(e) => set({ skillSearch: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start"><CodeOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
            sx: inputSx,
          }}
          sx={{ flex: "1 1 160px", minWidth: 140, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
        />

        {/* Job post */}
        {postOptions.length > 0 && (
          <Select
            value={filters.postFilter}
            onChange={(e) => set({ postFilter: e.target.value })}
            displayEmpty
            renderValue={(val) => {
              const match = postOptions.find((p) => p.id === val);
              const label = match ? match.title : "All Job Posts";
              return (
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                  {label}
                </Box>
              );
            }}
            sx={{ ...selectSx, flex: "1 1 160px", minWidth: 140, maxWidth: 220 }}
            MenuProps={{
              PaperProps: {
                sx: { maxWidth: 320, "& .MuiMenuItem-root": { whiteSpace: "normal", wordBreak: "break-word" } },
              },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: "0.82rem" }}>All Job Posts</MenuItem>
            {postOptions.map(({ id, title }) => (
              <MenuItem key={id} value={id} sx={{ fontSize: "0.82rem" }}>{title}</MenuItem>
            ))}
          </Select>
        )}

        {/* Preset chips */}
        {presets.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            size="small"
            icon={<BookmarkOutlined sx={{ fontSize: "14px !important" }} />}
            onClick={() => { onApplyPreset(p.filters); setDrawerOpen(false); }}
            sx={{ height: 28, fontSize: "0.75rem", fontWeight: 600, bgcolor: "#F5F3FF", color: "#7C3AED", cursor: "pointer" }}
          />
        ))}

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          {hasFilters && (
            <Chip
              label={`${resultCount} result${resultCount !== 1 ? "s" : ""}`}
              size="small"
              onDelete={onClear}
              sx={{ height: 28, fontSize: "0.75rem", fontWeight: 600, bgcolor: "#F0FDFA", color: "#0D9488" }}
            />
          )}
          <Button
            size="small"
            startIcon={<TuneOutlined sx={{ fontSize: 16 }} />}
            onClick={() => setDrawerOpen(true)}
            variant={activeCount > 2 ? "contained" : "outlined"}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              borderRadius: "10px",
              height: 38,
              px: 2,
              borderColor: "#E5E7EB",
              color: activeCount > 2 ? "#fff" : "#374151",
              bgcolor: activeCount > 2 ? "#0D9488" : "transparent",
              "&:hover": { bgcolor: activeCount > 2 ? "#0B8073" : "#F9FAFB", borderColor: "#D1D5DB" },
            }}
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        </Box>
      </Box>

      {/* ── Advanced filters drawer ── */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100vw", sm: 380 }, p: 0 } }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>Advanced Filters</Typography>
            {activeCount > 0 && (
              <Typography variant="caption" sx={{ color: "#6B7280" }}>{activeCount} filter{activeCount !== 1 ? "s" : ""} active</Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: "#6B7280" }}>
            <CloseOutlined sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", flex: 1 }}>

          {/* Score range */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={labelSx}>CV Score Range</Typography>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#0D9488" }}>
                {filters.scoreMin}% — {filters.scoreMax}%
              </Typography>
            </Box>
            <Slider
              value={[filters.scoreMin, filters.scoreMax]}
              onChange={(_, v) => { const [min, max] = v as number[]; set({ scoreMin: min, scoreMax: max }); }}
              min={0} max={100} step={5}
              sx={{
                color: "#0D9488",
                "& .MuiSlider-thumb": { width: 16, height: 16 },
                "& .MuiSlider-track": { height: 4 },
                "& .MuiSlider-rail": { height: 4, bgcolor: "#E5E7EB" },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#9CA3AF" }}>0%</Typography>
              <Typography variant="caption" sx={{ color: "#9CA3AF" }}>100%</Typography>
            </Box>
          </Box>

          <Divider />

          {/* Date range */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
              <Typography sx={labelSx}>Application Date</Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <DatePicker
                  label="From"
                  value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
                  onChange={(v: Dayjs | null) => set({ dateFrom: v ? v.format("YYYY-MM-DD") : "" })}
                  maxDate={filters.dateTo ? dayjs(filters.dateTo) : undefined}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        flex: 1,
                        "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.82rem", height: 38 },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                        "& .MuiInputLabel-root": { fontSize: "0.82rem" },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="To"
                  value={filters.dateTo ? dayjs(filters.dateTo) : null}
                  onChange={(v: Dayjs | null) => set({ dateTo: v ? v.format("YYYY-MM-DD") : "" })}
                  minDate={filters.dateFrom ? dayjs(filters.dateFrom) : undefined}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        flex: 1,
                        "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.82rem", height: 38 },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                        "& .MuiInputLabel-root": { fontSize: "0.82rem" },
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </LocalizationProvider>

          <Divider />

          {/* Saved presets */}
          <Box>
            <Typography sx={labelSx}>Saved Presets</Typography>
            {presets.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}>No saved presets yet</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
                {presets.map((p) => (
                  <Box key={p.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.25, borderRadius: "10px", border: "1px solid #E5E7EB", bgcolor: "#F9FAFB" }}>
                    <BookmarkOutlined sx={{ fontSize: 16, color: "#7C3AED", flexShrink: 0 }} />
                    <Typography sx={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{p.name}</Typography>
                    <Button
                      size="small"
                      onClick={() => { onApplyPreset(p.filters); setDrawerOpen(false); }}
                      sx={{ textTransform: "none", fontSize: "0.72rem", fontWeight: 600, color: "#0D9488", minWidth: 0, px: 1 }}
                    >
                      Apply
                    </Button>
                    <Tooltip title="Delete preset">
                      <IconButton size="small" onClick={() => onDeletePreset(p.id)} sx={{ color: "#9CA3AF", "&:hover": { color: "#EF4444" } }}>
                        <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}

            {/* Save current as preset */}
            {savingPreset ? (
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Preset name…"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setSavingPreset(false); }}
                  autoFocus
                  InputProps={{ sx: { ...inputSx, fontSize: "0.8rem" } }}
                  sx={{ flex: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSave}
                  disabled={!presetName.trim()}
                  sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0D9488", "&:hover": { bgcolor: "#0B8073" }, borderRadius: "10px", px: 2, height: 38 }}
                >
                  Save
                </Button>
                <IconButton size="small" onClick={() => setSavingPreset(false)} sx={{ color: "#9CA3AF" }}>
                  <CloseOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <Button
                size="small"
                startIcon={<BookmarkBorderOutlined sx={{ fontSize: 16 }} />}
                onClick={() => setSavingPreset(true)}
                disabled={isDefaultFilters(filters)}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem", color: "#7C3AED", mt: 0.5 }}
              >
                Save current filters as preset
              </Button>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB", display: "flex", gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => { onClear(); setDrawerOpen(false); }}
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#E5E7EB", color: "#374151", borderRadius: "10px", "&:hover": { bgcolor: "#F9FAFB" } }}
          >
            Clear all
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDrawerOpen(false)}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#0D9488", color: "#fff", "&:hover": { bgcolor: "#0B8073" }, borderRadius: "10px" }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default ApplicationFilters;
