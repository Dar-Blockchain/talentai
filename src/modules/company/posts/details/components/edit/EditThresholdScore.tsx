import React from "react";
import { Box, Slider, Typography } from "@mui/material";
import TrackChangesOutlined from "@mui/icons-material/TrackChangesOutlined";
import { Controller, Control } from "react-hook-form";

import { TEAL } from "@/modules/company/posts/shared/constants";

interface Props {
  control: Control<any>;
}

const MARKS = [
  { value: 0,   label: "0%"   },
  { value: 50,  label: "50%"  },
  { value: 100, label: "100%" },
];

const EditThresholdScore: React.FC<Props> = ({ control }) => (
  <Box sx={{ mt: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <TrackChangesOutlined sx={{ fontSize: 16, color: TEAL }} />
      <Typography variant="subtitle2" sx={{ color: "rgba(84,98,116,1)", fontSize: "16px", fontWeight: 600 }}>
        Threshold Score
      </Typography>
    </Box>
    <Typography sx={{ fontSize: "12px", color: "rgba(84,98,116,0.7)", mb: 2 }}>
      Candidates scoring below this threshold are automatically flagged for review.
    </Typography>

    <Controller
      name="thresholdScore"
      control={control}
      render={({ field }) => {
        const score = field.value as number;
        const color = score >= 70 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Slider
                value={score}
                onChange={(_, v) => field.onChange(v)}
                min={0}
                max={100}
                step={5}
                marks={MARKS}
                sx={{
                  color,
                  "& .MuiSlider-thumb":     { width: 18, height: 18 },
                  "& .MuiSlider-markLabel": { fontSize: "11px", color: "#9CA3AF" },
                }}
              />
            </Box>
            <Box sx={{
              minWidth: 52, textAlign: "center",
              bgcolor: `${color}15`, border: `1px solid ${color}40`,
              borderRadius: 2, px: 1.5, py: 0.75,
            }}>
              <Typography sx={{ fontSize: "16px", fontWeight: 800, color }}>{score}%</Typography>
            </Box>
          </Box>
        );
      }}
    />
  </Box>
);

export default EditThresholdScore;
