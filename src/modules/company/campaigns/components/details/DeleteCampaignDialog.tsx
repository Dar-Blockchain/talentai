import React, { memo } from "react";
import { Trash2, Users, ClipboardList, TriangleAlert } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { useTranslation, Trans } from "react-i18next";

interface Props {
  open: boolean;
  campaignTitle: string;
  participantCount?: number;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const p = "pages.campaigns.modals.delete";

const DeleteCampaignDialog: React.FC<Props> = memo(({ open, campaignTitle, participantCount, onClose, onConfirm, loading }) => {
  const { t } = useTranslation("dashboard");

  const impactParticipants =
    participantCount != null && participantCount > 0 ? (
      <Trans
        i18nKey={participantCount === 1 ? `${p}.impact_participants_one` : `${p}.impact_participants_other`}
        ns="dashboard"
        values={{ count: participantCount }}
        components={{ strong: <strong /> }}
      />
    ) : (
      t(`${p}.impact_generic`)
    );

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onClose(); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-xs shadow-2xl">
        <div className="flex items-center gap-3 pl-6 pr-10 pt-6 pb-3">
          <div className="flex items-center justify-center size-10 rounded-[11px] shrink-0 bg-red-50 border border-red-200">
            <Trash2 className="size-[19px] text-red-600" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-bold text-foreground">
              {t(`${p}.title`)}
            </DialogTitle>
            <DialogDescription className="text-[11px] mt-0.5">
              {t(`${p}.subtitle`)}
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 pb-1 flex flex-col gap-3">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            {t(`${p}.body_lead`)}{" "}
            <span className="font-bold text-slate-900">{campaignTitle}</span>
            {t(`${p}.body_trail`)}
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-[15px] text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-amber-900">{t(`${p}.impact_title`)}</p>
            </div>

            <div className="flex items-start gap-2">
              <Users className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[12.5px] text-amber-900 leading-relaxed">{impactParticipants}</p>
            </div>

            <div className="flex items-start gap-2">
              <ClipboardList className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[12.5px] text-amber-900 leading-relaxed">{t(`${p}.impact_config`)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t(`${p}.cancel`)}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} loading={loading}>
            <Trash2 className="size-4" />
            {t(`${p}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
DeleteCampaignDialog.displayName = "DeleteCampaignDialog";
export default DeleteCampaignDialog;
