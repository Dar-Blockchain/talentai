"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Breadcrumbs, Chip, IconButton, Menu, MenuItem, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import NavigateNextIcon        from "@mui/icons-material/NavigateNext";
import WorkOutlineOutlined     from "@mui/icons-material/WorkOutline";
import LocationOnOutlined      from "@mui/icons-material/LocationOn";
import LaptopOutlined          from "@mui/icons-material/Laptop";
import BusinessCenterOutlined  from "@mui/icons-material/BusinessCenter";
import SignalCellularAltOutlined from "@mui/icons-material/SignalCellularAlt";
import CalendarTodayOutlined   from "@mui/icons-material/CalendarToday";
import MicOutlined             from "@mui/icons-material/Mic";
import PublishOutlined         from "@mui/icons-material/PublishOutlined";
import QrCode2Outlined         from "@mui/icons-material/QrCode2";
import ContentCopyOutlined     from "@mui/icons-material/ContentCopy";
import MoreVertOutlined        from "@mui/icons-material/MoreVert";
import EditOutlined            from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined   from "@mui/icons-material/DeleteOutline";
import PeopleOutlined          from "@mui/icons-material/PeopleOutlined";

import { TEAL } from "@/modules/posts/shared/constants";

const DOT = <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>·</Typography>;

