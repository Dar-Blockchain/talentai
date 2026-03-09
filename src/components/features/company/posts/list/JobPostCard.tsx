import React, { memo, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";

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
  ai:       { label: "AI Generated", color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  pipeline: { label: "Pipeline",     color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  manual:   { label: "Manual",       color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open:    { label: "Open",   color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  active:  { label: "Open",   color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  draft:   { label: "Draft",  color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
  closed:  { label: "Closed", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  expired: { label: "Closed", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
};

interface JobPostCardProps {
  job: any;
  index?: number;
  onDelete: (id: string) => void;
  onCopyLink: (id: string) => void;
  onViewPassed: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const JobPostCard = memo<JobPostCardProps>(({ job, index = 0, onDelete, onViewDetails }) => {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const jd       = job.jobDetails || {};
  const isDraft  = job.status === "draft";
  const daysLeft = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const ctInfo   = CREATION_TYPE[job.creationType] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ctInfo;

  const statusKey    = isDraft ? "draft" : isExpired ? "expired" : "active";
  const statusStyle  = STATUS_STYLES[statusKey];

  const expiryColor  = isExpired ? "#DC2626" : daysLeft !== null && daysLeft <= 3 ? "#D97706" : TEAL;
  const expiryBg     = isExpired ? "#FEF2F2" : daysLeft !== null && daysLeft <= 3 ? "#FFFBEB" : TEAL_BG;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      style={{ height: "100%" }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          transition: "all 0.18s",
          "&:hover": {
            borderColor: TEAL_BORDER,
            boxShadow: "0 4px 20px rgba(13,148,136,0.10)",
            transform: "translateY(-2px)",
          },
          cursor: "pointer",
        }}
        onClick={() => onViewDetails(job._id)}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 42, height: 42, borderRadius: 2,
              bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WorkOutlineOutlined sx={{ fontSize: 20, color: TEAL }} />
          </Box>

          {/* Title + creation type */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3, mb: 0.5 }}
              noWrap
            >
              {jd.title || "Untitled Position"}
            </Typography>
            <Chip
              icon={<CtIcon sx={{ fontSize: 11 }} />}
              label={ctInfo.label}
              size="small"
              sx={{
                fontSize: "10px", fontWeight: 600, height: 20,
                color: ctInfo.color, bgcolor: ctInfo.bg,
                border: `1px solid ${ctInfo.color}30`,
              }}
            />
          </Box>

          {/* 3-dot menu */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: 1.5, flexShrink: 0 }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={(e: any) => { e.stopPropagation?.(); setMenuAnchor(null); }}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 150, mt: 0.5 } }}
          >
            <MenuItem
              onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); router.push(`/company/posts/${job._id}`); }}
              sx={{ gap: 1, fontSize: "13px", fontWeight: 600 }}
            >
              <ListItemIcon sx={{ minWidth: "auto", color: TEAL }}>
                <ChevronRightOutlined sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="View Details" primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }} />
            </MenuItem>
            <MenuItem
              onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onDelete(job._id); }}
              sx={{ gap: 1, color: "#EF4444", fontSize: "13px", fontWeight: 600, "&:hover": { bgcolor: "#FEF2F2" } }}
            >
              <ListItemIcon sx={{ minWidth: "auto", color: "#EF4444" }}>
                <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }} />
            </MenuItem>
          </Menu>
        </Box>

        {/* Description */}
        {jd.description && (
          <Typography
            sx={{
              fontSize: "12px", color: "#6B7280", lineHeight: 1.6,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
              flex: 1,
            }}
          >
            {jd.description}
          </Typography>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            pt: 1.5, borderTop: "1px solid #F3F4F6",
          }}
        >
          {/* Status */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 7, height: 7, borderRadius: "50%",
                bgcolor: statusStyle.dot,
              }}
            />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: statusStyle.color }}>
              {statusStyle.label}
            </Typography>
          </Box>

          {/* Date / days left */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {daysLeft !== null && !isExpired && (
              <Chip
                label={`${daysLeft}d left`}
                size="small"
                sx={{
                  fontSize: "10px", fontWeight: 700, height: 20,
                  color: expiryColor, bgcolor: expiryBg,
                  border: `1px solid ${expiryColor}40`,
                }}
              />
            )}
            {job.createdAt && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{fmtDate(job.createdAt)}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

JobPostCard.displayName = "JobPostCard";

export default JobPostCard;
