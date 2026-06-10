import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import { PostAssessmentData } from "../types";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./assessmentAtoms";
import AreaCoverageCard from "./coverage/AreaCoverageCard";

interface Props {
  coverage:             PostAssessmentData["coverage"];
  overallCoverageLabel: string;
}

const CoverageTab: React.FC<Props> = ({ coverage, overallCoverageLabel }) => {
  const areas = coverage?.areas || {};
  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>

      {coverage?.overall != null && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", pb: 0.5 }}>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.09em" }}>
            {overallCoverageLabel}
          </Typography>
          <Chip label={`${Math.round(coverage.overall)}%`} size="small"
            sx={{ bgcolor: TEAL_BG, color: TEAL, fontWeight: 800, fontSize: "0.73rem", height: 22, border: `1px solid ${TEAL_BORDER}` }} />
          {coverage.nextRecommendedArea && (
            <Chip
              label={`Next: ${coverage.nextRecommendedArea.replace(/_/g, " ")}`}
              size="small"
              icon={<TrendingUpOutlined style={{ fontSize: 10 }} />}
              sx={{ height: 22, fontSize: "0.66rem", fontWeight: 600, bgcolor: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE", textTransform: "capitalize",
                "& .MuiChip-label": { px: 0.75 }, "& .MuiChip-icon": { color: "#6D28D9 !important" } }} />
          )}
        </Box>
      )}

      {Object.entries(areas).map(([area, data]) => (
        <AreaCoverageCard key={area} area={area} data={data} />
      ))}

    </Box>
  );
};

export default CoverageTab;
