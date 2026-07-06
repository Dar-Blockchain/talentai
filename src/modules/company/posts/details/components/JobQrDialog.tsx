import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  open: boolean;
  shareLink: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  jobId: string;
  onClose: () => void;
  onDownload: () => void;
}

const JobQrDialog: React.FC<Props> = ({ open, shareLink, canvasRef, onClose, onDownload }) => {
  const { t } = useTranslation("posts");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "14px", p: 0.5 } }}>
      <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, pb: 1.25 }}>{t("detail.qr.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ p: 1.5, border: "1px solid #E5E7EB", borderRadius: "12px", bgcolor: "#fff" }}>
            <Box ref={canvasRef}>
              <QRCodeCanvas value={shareLink} size={220} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: "12px", color: "#6B7280", textAlign: "center" }}>{t("detail.qr.scan_hint")}</Typography>
          <Button variant="outline" onClick={onDownload}>
            <DownloadOutlined sx={{ fontSize: 16 }} />
            {t("detail.qr.download")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default JobQrDialog;
