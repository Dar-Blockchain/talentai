import React from "react";
import { useTranslation } from "react-i18next";
import { Clock as AccessTimeOutlined, QrCode as QrCode2Outlined, Copy as ContentCopyOutlined } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
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
    <TooltipProvider>
      <div className="mt-auto flex items-center justify-between border-t border-[#F3F4F6] pt-3">
        <div className="flex items-center gap-1.5">
          {createdAt && <span className="text-[11.5px] text-[#9CA3AF]">{fmtDate(createdAt)}</span>}
          {daysLeft !== null && !isExpired && (
            <span
              className="rounded px-1.5 py-[2px] text-[10.5px] font-bold"
              style={{ color: daysLeft <= 3 ? "#DC2626" : "#059669", backgroundColor: daysLeft <= 3 ? "#FEF2F2" : "#ECFDF5" }}
            >
              {t("card.days_left", { count: daysLeft })}
            </span>
          )}
          {isExpired && (
            <span className="rounded bg-[#FEF2F2] px-1.5 py-[2px] text-[10.5px] font-bold text-[#DC2626]">
              {t("card.expired_badge")}
            </span>
          )}
          {expirationDate && !isExpired && (
            <div className="flex items-center gap-1">
              <AccessTimeOutlined size={11} color="#D1D5DB" />
              <span className="text-[11.5px] text-[#9CA3AF]">{fmtDate(expirationDate)}</span>
            </div>
          )}
        </div>

        {!isDraft && (
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenQr}
                  className="rounded-lg border border-[#E5E7EB] p-1.5 text-[#9CA3AF] transition-all hover:bg-[#F3F4F6] hover:text-[#374151]"
                >
                  <QrCode2Outlined size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{t("card.qr.show")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCopyLink}
                  className="rounded-lg border border-[#E5E7EB] p-1.5 transition-all hover:bg-[#F3F4F6] hover:text-[#374151]"
                  style={{ color: copied ? "#374151" : "#9CA3AF", backgroundColor: copied ? "#F3F4F6" : "transparent" }}
                >
                  <ContentCopyOutlined size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{copied ? t("card.copied") : t("card.menu.share_title")}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CardFooter;
