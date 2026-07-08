import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Download as DownloadOutlined } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
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
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="rounded-2xl p-4 sm:max-w-xs" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{t("card.qr.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 pb-1">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
            <div ref={qrCanvasRef}>
              <QRCodeCanvas value={shareLink} size={220} />
            </div>
          </div>
          <p className="text-center text-xs text-[#6B7280]">{t("card.qr.scan_hint")}</p>
          <Button variant="outline" onClick={handleDownload}>
            <DownloadOutlined size={16} />
            {t("card.qr.download")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardQrDialog;
