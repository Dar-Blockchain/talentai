import React from "react";
import { useTranslation } from "react-i18next";
import { Download as DownloadOutlined } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";

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
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="rounded-[14px] p-4 sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold">{t("detail.qr.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 pb-1">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div ref={canvasRef}>
              <QRCodeCanvas value={shareLink} size={220} />
            </div>
          </div>
          <p className="text-center text-[12px] text-gray-500">{t("detail.qr.scan_hint")}</p>
          <Button variant="outline" onClick={onDownload}>
            <DownloadOutlined size={16} />
            {t("detail.qr.download")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobQrDialog;
