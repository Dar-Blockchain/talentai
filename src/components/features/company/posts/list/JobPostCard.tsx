import { memo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, IconButton, Menu, MenuItem, Tooltip, Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
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
import QrCode2Outlined from "@mui/icons-material/QrCode2Outlined";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import { QRCodeCanvas } from "qrcode.react";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

const CREATION_TYPE: Record<string, { i18nKey: string; color: string; bg: string; Icon: React.ElementType }> = {
  ai:       { i18nKey: "ai",       color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  pipeline: { i18nKey: "pipeline", color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  manual:   { i18nKey: "manual",   color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

const STATUS_STYLES: Record<string, { i18nKey: string; color: string; bg: string; dot: string }> = {
  active:  { i18nKey: "open",    color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  open:    { i18nKey: "open",    color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  draft:   { i18nKey: "draft",   color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
  closed:  { i18nKey: "closed",  color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
  expired: { i18nKey: "expired", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
};

interface JobPostCardProps {
  job: any;
  index?: number;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onPublish?: (id: string) => void;
  canDelete?: boolean;
}

const JobPostCard = memo<JobPostCardProps>(({ job, index = 0, onDelete, onViewDetails, onPublish, canDelete = true }) => {
  const { t } = useTranslation("posts");
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  const jd       = job.jobDetails || {};
  const isDraft  = job.status === "draft";
  const daysLeft = getDaysLeft(job.expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const ctInfo   = CREATION_TYPE[job.creationType] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ctInfo;

  const statusKey   = isDraft ? "draft" : isExpired ? "expired" : job.status === "closed" ? "closed" : "active";
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.active;
  const getShareLink = () => {
    if (typeof window === "undefined") return "";
    const companyId = job.user?._id || "";
    return `${window.location.origin}/candidate/interview/hr?jobId=${job._id}${companyId ? `&companyId=${companyId}` : ""}&ref=link`;
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor(null);
    const link = getShareLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOpenQr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor(null);
    setQrOpen(true);
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `job-post-${job._id}-qr.png`;
    link.click();
  };

  const shareLink = getShareLink();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      style={{ height: "100%", minWidth: 0 }}
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
            borderColor: "#D1D5DB",
            boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
            transform: "translateY(-1px)",
          },
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 3, bgcolor: isDraft ? "#F59E0B" : "#E5E7EB", flexShrink: 0 }} />

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.75, flex: 1 }}>

          {/* ── Header row ── */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            {/* Icon */}
            <Box sx={{
              width: 44, height: 44, borderRadius: "11px", flexShrink: 0,
              bgcolor: "#F3F4F6", border: "1px solid #E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <WorkOutlineOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
            </Box>

            {/* Title + badges */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: "14.5px", fontWeight: 700, color: "#111827", lineHeight: 1.3, mb: 0.6 }}>
                {jd.title || t("card.untitled")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* Creation type badge */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.4,
                  px: "7px", py: "3px", borderRadius: "5px",
                  bgcolor: ctInfo.bg, border: `1px solid ${ctInfo.color}28`,
                }}>
                  <CtIcon sx={{ fontSize: 10, color: ctInfo.color }} />
                  <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: ctInfo.color, lineHeight: 1 }}>
                    {t(`card.creation_type.${ctInfo.i18nKey}`)}
                  </Typography>
                </Box>

                {/* Status badge with dot */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.4,
                  px: "7px", py: "3px", borderRadius: "5px",
                  bgcolor: statusStyle.bg, border: `1px solid ${statusStyle.color}28`,
                }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: statusStyle.dot, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: statusStyle.color, lineHeight: 1 }}>
                    {t(`card.status.${statusStyle.i18nKey}`)}
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
                  {jd.title || t("card.menu.header_fallback")}
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
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{t("card.menu.view_title")}</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("card.menu.view_desc")}</Typography>
                </Box>
              </MenuItem>

              {isDraft && onPublish && (
                <MenuItem
                  onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onPublish(job._id); }}
                  sx={{
                    gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25,
                    "&:hover": { bgcolor: "#ECFDF5", "& .menu-icon-box": { bgcolor: "#D1FAE5" } },
                  }}
                >
                  <Box className="menu-icon-box" sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                    <PublishOutlined sx={{ fontSize: 13, color: "#059669" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{t("card.menu.publish_title")}</Typography>
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("card.menu.publish_desc")}</Typography>
                  </Box>
                </MenuItem>
              )}

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
                      {copied ? t("card.copied") : t("card.menu.share_title")}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("card.menu.share_desc")}</Typography>
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
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", lineHeight: 1.2 }}>{t("card.menu.delete_title")}</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("card.menu.delete_desc")}</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>

          {/* ── Meta pills ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {jd.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <LocationOnOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography noWrap sx={{ fontSize: "12px", color: "#6B7280", maxWidth: 120 }}>{jd.location}</Typography>
              </Box>
            )}
            {jd.employmentType && (
              <Typography sx={{ fontSize: "11px", color: "#6B7280", bgcolor: "#F3F4F6", px: 1, py: 0.3, borderRadius: "5px" }}>
                {jd.employmentType}
              </Typography>
            )}
            {jd.workMode && (
              <Typography sx={{ fontSize: "11px", color: "#6B7280", bgcolor: "#F3F4F6", px: 1, py: 0.3, borderRadius: "5px" }}>
                {jd.workMode}
              </Typography>
            )}
          </Box>

          {/* ── Description ── */}
          {jd.description && (
            <Typography sx={{
              fontSize: "12.5px", color: "#6B7280", lineHeight: 1.65,
              display: "-webkit-box", WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {jd.description}
            </Typography>
          )}

          {/* ── Footer ── */}
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            pt: 1.5, borderTop: "1px solid #F3F4F6", mt: "auto",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {job.createdAt && (
                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>{fmtDate(job.createdAt)}</Typography>
              )}
              {daysLeft !== null && !isExpired && (
                <Typography sx={{
                  fontSize: "10.5px", fontWeight: 700,
                  color: daysLeft <= 3 ? "#DC2626" : "#059669",
                  bgcolor: daysLeft <= 3 ? "#FEF2F2" : "#ECFDF5",
                  px: 0.75, py: 0.2, borderRadius: "4px",
                }}>
                  {t("card.days_left", { count: daysLeft })}
                </Typography>
              )}
              {isExpired && (
                <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#DC2626", bgcolor: "#FEF2F2", px: 0.75, py: 0.2, borderRadius: "4px" }}>
                  {t("card.expired_badge")}
                </Typography>
              )}
              {job.expirationDate && !isExpired && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <AccessTimeOutlined sx={{ fontSize: 11, color: "#D1D5DB" }} />
                  <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>{fmtDate(job.expirationDate)}</Typography>
                </Box>
              )}
            </Box>

            {!isDraft && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Tooltip title={t("card.qr.show")} placement="top">
                  <IconButton
                    size="small"
                    onClick={handleOpenQr}
                    sx={{
                      p: 0.75, borderRadius: "8px",
                      color: "#9CA3AF",
                      border: "1px solid",
                      borderColor: "#E5E7EB",
                      transition: "all 0.18s",
                      "&:hover": { color: "#374151", bgcolor: "#F3F4F6" },
                    }}
                  >
                    <QrCode2Outlined sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={copied ? t("card.copied") : t("card.menu.share_title")} placement="top">
                  <IconButton
                    size="small"
                    onClick={handleCopyLink}
                    sx={{
                      p: 0.75, borderRadius: "8px",
                      color: copied ? "#374151" : "#9CA3AF",
                      bgcolor: copied ? "#F3F4F6" : "transparent",
                      border: "1px solid",
                      borderColor: "#E5E7EB",
                      transition: "all 0.18s",
                      "&:hover": { color: "#374151", bgcolor: "#F3F4F6" },
                    }}
                  >
                    <ContentCopyOutlined sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        {/* Draft publish banner */}
        {isDraft && onPublish && (
          <Box
            onClick={(e) => { e.stopPropagation(); onPublish(job._id); }}
            sx={{
              mx: 2.5, mb: 2.5, px: 1.5, py: 1,
              borderRadius: "8px",
              border: "1.5px dashed #FCD34D",
              bgcolor: "#FFFBEB",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { bgcolor: "#FEF3C7", borderColor: "#F59E0B" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <PublishOutlined sx={{ fontSize: 14, color: "#D97706", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.3 }}>
                <strong>{t("card.draft_banner.hidden")}</strong> — {t("card.draft_banner.action")}
              </Typography>
            </Box>
            <Box sx={{
              px: 1.25, py: 0.4, borderRadius: "6px",
              bgcolor: "#D97706", flexShrink: 0,
            }}>
              <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {t("card.draft_banner.btn")}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {!isDraft && (
        <Dialog
          open={qrOpen}
          onClose={(e) => { e.stopPropagation?.(); setQrOpen(false); }}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "14px", p: 0.5 } }}
        >
          <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, pb: 1.25 }}>
            {t("card.qr.title")}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, pb: 1 }}>
              <Box sx={{ p: 1.5, border: "1px solid #E5E7EB", borderRadius: "12px", bgcolor: "#fff" }}>
                <Box ref={qrCanvasRef}>
                  <QRCodeCanvas value={shareLink} size={220} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", textAlign: "center" }}>
                {t("card.qr.scan_hint")}
              </Typography>
              <Button
                onClick={handleDownloadQr}
                variant="outlined"
                startIcon={<DownloadOutlined sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                }}
              >
                {t("card.qr.download")}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
});

JobPostCard.displayName = "JobPostCard";

export default JobPostCard;
