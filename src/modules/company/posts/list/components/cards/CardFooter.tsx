import React from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Clock as AccessTimeOutlined, QrCode as QrCode2Outlined, Copy as ContentCopyOutlined } from "lucide-react";
import { fmtDate } from "../../utils";

interface Props {
  isDraft: boolean;
  createdAt?: string;
  expirationDate?: string;
  daysLeft: number | null;
  isExpired: boolean;
  copied: boolean;
  onOpenQr: (e: React.MouseEvent) => void;
  onCopyLink: (e: React.MouseEvent) => void;
}

const CardFooter: React.FC<Props> = ({ isDraft, createdAt, expirationDate, daysLeft, isExpired, copied, onOpenQr, onCopyLink }) => {
  const { t } = useTranslation("posts");

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #F3F4F6", mt: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {createdAt && <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>{fmtDate(createdAt)}</Typography>}
        {daysLeft !== null && !isExpired && (
          <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: daysLeft <= 3 ? "#DC2626" : "#059669", bgcolor: daysLeft <= 3 ? "#FEF2F2" : "#ECFDF5", px: 0.75, py: 0.2, borderRadius: "4px" }}>
            {t("card.days_left", { count: daysLeft })}
          </Typography>
        )}
        {isExpired && (
          <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: "#DC2626", bgcolor: "#FEF2F2", px: 0.75, py: 0.2, borderRadius: "4px" }}>
            {t("card.expired_badge")}
          </Typography>
        )}
        {expirationDate && !isExpired && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <AccessTimeOutlined size={11} color="#D1D5DB" />
            <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>{fmtDate(expirationDate)}</Typography>
          </Box>
        )}
      </Box>

      {!isDraft && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Tooltip title={t("card.qr.show")} placement="top">
            <IconButton size="small" onClick={onOpenQr} sx={{ p: 0.75, borderRadius: "8px", color: "#9CA3AF", border: "1px solid", borderColor: "#E5E7EB", transition: "all 0.18s", "&:hover": { color: "#374151", bgcolor: "#F3F4F6" } }}>
              <QrCode2Outlined size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? t("card.copied") : t("card.menu.share_title")} placement="top">
            <IconButton size="small" onClick={onCopyLink} sx={{ p: 0.75, borderRadius: "8px", color: copied ? "#374151" : "#9CA3AF", bgcolor: copied ? "#F3F4F6" : "transparent", border: "1px solid", borderColor: "#E5E7EB", transition: "all 0.18s", "&:hover": { color: "#374151", bgcolor: "#F3F4F6" } }}>
              <ContentCopyOutlined size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default CardFooter;
