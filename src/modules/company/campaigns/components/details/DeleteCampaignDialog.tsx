import React, { memo } from "react";
import { Users, ClipboardList, TriangleAlert } from "lucide-react";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";
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
    <ConfirmDialog
      open={open}
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title={t(`${p}.title`)}
      description={
        <>
          {t(`${p}.body_lead`)}{" "}
          <span className="font-bold text-slate-900">{campaignTitle}</span>
          {t(`${p}.body_trail`)}
        </>
      }
      cancelLabel={t(`${p}.cancel`)}
      confirmLabel={t(`${p}.confirm`)}
    >
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 flex flex-col gap-2.5 text-left">
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
    </ConfirmDialog>
  );
});
DeleteCampaignDialog.displayName = "DeleteCampaignDialog";
export default DeleteCampaignDialog;
