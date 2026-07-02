import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Divider, Typography } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import MicOutlined from "@mui/icons-material/MicOutlined";
import SectionCard from "@/components/ui/SectionCard";
import { LANG_META } from "@/modules/shared/constants/languages";
import { formatSalary } from '@/modules/company/posts/utils/postHelpers';
import { formatDate } from "@/utils/functions";
import SectionTitle from "./SectionTitle";

interface Props {
  jd: any;
  createdAt?: string;
  interviewLanguages: string[];
}

const OverviewCard: React.FC<Props> = ({ jd, createdAt, interviewLanguages }) => {
  const { t } = useTranslation("posts");

  return (
    <SectionCard>
      <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title={t("detail.details.overview")} />

      {/* Meta chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {jd.workMode && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 2, px: 1.5, py: 0.75 }}>
            <LocationOnOutlined sx={{ fontSize: 14, color: "#2563EB" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>{jd.workMode}</Typography>
          </Box>
        )}
        {jd.employmentType && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 2, px: 1.5, py: 0.75 }}>
            <WorkOutlined sx={{ fontSize: 14, color: "#7C3AED" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED" }}>{jd.employmentType}</Typography>
          </Box>
        )}
        {jd.salary && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 2, px: 1.5, py: 0.75 }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#16A34A" }}>{formatSalary(jd.salary)}</Typography>
          </Box>
        )}
        {createdAt && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, px: 1.5, py: 0.75 }}>
            <CalendarTodayOutlined sx={{ fontSize: 14, color: "#6B7280" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>{formatDate(createdAt)}</Typography>
          </Box>
        )}
      </Box>

      {/* Interview languages */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <MicOutlined sx={{ fontSize: 15, color: "#6B7280" }} />
          <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
            {t("detail.details.interview_languages")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75 }}>
          {interviewLanguages.map((code) => {
            const meta = LANG_META[code];
            if (!meta) return null;
            return (
              <Box key={code} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.4, borderRadius: "8px", bgcolor: "#F0FDFA", border: "1px solid #99F6E4" }}>
                <img src={`https://flagcdn.com/w40/${meta.flag}.png`} srcSet={`https://flagcdn.com/w80/${meta.flag}.png 2x`} width={20} height={14} alt={meta.label} style={{ borderRadius: 2, display: "block" }} />
                <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#0D9488" }}>{meta.label}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Description */}
      {jd.description && (
        <>
          <Divider sx={{ my: 2.5 }} />
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("detail.details.description")}</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.8 }}>{jd.description}</Typography>
        </>
      )}
    </SectionCard>
  );
};

export default OverviewCard;
