import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import { Briefcase as WorkOutlineOutlined, MapPin as LocationOnOutlined, Building2 as BusinessCenterOutlined, Calendar as CalendarTodayOutlined } from "lucide-react";
import { T, TL, TBG, TBRD, NAVY, fmtDate } from "../utils/constants";

interface JobHeaderCardProps {
  title: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  salary?: { min?: number; max?: number; currency?: string } | null;
  statusLabel: string;
  statusStyle: { bg: string; color: string; border: string };
  appliedAt?: string;
  appliedOnLabel: (date: string) => string;
}

const JobHeaderCard: React.FC<JobHeaderCardProps> = ({ title, location, employmentType, workMode, salary, statusLabel, statusStyle: sc, appliedAt, appliedOnLabel }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "12px", bgcolor: TBG, border: `1px solid ${TBRD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <WorkOutlineOutlined size={24} color={T} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
            <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY }}>{title}</Typography>
            <Chip label={statusLabel} size="small" sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
            {location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <LocationOnOutlined size={13} color="#9CA3AF" />
                <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>{location}</Typography>
              </Box>
            )}
            {employmentType && <Chip label={employmentType} size="small" sx={{ height: 20, fontSize: "0.67rem", bgcolor: "#F3F4F6", color: "#374151" }} />}
            {workMode && <Chip label={workMode} size="small" sx={{ height: 20, fontSize: "0.67rem", bgcolor: "#F3F4F6", color: "#374151" }} />}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, ml: "auto" }}>
              <CalendarTodayOutlined size={12} color="#9CA3AF" />
              <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{appliedOnLabel(fmtDate(appliedAt))}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {salary && (salary.min || salary.max) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BusinessCenterOutlined size={15} color="#9CA3AF" />
            <Typography sx={{ fontSize: "0.82rem", color: "#374151", fontWeight: 600 }}>
              {salary.min && salary.max ? `${salary.min} – ${salary.max}` : salary.min || salary.max} {salary.currency || ""}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  </Box>
);

export default JobHeaderCard;
