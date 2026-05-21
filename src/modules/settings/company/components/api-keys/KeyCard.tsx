import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, IconButton, Switch, Tooltip, Typography } from "@mui/material";
import DeleteOutlined  from "@mui/icons-material/DeleteOutlined";
import EditOutlined    from "@mui/icons-material/EditOutlined";
import KeyOutlined     from "@mui/icons-material/KeyOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import type { ApiKey } from "@/modules/settings/company/types";
import { TEAL, TEAL_BG, fmtDate } from "@/modules/settings/shared/constants";

// ─── Local sub-components ─────────────────────────────────────────────────────

const MetaText = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{children}</Typography>
);

const ActionButton = ({
  title, icon: Icon, onClick, color, hoverBg,
}: {
  title: string;
  icon: SvgIconComponent;
  onClick: () => void;
  color: string;
  hoverBg: string;
}) => (
  <Tooltip title={title}>
    <IconButton size="small" onClick={onClick} sx={{ color, "&:hover": { bgcolor: hoverBg } }}>
      <Icon sx={{ fontSize: 16 }} />
    </IconButton>
  </Tooltip>
);

// ─── KeyCard ──────────────────────────────────────────────────────────────────

type Props = {
  apiKey: ApiKey;
  onEdit:       (key: ApiKey) => void;
  onDelete:     (key: ApiKey) => void;
  onToggle:     (id: string, isActive: boolean) => void;
  onRegenerate: (id: string) => void;
};

const KeyCard: React.FC<Props> = ({ apiKey: k, onEdit, onDelete, onToggle, onRegenerate }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>

      {/* Status icon */}
      <Box sx={{ width: 36, height: 36, borderRadius: "9px", bgcolor: k.isActive ? TEAL_BG : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <KeyOutlined sx={{ fontSize: 17, color: k.isActive ? TEAL : "#9CA3AF" }} />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>

        {/* Name + badges */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{k.name}</Typography>
          {k.serviceName && (
            <Chip label={k.serviceName} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 600, bgcolor: "#F3F4F6", color: "#374151" }} />
          )}
          <Chip
            label={k.isActive ? t("pages.settings.api_keys.active") : t("pages.settings.api_keys.disabled_label")}
            size="small"
            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: k.isActive ? "rgba(13,148,136,0.08)" : "#F3F4F6", color: k.isActive ? TEAL : "#9CA3AF" }}
          />
        </Box>

        {/* Scopes */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.6 }}>
          {k.scopes.map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 17, fontSize: "0.6rem", bgcolor: "#EFF6FF", color: "#2563EB" }} />
          ))}
        </Box>

        {/* Meta row */}
        <Box sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
          {k.keyPreview && <MetaText>{t("pages.settings.api_keys.key_preview",    { preview: k.keyPreview })}</MetaText>}
          <MetaText>{t("pages.settings.api_keys.rate_limit_label", { count: k.rateLimit })}</MetaText>
          {k.expiresAt  && <MetaText>{t("pages.settings.api_keys.expires_label",   { date: fmtDate(k.expiresAt) })}</MetaText>}
          {k.lastUsed   && <MetaText>{t("pages.settings.api_keys.last_used_label", { date: fmtDate(k.lastUsed) })}</MetaText>}
          <MetaText>
            {k.ipWhitelist?.length
              ? t("pages.settings.api_keys.ips_label", { ips: k.ipWhitelist.join(", ") })
              : `IPs: ${t("pages.settings.api_keys.ips_all")}`}
          </MetaText>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        <Tooltip title={k.isActive ? t("pages.settings.api_keys.toggle_disable") : t("pages.settings.api_keys.toggle_enable")}>
          <Switch size="small" checked={k.isActive} onChange={() => onToggle(k.id, k.isActive)}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: TEAL }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: TEAL } }}
          />
        </Tooltip>
        <ActionButton title={t("pages.settings.api_keys.regenerate_tooltip")} icon={RefreshOutlined} onClick={() => onRegenerate(k.id)} color="#F59E0B" hoverBg="#FFFBEB" />
        <ActionButton title={t("pages.settings.api_keys.edit_tooltip")}       icon={EditOutlined}    onClick={() => onEdit(k)}           color={TEAL}    hoverBg={TEAL_BG} />
        <ActionButton title={t("pages.settings.api_keys.delete_tooltip")}     icon={DeleteOutlined}  onClick={() => onDelete(k)}         color="#EF4444" hoverBg="#FEF2F2" />
      </Box>

    </Box>
  );
};

export default KeyCard;
