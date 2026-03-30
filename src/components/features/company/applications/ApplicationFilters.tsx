import React from "react";
import { Box, TextField, InputAdornment, MenuItem, Select, Chip } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";

interface PostOption { id: string; title: string }

interface Props {
  nameSearch: string;
  skillSearch: string;
  postFilter: string;
  postOptions: PostOption[];
  resultCount: number;
  onNameChange: (v: string) => void;
  onSkillChange: (v: string) => void;
  onPostChange: (v: string) => void;
  onClear: () => void;
}

const inputSx = { fontSize: "0.82rem", borderRadius: "10px", height: 38 };
const selectSx = {
  fontSize: "0.82rem", height: 38, borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
};

const ApplicationFilters: React.FC<Props> = ({
  nameSearch, skillSearch, postFilter, postOptions, resultCount,
  onNameChange, onSkillChange, onPostChange, onClear,
}) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", p: 2, mb: 2.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
    <TextField
      placeholder="Search by candidate name…"
      size="small"
      value={nameSearch}
      onChange={(e) => onNameChange(e.target.value)}
      InputProps={{
        startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
        sx: inputSx,
      }}
      sx={{ flex: "1 1 180px", minWidth: 160, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
    />
    <TextField
      placeholder="Filter by skill…"
      size="small"
      value={skillSearch}
      onChange={(e) => onSkillChange(e.target.value)}
      InputProps={{
        startAdornment: <InputAdornment position="start"><CodeOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
        sx: inputSx,
      }}
      sx={{ flex: "1 1 160px", minWidth: 140, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
    />
    {postOptions.length > 0 && (
      <Select value={postFilter} onChange={(e) => onPostChange(e.target.value)} sx={{ ...selectSx, minWidth: 180, maxWidth: 240 }}>
        <MenuItem value="all" sx={{ fontSize: "0.82rem" }}>All Job Posts</MenuItem>
        {postOptions.map(({ id, title }) => (
          <MenuItem key={id} value={id} sx={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{title}</MenuItem>
        ))}
      </Select>
    )}
    {(nameSearch || skillSearch || postFilter !== "all") && (
      <Chip
        label={`${resultCount} result${resultCount !== 1 ? "s" : ""}`}
        size="small"
        onDelete={onClear}
        sx={{ height: 28, fontSize: "0.75rem", fontWeight: 600, bgcolor: "#F0FDFA", color: "#0D9488" }}
      />
    )}
  </Box>
);

export default ApplicationFilters;
