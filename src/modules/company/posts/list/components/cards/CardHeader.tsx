import React from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import { useRouter } from "next/router";

const CREATION_TYPE: Record<string, { i18nKey: string; color: string; bg: string; Icon: React.ElementType }> = {
  ai:     { i18nKey: "ai",     color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  manual: { i18nKey: "manual", color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

const STATUS_STYLES: Record<string, { i18nKey: string; color: string; bg: string; dot: string }> = {
  active:  { i18nKey: "open",    color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  open:    { i18nKey: "open",    color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  draft:   { i18nKey: "draft",   color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
  closed:  { i18nKey: "closed",  color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
  expired: { i18nKey: "expired", color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
};

interface Props {
  jobId: string;
  title: string;
  creationType: string;
  statusKey: string;
  isDraft: boolean;
  copied: boolean;
  menuAnchor: HTMLElement | null;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onDelete: () => void;
  onPublish?: () => void;
  onCopyLink: (e: React.MouseEvent) => void;
}

const CardHeader: React.FC<Props> = ({
  jobId, title, creationType, statusKey, isDraft, copied,
  menuAnchor, onMenuOpen, onMenuClose, onDelete, onPublish, onCopyLink,
}) => {
  const { t } = useTranslation("posts");
  const router = useRouter();
  const ctInfo = CREATION_TYPE[creationType] || CREATION_TYPE.manual;
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.active;
  const { Icon: CtIcon } = ctInfo;

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
      <Box sx={{ width: 44, height: 44, borderRadius: "11px", flexShrink: 0, bgcolor: "#F3F4F6", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <WorkOutlineOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: "14.5px", fontWeight: 700, color: "#111827", lineHeight: 1.3, mb: 0.6 }}>
          {title || t("card.untitled")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: "7px", py: "3px", borderRadius: "5px", bgcolor: ctInfo.bg, border: `1px solid ${ctInfo.color}28` }}>
            <CtIcon sx={{ fontSize: 10, color: ctInfo.color }} />
            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: ctInfo.color, lineHeight: 1 }}>
              {t(`card.creation_type.${ctInfo.i18nKey}`)}
            </Typography>
          </Box>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: "7px", py: "3px", borderRadius: "5px", bgcolor: statusStyle.bg, border: `1px solid ${statusStyle.color}28` }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: statusStyle.dot, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: statusStyle.color, lineHeight: 1 }}>
              {t(`card.status.${statusStyle.i18nKey}`)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
        sx={{ color: "#9CA3AF", borderRadius: "6px", p: 0.3, flexShrink: 0, "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}
      >
        <MoreVertOutlined sx={{ fontSize: 15 }} />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={(e: any) => { e.stopPropagation?.(); onMenuClose(); }}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)", minWidth: 188, mt: 0.75, border: "1px solid #E5E7EB", p: 0.75 } }}
      >
        <Box sx={{ px: 1.5, pt: 0.5, pb: 1 }}>
          <Typography noWrap sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {title || t("card.menu.header_fallback")}
          </Typography>
        </Box>

        <MenuItem onClick={(e) => { e.stopPropagation(); onMenuClose(); router.push(`/company/posts/${jobId}`); }} sx={{ gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25, "&:hover": { bgcolor: "#F5F5F5", "& .menu-icon-box": { bgcolor: "#E9E9E9" } } }}>
          <Box className="menu-icon-box" sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
            <OpenInNewOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{t("card.menu.view_title")}</Typography>
            <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("card.menu.view_desc")}</Typography>
          </Box>
        </MenuItem>

        {isDraft && onPublish && (
          <MenuItem onClick={(e) => { e.stopPropagation(); onMenuClose(); onPublish(); }} sx={{ gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25, "&:hover": { bgcolor: "#ECFDF5", "& .menu-icon-box": { bgcolor: "#D1FAE5" } } }}>
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
          <MenuItem onClick={onCopyLink} sx={{ gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25, "&:hover": { bgcolor: "#F5F5F5", "& .menu-icon-box": { bgcolor: "#E9E9E9" } } }}>
            <Box className="menu-icon-box" sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
              <ContentCopyOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{copied ? t("card.copied") : t("card.menu.share_title")}</Typography>
              <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("card.menu.share_desc")}</Typography>
            </Box>
          </MenuItem>
        )}

        <Box sx={{ my: 0.75, height: "1px", bgcolor: "#F3F4F6", mx: 0.5 }} />

        <MenuItem onClick={(e) => { e.stopPropagation(); onMenuClose(); onDelete(); }} sx={{ gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25, "&:hover": { bgcolor: "#F5F5F5", "& .menu-icon-box": { bgcolor: "#E9E9E9" } } }}>
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
  );
};

export default CardHeader;
