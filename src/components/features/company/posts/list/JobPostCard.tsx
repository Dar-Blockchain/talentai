import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useRouter } from "next/router";
import AppButton from "@/components/ui/AppButton";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import StatusBadge from "@/components/dashboard-workplace/ui/StatusBadge";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";

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
}) => {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <AppButton
            endIcon={<ChevronRightOutlined sx={{ fontSize: 14 }} />}
            onClick={() => router.push(`/company/posts/${job._id}`)}
            label="View Details"
            size="small"
            variant="outlined"
          />

          {/* 3-dot menu */}
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: 1.5 }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 150, mt: 0.5 } }}
          >
            <MenuItem
              onClick={() => { setMenuAnchor(null); onDelete(job._id); }}
              sx={{ gap: 1, color: "#EF4444", fontSize: "13px", fontWeight: 600, "&:hover": { bgcolor: "#FEF2F2" } }}
            >
              <ListItemIcon sx={{ minWidth: "auto", color: "#EF4444" }}>
                <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }} />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default JobPostCard;
