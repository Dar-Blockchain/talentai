import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Download as DownloadOutlined } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  open: boolean;
  jobId: string;
  shareLink: string;
  onClose: () => void;
}

const CardQrDialog: React.FC<Props> = ({ open, jobId, shareLink, onClose }) => {
  const { t } = useTranslation("posts");
  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `job-post-${jobId}-qr.png`;
    link.click();
  };

  return (
    <Dialog open={open} onClose={(e: any) => { e.stopPropagation?.(); onClose(); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "14px", p: 0.5 } }}>
      <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, pb: 1.25 }}>{t("card.qr.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ p: 1.5, border: "1px solid #E5E7EB", borderRadius: "12px", bgcolor: "#fff" }}>
            <Box ref={qrCanvasRef}>
              <QRCodeCanvas value={shareLink} size={220} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: "12px", color: "#6B7280", textAlign: "center" }}>{t("card.qr.scan_hint")}</Typography>
          <Button variant="outline" onClick={handleDownload}>
            <DownloadOutlined size={16} />
            {t("card.qr.download")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CardQrDialog;