interface MetaItemProps { Icon: React.ElementType; label: string }
const MetaItem: React.FC<MetaItemProps> = ({ Icon, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Icon sx={{ fontSize: 13, color: "#9CA3AF" }} />
    <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{label}</Typography>
  </Box>
);

const actionBtnSx = (color: string, border: string, hoverBg: string) => ({
  display: "flex", alignItems: "center", gap: 0.75,
  px: 1.75, height: 36, borderRadius: "10px", cursor: "pointer",
  border: `1.5px solid ${border}`, bgcolor: color,
  transition: "border-color 0.15s, background 0.15s",
  "&:hover": { borderColor: hoverBg, bgcolor: hoverBg },
});

interface Props {
  job: any;
  isOwner: boolean;
  activeTab: "details" | "applications";
  menuAnchor: HTMLElement | null;
  onTabChange: (tab: "details" | "applications") => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onEditPost: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onOpenLanguages: () => void;
  onOpenQr: () => void;
  onCopyLink: () => void;
}

const JobDetailHeader: React.FC<Props> = ({
  job, isOwner, activeTab, menuAnchor,
  onTabChange, onMenuOpen, onMenuClose, onEditPost, onDelete,
  onPublish, onOpenLanguages, onOpenQr, onCopyLink,
}) => {
  const { t }  = useTranslation("posts");
  const { t: td } = useTranslation("dashboard");

  const jd      = job.jobDetails || {};
  const isDraft = job.status === "draft";
  const canEdit = isDraft || (job.applicationCount ?? 0) === 0;

  const metaItems = [
    jd.location      && { Icon: LocationOnOutlined,       label: jd.location },
    jd.workMode      && { Icon: LaptopOutlined,           label: jd.workMode },
    jd.employmentType && { Icon: BusinessCenterOutlined,  label: jd.employmentType },
    jd.experienceLevel && { Icon: SignalCellularAltOutlined, label: jd.experienceLevel },
    job.createdAt    && { Icon: CalendarTodayOutlined,    label: new Date(job.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
  ].filter(Boolean) as { Icon: React.ElementType; label: string }[];

  return (
    <Box sx={{
      mb: 3, bgcolor: "#fff",
      border: `1px solid ${isDraft ? "#FDE68A" : "#E5E7EB"}`,
      borderTop: `3px solid ${isDraft ? "#F59E0B" : TEAL}`,
      borderRadius: "16px", overflow: "hidden",
      boxShadow: isDraft ? "0 2px 12px #D9770618" : "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <Box sx={{ px: { xs: 2.5, md: 3 }, pt: 2.5, pb: isDraft ? 2.5 : 0 }}>

        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: "#D1D5DB" }} />} sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { mx: 0.25 } }}>
          {[
            { label: td("pages.common.dashboard"), href: "/company/dashboard" },
            { label: t("title"),                   href: "/company/posts" },
            { label: jd.title || t("detail.fallback_title") },
          ].map((item, i) =>
            item.href ? (
              <MuiLink key={i} component={Link} href={item.href} underline="hover" sx={{ fontSize: "12px", fontWeight: 500, color: "#6B7280", "&:hover": { color: "#111827" } }}>
                {item.label}
              </MuiLink>
            ) : (
              <Typography key={i} sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{item.label}</Typography>
            )
          )}
        </Breadcrumbs>

        {/* Title row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>

          {/* Left: icon + title + meta */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1, minWidth: 0 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: "12px", flexShrink: 0, background: `linear-gradient(135deg, ${TEAL}, #34D399)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${TEAL}30` }}>
              <WorkOutlineOutlined sx={{ fontSize: 26, color: "#fff" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.75 }}>
                <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
                  {jd.title || "Job Post"}
                </Typography>
                <Chip
                  label={isDraft ? t("detail.status.draft") : t("detail.status.published")}
                  size="small"
                  sx={{ height: 22, fontWeight: 700, fontSize: "11px", bgcolor: isDraft ? "#FEF3C7" : "#D1FAE5", color: isDraft ? "#92400E" : "#065F46", border: `1px solid ${isDraft ? "#FDE68A" : "#A7F3D0"}` }}
                />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {metaItems.map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && DOT}
                    <MetaItem Icon={item.Icon} label={item.label} />
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right: actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            {isDraft && isOwner && (
              <Box onClick={onOpenLanguages} sx={actionBtnSx("#F0FDFA", "#99F6E4", "#CCFBF1")}>
                <MicOutlined sx={{ fontSize: 15, color: TEAL }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: TEAL, lineHeight: 1 }}>{t("detail.actions.edit_languages")}</Typography>
              </Box>
            )}
            {isDraft && isOwner && (
              <Box onClick={onPublish} sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.75, height: 36, borderRadius: "10px", cursor: "pointer", bgcolor: "#D97706", transition: "background 0.15s", "&:hover": { bgcolor: "#B45309" } }}>
                <PublishOutlined sx={{ fontSize: 15, color: "#fff" }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{t("detail.actions.publish")}</Typography>
              </Box>
            )}
            {!isDraft && (
              <>
                <Box onClick={onOpenQr} sx={actionBtnSx("#F0FDF4", "#A7F3D0", "#DCFCE7")}>
                  <QrCode2Outlined sx={{ fontSize: 14, color: "#059669" }} />
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#059669", lineHeight: 1 }}>{t("detail.actions.qr_link")}</Typography>
                </Box>
                <Box onClick={onCopyLink} sx={actionBtnSx("#F0FDF4", "#A7F3D0", "#DCFCE7")}>
                  <ContentCopyOutlined sx={{ fontSize: 14, color: "#059669" }} />
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#059669", lineHeight: 1 }}>{t("detail.actions.copy_link")}</Typography>
                </Box>
              </>
            )}
            {isOwner && (
              <>
                <IconButton onClick={onMenuOpen} sx={{ width: 36, height: 36, borderRadius: "10px", border: "1.5px solid #E5E7EB", bgcolor: "#fff", color: "#6B7280", transition: "all 0.15s", "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB", color: "#374151" } }}>
                  <MoreVertOutlined sx={{ fontSize: 18 }} />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={onMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{ paper: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 180, mt: 0.75, border: "1px solid #E5E7EB" } } }}
                >
                  <Tooltip title={!canEdit ? t("detail.tooltips.cannot_edit_published") : ""} arrow placement="left" disableHoverListener={canEdit}>
                    <span>
                      <MenuItem disabled={!canEdit} onClick={() => { onMenuClose(); onEditPost(); }}
                        sx={{ mx: 0.5, borderRadius: "8px", gap: 1.25, py: 1, px: 1.25, "&:hover": { bgcolor: "#F0FDFA" }, "&.Mui-disabled": { opacity: 0.45 } }}
                      >
                        <Box sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <EditOutlined sx={{ fontSize: 14, color: TEAL }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{t("detail.menu.edit_title")}</Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{!canEdit ? t("detail.menu.edit_desc_published") : t("detail.menu.edit_desc_draft")}</Typography>
                        </Box>
                      </MenuItem>
                    </span>
                  </Tooltip>
                  <Box sx={{ mx: 1.5, my: 0.5, height: "1px", bgcolor: "#F3F4F6" }} />
                  <MenuItem onClick={() => { onMenuClose(); onDelete(); }}
                    sx={{ mx: 0.5, borderRadius: "8px", gap: 1.25, py: 1, px: 1.25, "&:hover": { bgcolor: "#FEF2F2" } }}
                  >
                    <Box sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#EF4444" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#EF4444", lineHeight: 1.2 }}>{t("detail.menu.delete_title")}</Typography>
                      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("detail.menu.delete_desc")}</Typography>
                    </Box>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        {!isDraft && (
          <Tabs value={activeTab} onChange={(_, v) => onTabChange(v)}
            sx={{ mt: 2.5, minHeight: 44, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "13px", minHeight: 44, px: 1.5, mr: 0.5, gap: 0.75, color: "#9CA3AF", "&.Mui-selected": { color: TEAL } }, "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2.5, borderRadius: "2px 2px 0 0" } }}
          >
            <Tab value="details"      label={t("detail.tabs.details")}      icon={<WorkOutlineOutlined sx={{ fontSize: 15 }} />} iconPosition="start" />
            <Tab value="applications" label={t("detail.tabs.applications")} icon={<PeopleOutlined      sx={{ fontSize: 15 }} />} iconPosition="start" />
          </Tabs>
        )}
      </Box>
    </Box>
  );
};

export default JobDetailHeader;
