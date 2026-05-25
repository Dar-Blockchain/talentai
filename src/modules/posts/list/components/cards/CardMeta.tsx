import React from "react";
import { Box, Typography } from "@mui/material";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";

interface Props {
  location?: string;
  employmentType?: string;
  workMode?: string;
  description?: string;
}

const CardMeta: React.FC<Props> = ({ location, employmentType, workMode, description }) => (
  <>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      {location && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <LocationOnOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
          <Typography noWrap sx={{ fontSize: "12px", color: "#6B7280", maxWidth: 120 }}>{location}</Typography>
        </Box>
      )}
      {employmentType && (
        <Typography sx={{ fontSize: "11px", color: "#6B7280", bgcolor: "#F3F4F6", px: 1, py: 0.3, borderRadius: "5px" }}>{employmentType}</Typography>
      )}
      {workMode && (
        <Typography sx={{ fontSize: "11px", color: "#6B7280", bgcolor: "#F3F4F6", px: 1, py: 0.3, borderRadius: "5px" }}>{workMode}</Typography>
      )}
    </Box>

    {description && (
      <Typography sx={{ fontSize: "12.5px", color: "#6B7280", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {description}
      </Typography>
    )}
  </>
);

export default CardMeta;
