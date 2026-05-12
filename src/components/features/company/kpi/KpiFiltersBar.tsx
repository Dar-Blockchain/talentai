"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Paper, Chip, Divider, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import { BORDER, GRAY, GRAY2, LGRAY, NAVY, POSTS_DATA, T, T_DARK, WHITE } from "./kpiTokens";

const PERIODS = ["7j", "30j", "90j", "Trimestre", "Custom"];

const KpiFiltersBar: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const [period, setPeriod] = useState("30j");
  const [posts, setPosts] = useState<string[]>([]);
  const [recruiter, setRecruiter] = useState<string[]>([]);

  const postLabel = t("pages.kpi.post");
  const recruiterLabel = t("pages.kpi.recruiter");

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: "14px",
      px: { xs: 2, sm: 2.5 }, py: 1.5, mb: 3,
      display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 2 }, alignItems: "center",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <FilterListOutlined sx={{ fontSize: 17, color: T }} />
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.8rem", color: NAVY }}>
          {t("pages.kpi.filters")}
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, display: { xs: "none", sm: "block" } }} />

      <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
        {PERIODS.map(p => (
          <Chip key={p} label={p} size="small" onClick={() => setPeriod(p)} sx={{
            fontFamily: "Poppins", fontWeight: 600, fontSize: "0.7rem", height: 26,
            bgcolor: period === p ? T : LGRAY,
            color: period === p ? WHITE : GRAY,
            border: `1px solid ${period === p ? T : BORDER}`,
            cursor: "pointer", transition: "all 0.15s",
            "&:hover": { bgcolor: period === p ? T_DARK : "#F1F5F9" },
            "& .MuiChip-label": { px: 1.25 },
          }} />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", ml: { sm: "auto" } }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: "Poppins", fontSize: "0.75rem" }}>{postLabel}</InputLabel>
          <Select
            multiple value={posts} onChange={e => setPosts(e.target.value as string[])}
            input={<OutlinedInput label={postLabel} />}
            renderValue={s => s.length === 0 ? t("pages.kpi.all_posts") : `${s.length} sélectionné(s)`}
            sx={{ fontFamily: "Poppins", fontSize: "0.78rem", borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER } }}
          >
            {POSTS_DATA.map(p => (
              <MenuItem key={p.title} value={p.title} sx={{ fontFamily: "Poppins", fontSize: "0.78rem" }}>{p.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ fontFamily: "Poppins", fontSize: "0.75rem" }}>{recruiterLabel}</InputLabel>
          <Select
            multiple value={recruiter} onChange={e => setRecruiter(e.target.value as string[])}
            input={<OutlinedInput label={recruiterLabel} />}
            renderValue={s => s.join(", ")}
            sx={{ fontFamily: "Poppins", fontSize: "0.78rem", borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER } }}
          >
            {["Moi", "Équipe"].map(r => (
              <MenuItem key={r} value={r} sx={{ fontFamily: "Poppins", fontSize: "0.78rem" }}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default KpiFiltersBar;
