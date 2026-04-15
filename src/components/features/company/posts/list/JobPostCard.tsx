import { memo, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
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
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";

const TEAL = "#0D9488";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

const CREATION_TYPE: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ai:       { label: "AI Generated", color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  pipeline: { label: "Pipeline",     color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  manual:   { label: "Manual",       color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; dot: string; accent: string }> = {
  open:    { label: "Open",   color: "#059669", bg: "#ECFDF5", dot: "#10B981", accent: "#10B981" },
  active:  { label: "Open",   color: "#059669", bg: "#ECFDF5", dot: "#10B981", accent: "#10B981" },
  draft:   { label: "Draft",  color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B", accent: "#F59E0B" },
  closed:  { label: "Closed", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444", accent: "#EF4444" },
  expired: { label: "Closed", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444", accent: "#EF4444" },
};

interface JobPostCardProps {
  job: any;
  index?: number;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const JobPostCard = memo<JobPostCardProps>(({ job, index = 0, onDelete, onViewDetails }) => {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const jd        = job.jobDetails || {};
  const isDraft   = job.status === "draft";
  const daysLeft  = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const ctInfo    = CREATION_TYPE[job.creationType] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ctInfo;

  const statusKey   = isDraft ? "draft" : isExpired ? "expired" : (job.status === "closed" ? "closed" : "active");
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.active;

  const expiryColor = isExpired ? "#DC2626" : daysLeft !== null && daysLeft <= 3 ? "#D97706" : TEAL;
  const expiryBg    = isExpired ? "#FEF2F2" : daysLeft !== null && daysLeft <= 3 ? "#FFFBEB" : `${TEAL}12`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      style={{ height: "100%" }}
    >
      <Box
        onClick={() => onViewDetails(job._id)}
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "14px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          transition: "all 0.18s",
          cursor: "pointer",
          "&:hover": {
            borderColor: `${TEAL}60`,
            boxShadow: `0 6px 24px rgba(13,148,136,0.10)`,
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Left accent bar */}
        <Box sx={{ height: 3, bgcolor: statusStyle.accent, width: "100%", flexShrink: 0 }} />

        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 1.75, flex: 1 }}>
          {/* Header row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            {/* Icon */}
            <Box sx={{
              width: 42, height: 42, borderRadius: "10px", flexShrink: 0,
              bgcolor: `${TEAL}10`, border: `1px solid ${TEAL}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <WorkOutlineOutlined sx={{ fontSize: 20, color: TEAL }} />
            </Box>

            {/* Title + chips */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.3, mb: 0.5 }}
                noWrap
              >
                {jd.title || "Untitled Position"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <Chip
                  icon={<CtIcon sx={{ fontSize: 10 }} />}
                  label={ctInfo.label}
                  size="small"
                  sx={{ fontSize: "10px", fontWeight: 600, height: 18, color: ctInfo.color, bgcolor: ctInfo.bg, border: `1px solid ${ctInfo.color}25`, "& .MuiChip-icon": { color: `${ctInfo.color} !important` } }}
                />
                {/* Status chip */}
                <Chip
                  label={statusStyle.label}
                  size="small"
                  sx={{ fontSize: "10px", fontWeight: 700, height: 18, color: statusStyle.color, bgcolor: statusStyle.bg }}
                  icon={<Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: statusStyle.dot, display: "inline-block", ml: "6px !important", mr: "-2px !important" }} />}
                />
              </Box>
            </Box>

            {/* 3-dot menu */}
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
              sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6", color: "#374151" }, borderRadius: "8px", flexShrink: 0, p: 0.5 }}
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
              PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 160, mt: 0.5, border: "1px solid #E5E7EB" } }}
            >
              <MenuItem
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); router.push(`/company/posts/${job._id}`); }}
                sx={{ gap: 1, fontSize: "13px", fontWeight: 600, mx: 0.5, borderRadius: "8px", "&:hover": { bgcolor: `${TEAL}0D` } }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <OpenInNewOutlined sx={{ fontSize: 13, color: TEAL }} />
                  </Box>
                </ListItemIcon>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>View Details</Typography>
              </MenuItem>
              <MenuItem
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onDelete(job._id); }}
                sx={{ gap: 1, mx: 0.5, borderRadius: "8px", mt: 0.25, "&:hover": { bgcolor: "#FEF2F2" } }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DeleteOutlineOutlined sx={{ fontSize: 13, color: "#EF4444" }} />
                  </Box>
                </ListItemIcon>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#EF4444" }}>Delete</Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* Meta row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            {jd.employmentType && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <BusinessCenterOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{jd.employmentType}</Typography>
              </Box>
            )}
            {jd.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <LocationOnOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }} noWrap>{jd.location}</Typography>
              </Box>
            )}
            {jd.workMode && (
              <Chip label={jd.workMode} size="small" sx={{ fontSize: "10px", height: 17, bgcolor: "#F3F4F6", color: "#6B7280" }} />
            )}
          </Box>

          {/* Description */}
          {jd.description && (
            <Typography sx={{
              fontSize: "12px", color: "#6B7280", lineHeight: 1.6, flex: 1,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {jd.description}
            </Typography>
          )}

          {/* Footer */}
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 1, pt: 1.5, borderTop: "1px solid #F3F4F6", mt: "auto",
          }}>
            {/* Created date */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                {job.createdAt ? fmtDate(job.createdAt) : "—"}
              </Typography>
            </Box>

            {/* Expiry / days left */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {daysLeft !== null && !isExpired && (
                <Chip
                  label={`${daysLeft}d left`}
                  size="small"
                  sx={{ fontSize: "10px", fontWeight: 700, height: 18, color: expiryColor, bgcolor: expiryBg, border: `1px solid ${expiryColor}30` }}
                />
              )}
              {isExpired && (
                <Chip label="Expired" size="small" sx={{ fontSize: "10px", fontWeight: 700, height: 18, color: "#DC2626", bgcolor: "#FEF2F2" }} />
              )}
              {job.expirationDate && !isExpired && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <AccessTimeOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                    Exp. {fmtDate(job.expirationDate)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

JobPostCard.displayName = "JobPostCard";

export default JobPostCard;
