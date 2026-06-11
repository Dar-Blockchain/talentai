import React from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { scoreStyle } from "@/modules/company/assessment/constants";
import { AreaData } from "../../types";
import { Bar } from "../assessmentAtoms";

interface Props {
  area: string;
  data: AreaData;
}

const AreaCoverageCard: React.FC<Props> = ({ area, data }) => {
  const pct = data.percentage ?? 0;
  const ac  = scoreStyle(pct);
  return (
    <Box sx={{ borderRadius: "16px", border: "1px solid #F3F4F6", overflow: "hidden" }}>
      <Box sx={{ height: 3, bgcolor: ac.color }} />
      <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#1F2937", textTransform: "capitalize" }}>
              {area.replace(/_/g, " ")}
            </Typography>
            {data.completed && <CheckCircleOutlined sx={{ fontSize: 14, color: "#10B981" }} />}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            {data.weight > 0 && (
              <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", fontWeight: 500 }}>{data.weight}% weight</Typography>
            )}
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: ac.color }}>{pct}%</Typography>
          </Box>
        </Box>

        <Bar value={pct} color={ac.color} height={7} />

        {data.questionsAsked > 0 && (
          <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mt: 1, fontWeight: 500 }}>
            {data.questionsAsked} question{data.questionsAsked !== 1 ? "s" : ""} asked
          </Typography>
        )}

        {(data.indicators?.length ?? 0) > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 0.75 }}>
            {data.indicators.slice(0, 5).map((ind, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, mt: "5px", bgcolor: ind.covered ? "#10B981" : "#EF4444" }} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.6 }}>
                  {ind.evidence?.[0] || ind.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AreaCoverageCard;
