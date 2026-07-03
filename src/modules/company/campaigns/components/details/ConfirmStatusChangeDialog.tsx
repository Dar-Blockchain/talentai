import React, { memo } from "react";
import { Play, Pause, Square, Info } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import { STATUS_COLORS } from "@/modules/shared/constants/campaign";
import { useTranslation, Trans } from "react-i18next";

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: Play,
  PAUSED: Pause,
  CLOSED: Square,
};

interface Props {
  open: boolean;
  campaignTitle: string;
  currentStatus: CampaignStatus;
  targetStatus: CampaignStatus;
  onClose: () => void;
  onConfirm: () => void;
}

const pRoot = "pages.campaigns";

const STATUS_TITLE_KEY: Partial<Record<CampaignStatus, string>> = {
  ACTIVE: "modals.status.title_activate",
  PAUSED: "modals.status.title_pause",
  CLOSED: "modals.status.title_close",
};

const STATUS_DESC_KEY: Partial<Record<CampaignStatus, string>> = {
  ACTIVE: "modals.status.desc_active",
  PAUSED: "modals.status.desc_paused",
  CLOSED: "modals.status.desc_closed",
};

const ConfirmStatusChangeDialog: React.FC<Props> = memo(({
  open, campaignTitle, currentStatus, targetStatus, onClose, onConfirm,
}) => {
  const { t } = useTranslation("dashboard");
  const p = `${pRoot}.modals.status`;
  const sColor = STATUS_COLORS[targetStatus];
  const cColor = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.DRAFT;
  const Icon   = STATUS_ICONS[targetStatus];
  const titleKey = STATUS_TITLE_KEY[targetStatus];
  const descKey = STATUS_DESC_KEY[targetStatus];

  const currentLabel = t(`${pRoot}.status.${currentStatus}`);
  const targetLabel = t(`${pRoot}.status.${targetStatus}`);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-xs shadow-2xl">
        <div className="flex items-center gap-3 pl-6 pr-10 pt-6 pb-3">
          <div
            className="flex items-center justify-center size-[38px] rounded-[10px] shrink-0 border"
            style={{ background: sColor?.bg, borderColor: `${sColor?.fg}25` }}
          >
            {Icon && <Icon className="size-[18px]" style={{ color: sColor?.fg }} />}
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-bold text-foreground">
              {titleKey ? t(`${pRoot}.${titleKey}`) : t(`${p}.confirm`)}
            </DialogTitle>
            <DialogDescription className="text-[11px] mt-0.5 truncate">
              {campaignTitle}
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 pb-1 flex flex-col gap-0">
          {descKey && (
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {t(`${pRoot}.${descKey}`)}
            </p>
          )}

          <div className="mt-3 px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: cColor.bg }}>
              <span className="size-[5px] rounded-full" style={{ background: cColor.fg }} />
              <span className="text-[11px] font-bold" style={{ color: cColor.fg }}>{currentLabel}</span>
            </span>
            <span className="text-xs text-slate-400">→</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: sColor?.bg }}>
              <span className="size-[5px] rounded-full" style={{ background: sColor?.fg }} />
              <span className="text-[11px] font-bold" style={{ color: sColor?.fg }}>{targetLabel}</span>
            </span>
          </div>

          {targetStatus === "ACTIVE" && (
            <div className="flex items-start gap-2 mt-3 px-2.5 py-2 rounded-lg bg-orange-50 border border-orange-200">
              <Info className="size-3.5 text-orange-600 shrink-0 mt-0.5" />
              <span className="text-[11.5px] text-orange-900 leading-relaxed">
                <Trans i18nKey={`${p}.active_warning`} ns="dashboard" components={{ strong: <strong /> }} />
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t(`${p}.cancel`)}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="text-white hover:brightness-95"
            style={{ background: sColor?.fg }}
          >
            {t(`${p}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
ConfirmStatusChangeDialog.displayName = "ConfirmStatusChangeDialog";
export default ConfirmStatusChangeDialog;
