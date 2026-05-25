import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Slider, Typography } from "@mui/material";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CheckOutlined from "@mui/icons-material/Check";
import SectionCard from "@/components/ui/SectionCard";
import AppButton from "@/components/ui/AppButton";
import { updatePost, fetchJobById } from "@/store/slices/postSlice";
import { AppDispatch } from "@/store/store";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  jobId: string;
  initial: number;
  canEdit: boolean;
  isDraft: boolean;
}

const ThresholdCard: React.FC<Props> = ({ jobId, initial, canEdit, isDraft }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState<number>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty    = value !== initial;
  const editable = canEdit && isDraft;

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updatePost({ jobId, jobData: { thresholdScore: value } })).unwrap();
      await dispatch(fetchJobById(jobId));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const color  = value >= 70 ? "#16A34A" : value >= 40 ? "#D97706" : "#DC2626";
  const label  = value >= 70 ? "High"    : value >= 40 ? "Medium"  : "Low";
  const bgGrad = value >= 70
    ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
    : value >= 40
    ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
    : "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)";

  return (
    <SectionCard>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>
            <TrackChangesOutlined sx={{ fontSize: 17 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Threshold Score
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.1 }}>
              Minimum interview score required to pass screening
            </Typography>
          </Box>
        </Box>
        <Box sx={{ background: bgGrad, border: `1.5px solid ${color}30`, borderRadius: 3, px: 2, py: 0.75, textAlign: "center", minWidth: 72 }}>
          <Typography sx={{ fontSize: "22px", fontWeight: 900, color, lineHeight: 1 }}>{value}%</Typography>
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Typography>
        </Box>
      </Box>

      {/* Explanation */}
      <Box sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2, px: 2, py: 1.25, mb: 2 }}>
        <Typography sx={{ fontSize: "12px", color: "#475569", lineHeight: 1.7 }}>
          Candidates who score <strong>below {value}%</strong> will be flagged as{" "}
          <Box component="span" sx={{ color: "#DC2626", fontWeight: 700 }}>Under Threshold</Box>.
          {!isDraft && (
            <Box component="span" sx={{ display: "block", mt: 0.75, color: "#D97706", fontWeight: 600 }}>
              ⚠ Published — threshold can only be changed while in draft.
            </Box>
          )}
        </Typography>
      </Box>

      {/* Zone labels */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, px: 0.5 }}>
        {[["Low", "#DC2626", "0–39%"], ["Medium", "#D97706", "40–69%"], ["High", "#16A34A", "70–100%"]].map(([z, c, range]) => (
          <Box key={z} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c }} />
            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#6B7280" }}>
              {z} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>{range}</span>
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Slider */}
      <Slider
        value={value}
        onChange={(_, v) => { setValue(v as number); setSaved(false); }}
        min={0} max={100} step={5}
        disabled={!editable || saving}
        sx={{
          color, height: 6,
          "& .MuiSlider-thumb": { width: 20, height: 20, boxShadow: `0 0 0 4px ${color}20`, "&:hover": { boxShadow: `0 0 0 6px ${color}30` } },
          "& .MuiSlider-track": { transition: "background-color 0.3s" },
          "& .MuiSlider-rail": { bgcolor: "#E5E7EB" },
        }}
      />

      {/* Footer */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>0%</Typography>
        {canEdit && (
          <AppButton
            label={saved ? "Saved" : "Save"}
            size="small"
            variant="outlined"
            loading={saving}
            disabled={!dirty || !isDraft}
            onClick={handleSave}
            startIcon={saved ? <CheckOutlined sx={{ fontSize: 13 }} /> : <SaveOutlined sx={{ fontSize: 13 }} />}
            sx={saved ? {
              borderColor: "#16A34A", color: "#16A34A",
              "&:hover": { bgcolor: "#F0FDF4", borderColor: "#16A34A" },
            } : undefined}
          />
        )}
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>100%</Typography>
      </Box>
    </SectionCard>
  );
};

export default ThresholdCard;
