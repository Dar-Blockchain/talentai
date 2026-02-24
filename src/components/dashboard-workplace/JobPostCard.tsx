import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import StatusBadge from "@/components/dashboard-workplace/ui/StatusBadge";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

const CREATION_TYPE: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ai: { label: "AI Generated", color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  pipeline: { label: "Pipeline", color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  manual: { label: "Manual", color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

interface JobPostCardProps {
  job: any;
  onDelete: (id: string) => void;
  onCopyLink: (id: string) => void;
  onViewPassed: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const JobPostCard: React.FC<JobPostCardProps> = ({
  job,
  onDelete,
  onCopyLink,
  onViewPassed,
  onViewDetails,
}) => {
  const jd = job.jobDetails || {};
  const isDraft = job.status === "draft";
  const daysLeft = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const ctInfo = CREATION_TYPE[job.creationType] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ctInfo;

  const expiryChipColor = isExpired ? "#DC2626" : daysLeft !== null && daysLeft <= 3 ? "#D97706" : TEAL;
  const expiryChipBg = isExpired ? "#FEF2F2" : daysLeft !== null && daysLeft <= 3 ? "#FFFBEB" : TEAL_BG;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        transition: "all 0.15s",
        "&:hover": { borderColor: TEAL_BORDER, boxShadow: "0 4px 20px rgba(13,148,136,0.08)" },
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: 3, bgcolor: isDraft ? "#9CA3AF" : isExpired ? "#DC2626" : TEAL }} />

      <Box sx={{ p: 2.5 }}>
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                {jd.title || "Untitled Position"}
              </Typography>
              {isDraft ? (
                <StatusBadge status="paused" label="Draft" size="sm" />
              ) : isExpired ? (
                <StatusBadge status="error" label="Expired" size="sm" />
              ) : (
                <StatusBadge status="active" label="Active" size="sm" />
              )}
            </Box>

            {/* Meta chips */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Chip
                icon={<CtIcon sx={{ fontSize: 12 }} />}
                label={ctInfo.label}
                size="small"
                sx={{ fontSize: "10px", fontWeight: 600, height: 20, color: ctInfo.color, bgcolor: ctInfo.bg, border: `1px solid ${ctInfo.color}30` }}
              />
              {jd.workMode && (
                <Chip
                  icon={<LocationOnOutlined sx={{ fontSize: 11 }} />}
                  label={jd.workMode}
                  size="small"
                  sx={{ fontSize: "10px", height: 20, color: "#2563EB", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE" }}
                />
              )}
              {jd.employmentType && (
                <Chip
                  label={jd.employmentType}
                  size="small"
                  sx={{ fontSize: "10px", height: 20, color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB" }}
                />
              )}
              {jd.salary?.min && (
                <Chip
                  icon={<AttachMoneyOutlined sx={{ fontSize: 11 }} />}
                  label={`${jd.salary.currency || "USD"} ${jd.salary.min.toLocaleString()}–${jd.salary.max?.toLocaleString() || "?"}`}
                  size="small"
                  sx={{ fontSize: "10px", height: 20, color: "#16A34A", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}
                />
              )}
            </Box>
          </Box>

          {/* Right meta */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
            {job.createdAt && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{fmtDate(job.createdAt)}</Typography>
              </Box>
            )}
            {daysLeft !== null && (
              <Chip
                label={isExpired ? "Expired" : `${daysLeft}d left`}
                size="small"
                sx={{ fontSize: "10px", fontWeight: 700, height: 20, color: expiryChipColor, bgcolor: expiryChipBg, border: `1px solid ${expiryChipColor}40` }}
              />
            )}
          </Box>
        </Box>

        {/* Description */}
        {jd.description && (
          <Typography
            sx={{
              fontSize: "12px",
              color: "#6B7280",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 2,
            }}
          >
            {jd.description}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            size="small"
            startIcon={<OpenInNewOutlined sx={{ fontSize: 14 }} />}
            onClick={() => onViewDetails(job._id)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "12px",
              borderRadius: 2,
              color: "#2563EB",
              border: "1px solid #BFDBFE",
              bgcolor: "#EFF6FF",
              "&:hover": { bgcolor: "#DBEAFE" },
            }}
          >
            View Details
          </Button>

          {!isDraft && (
            <>
              <Button
                size="small"
                startIcon={<EmojiEventsOutlined sx={{ fontSize: 14 }} />}
                onClick={() => onViewPassed(job._id)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "12px",
                  borderRadius: 2,
                  color: TEAL,
                  border: `1px solid ${TEAL_BORDER}`,
                  bgcolor: TEAL_BG,
                  "&:hover": { bgcolor: "#CCFBF1" },
                }}
              >
                Passed Interview
              </Button>
              <Tooltip title={isExpired ? "Link expired" : "Copy interview link"}>
                <span>
                  <Button
                    size="small"
                    startIcon={<ContentCopyOutlined sx={{ fontSize: 14 }} />}
                    onClick={() => onCopyLink(job._id)}
                    disabled={isExpired}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      borderRadius: 2,
                      color: "#16A34A",
                      border: "1px solid #BBF7D0",
                      bgcolor: "#F0FDF4",
                      "&:hover": { bgcolor: "#DCFCE7" },
                      "&.Mui-disabled": { color: "#9CA3AF", border: "1px solid #E5E7EB", bgcolor: "#F9FAFB" },
                    }}
                  >
                    Copy Link
                  </Button>
                </span>
              </Tooltip>
            </>
          )}

          <Box sx={{ ml: "auto" }}>
            <Tooltip title="Delete post">
              <IconButton
                size="small"
                onClick={() => onDelete(job._id)}
                sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" }, border: "1px solid #FECACA", borderRadius: 2 }}
              >
                <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default JobPostCard;
