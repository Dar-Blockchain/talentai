import { memo, useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";

const TEAL = "#0D9488";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

const CREATION_TYPE: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ai:       { label: "AI",       color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  pipeline: { label: "Pipeline", color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  manual:   { label: "Manual",   color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  active:  { label: "Open",   color: "#059669", bg: "#ECFDF5", bar: "#10B981" },
  open:    { label: "Open",   color: "#059669", bg: "#ECFDF5", bar: "#10B981" },
  draft:   { label: "Draft",  color: "#D97706", bg: "#FFFBEB", bar: "#F59E0B" },
  closed:  { label: "Closed", color: "#DC2626", bg: "#FEF2F2", bar: "#EF4444" },
  expired: { label: "Expired",color: "#DC2626", bg: "#FEF2F2", bar: "#EF4444" },
};

interface JobPostCardProps {
  job: any;
  index?: number;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  canDelete?: boolean;
}

const JobPostCard = memo<JobPostCardProps>(({ job, index = 0, onDelete, onViewDetails, canDelete = true }) => {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const jd       = job.jobDetails || {};
  const isDraft  = job.status === "draft";
  const daysLeft = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const ctInfo   = CREATION_TYPE[job.creationType] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ctInfo;

  const statusKey   = isDraft ? "draft" : isExpired ? "expired" : job.status === "closed" ? "closed" : "active";
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.active;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor(null);
    const link = `${window.location.origin}/interview/hr?jobId=${job._id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      style={{ height: "100%" }}
    >
      <Box
        onClick={() => onViewDetails(job._id)}
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.15s",
          "&:hover": {
            borderColor: `${TEAL}40`,
            boxShadow: `0 4px 16px rgba(13,148,136,0.08)`,
            transform: "translateY(-1px)",
          },
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 3, bgcolor: statusStyle.bar, flexShrink: 0 }} />

        <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", gap: 1.25, flex: 1 }}>

          {/* ── Header row ── */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            {/* Icon */}
            <Box sx={{
              width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
              bgcolor: `${TEAL}0F`, border: `1px solid ${TEAL}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <WorkOutlineOutlined sx={{ fontSize: 16, color: TEAL }} />
            </Box>

            {/* Title + badges */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.3, mb: 0.4 }}>
                {jd.title || "Untitled Position"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* Creation type badge */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.4,
                  px: "6px", py: "2px", borderRadius: "5px",
                  bgcolor: ctInfo.bg, border: `1px solid ${ctInfo.color}28`,
                }}>
                  <CtIcon sx={{ fontSize: 9, color: ctInfo.color }} />
                  <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: ctInfo.color, lineHeight: 1 }}>
                    {ctInfo.label}
                  </Typography>
                </Box>

                {/* Status badge with dot */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.4,
                  px: "6px", py: "2px", borderRadius: "5px",
                  bgcolor: statusStyle.bg, border: `1px solid ${statusStyle.color}28`,
                }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: statusStyle.bar, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: statusStyle.color, lineHeight: 1 }}>
                    {statusStyle.label}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 3-dot menu */}
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
              sx={{
                color: "#9CA3AF", borderRadius: "6px", p: 0.3, flexShrink: 0,
                "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
              }}
            >
              <MoreVertOutlined sx={{ fontSize: 15 }} />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={(e: any) => { e.stopPropagation?.(); setMenuAnchor(null); }}
              onClick={(e) => e.stopPropagation()}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                  minWidth: 188,
                  mt: 0.75,
                  border: "1px solid #E5E7EB",
                  p: 0.75,
                  overflow: "visible",
                },
              }}
            >
              {/* Header label */}
              <Box sx={{ px: 1.5, pt: 0.5, pb: 1 }}>
                <Typography noWrap sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {jd.title || "Post actions"}
                </Typography>
              </Box>

              <MenuItem
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); router.push(`/company/posts/${job._id}`); }}
                sx={{
                  gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25,
                  "&:hover": { bgcolor: "#F5F5F5", "& .menu-icon-box": { bgcolor: "#E9E9E9" } },
                }}
              >
                <Box className="menu-icon-box" sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                  <OpenInNewOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>View Details</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>Open full post page</Typography>
                </Box>
              </MenuItem>

              {!isDraft && (
                <MenuItem
                  onClick={handleCopyLink}
                  sx={{
                    gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25,
                    "&:hover": { bgcolor: "#F5F5F5", "& .menu-icon-box": { bgcolor: "#E9E9E9" } },
                  }}
                >
                  <Box className="menu-icon-box" sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                    <ContentCopyOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                      {copied ? "Copied!" : "Share Link"}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>Share with candidates</Typography>
                  </Box>
                </MenuItem>
              )}

              <Box sx={{ my: 0.75, height: "1px", bgcolor: "#F3F4F6", mx: 0.5 }} />

              <MenuItem
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onDelete(job._id); }}
                sx={{
                  gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25,
                  "&:hover": { bgcolor: "#F5F5F5", "& .menu-icon-box": { bgcolor: "#E9E9E9" } },
                }}
              >
                <Box className="menu-icon-box" sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                  <DeleteOutlineOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", lineHeight: 1.2 }}>Delete Post</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>This action is permanent</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>

          {/* ── Meta pills ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            {jd.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <LocationOnOutlined sx={{ fontSize: 10, color: "#9CA3AF" }} />
                <Typography noWrap sx={{ fontSize: "10.5px", color: "#6B7280", maxWidth: 100 }}>{jd.location}</Typography>
              </Box>
            )}
            {jd.employmentType && (
              <Typography sx={{ fontSize: "10px", color: "#6B7280", bgcolor: "#F3F4F6", px: 0.75, py: 0.15, borderRadius: "4px" }}>
                {jd.employmentType}
              </Typography>
            )}
            {jd.workMode && (
              <Typography sx={{ fontSize: "10px", color: "#6B7280", bgcolor: "#F3F4F6", px: 0.75, py: 0.15, borderRadius: "4px" }}>
                {jd.workMode}
              </Typography>
            )}
          </Box>

          {/* ── Description ── */}
          {jd.description && (
            <Typography sx={{
              fontSize: "11px", color: "#6B7280", lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {jd.description}
            </Typography>
          )}

          {/* ── Footer ── */}
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            pt: 1, borderTop: "1px solid #F3F4F6", mt: "auto",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              {job.createdAt && (
                <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{fmtDate(job.createdAt)}</Typography>
              )}
              {daysLeft !== null && !isExpired && (
                <Typography sx={{
                  fontSize: "9.5px", fontWeight: 700,
                  color: daysLeft <= 3 ? "#D97706" : TEAL,
                  bgcolor: daysLeft <= 3 ? "#FFFBEB" : `${TEAL}10`,
                  px: 0.6, py: 0.1, borderRadius: "4px",
                }}>
                  {daysLeft}d left
                </Typography>
              )}
              {isExpired && (
                <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: "#DC2626", bgcolor: "#FEF2F2", px: 0.6, py: 0.1, borderRadius: "4px" }}>
                  Expired
                </Typography>
              )}
              {job.expirationDate && !isExpired && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <AccessTimeOutlined sx={{ fontSize: 9, color: "#D1D5DB" }} />
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{fmtDate(job.expirationDate)}</Typography>
                </Box>
              )}
            </Box>

            {!isDraft && (
              <Tooltip title={copied ? "Copied!" : "Share Link"} placement="top">
                <IconButton
                  size="small"
                  onClick={handleCopyLink}
                  sx={{
                    p: 0.4, borderRadius: "6px",
                    color: copied ? "#059669" : "#9CA3AF",
                    bgcolor: copied ? "#ECFDF5" : "transparent",
                    border: "1px solid",
                    borderColor: copied ? "#A7F3D0" : "#E5E7EB",
                    transition: "all 0.18s",
                    "&:hover": { color: "#059669", bgcolor: "#F0FDF4", borderColor: "#A7F3D0" },
                  }}
                >
                  <ContentCopyOutlined sx={{ fontSize: 11 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

JobPostCard.displayName = "JobPostCard";

export default JobPostCard;
