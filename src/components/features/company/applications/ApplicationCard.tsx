import React from "react";
import { Box, Typography, Avatar, Chip, Divider } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardIos";

const AVATAR_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  applied:     { bg: "#EFF6FF", color: "#2563EB" },
  pending:     { bg: "#FFFBEB", color: "#D97706" },
  shortlisted: { bg: "#F0FDF4", color: "#16A34A" },
  accepted:    { bg: "#F0FDFA", color: "#0D9488" },
  rejected:    { bg: "#FEF2F2", color: "#DC2626" },
  withdrawn:   { bg: "#F3F4F6", color: "#6B7280" },
};

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

interface Props {
  app: any;
  index: number;
  onClick: () => void;
}

const ApplicationCard: React.FC<Props> = ({ app, index, onClick }) => {
  const profile = app.profile || {};
  const cv = app.cvAnalysis || {};
  const name = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : cv.name || "Candidate";
  const title = cv.title || "";
  const skills: string[] = cv.skills || profile.skills?.map((s: any) => s.name) || [];
  const cvScore = app.matchScore ?? cv.analysisScore ?? null;
  const postTitle = app.post?.jobDetails?.title || "—";
  const status = (app.status || "applied").toLowerCase();
  const sc = STATUS_STYLE[status] ?? STATUS_STYLE.applied;
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB",
        overflow: "hidden", display: "flex", flexDirection: "column",
        cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)", borderColor: "#D1FAE5" },
      }}
    >
      {/* Top accent */}
      <Box sx={{ height: 3, bgcolor: sc.color, opacity: 0.6 }} />

      {/* Header */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: avatarColor, fontSize: "15px", fontWeight: 700, flexShrink: 0 }}>
          {getInitials(name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </Typography>
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              size="small"
              sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, flexShrink: 0 }}
            />
          </Box>
          {title && (
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </Typography>
          )}
        </Box>
        {cvScore != null && (
          <Box sx={{
            flexShrink: 0, textAlign: "center", borderRadius: "10px", px: 1.5, py: 0.75,
            bgcolor: cvScore >= 70 ? "rgba(5,150,105,0.08)" : cvScore >= 50 ? "rgba(217,119,6,0.08)" : "rgba(220,38,38,0.08)",
          }}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1, color: cvScore >= 70 ? "#059669" : cvScore >= 50 ? "#D97706" : "#DC2626" }}>
              {cvScore}%
            </Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF", fontWeight: 600 }}>CV Score</Typography>
          </Box>
        )}
      </Box>

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.25, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {skills.slice(0, 5).map((s: string) => (
              <Chip key={s} label={s} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#374151" }} />
            ))}
            {skills.length > 5 && (
              <Chip label={`+${skills.length - 5}`} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: "#F0FDFA", color: "#0D9488" }} />
            )}
          </Box>
        </>
      )}

      <Divider />

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#FAFAFA" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <WorkOutlineOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {postTitle}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{fmtDate(app.appliedAt || app.createdAt)}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, color: "#0D9488" }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>Details</Typography>
          <ArrowForwardOutlined sx={{ fontSize: 11 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default ApplicationCard;
