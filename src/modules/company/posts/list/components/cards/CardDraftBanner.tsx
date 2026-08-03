import React from "react";
import { useTranslation } from "react-i18next";
import { Rocket as PublishOutlined } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  onPublish: (e: React.MouseEvent) => void;
}

const CardDraftBanner: React.FC<Props> = ({ onPublish }) => {
  const { t } = useTranslation("posts");

  return (
    <div
      onClick={onPublish}
      className="mx-5 mb-5 flex cursor-pointer items-center justify-between gap-2 rounded-lg border-[1.5px] border-dashed border-[#FCD34D] bg-[#FFFBEB] px-3 py-2 transition-all hover:border-[#F59E0B] hover:bg-[#FEF3C7]"
    >
      <div className="flex items-center gap-1.5">
        <PublishOutlined size={14} color="#D97706" className="shrink-0" />
        <span className="text-[11.5px] leading-[1.3] text-[#92400E]">
          <strong>{t("card.draft_banner.hidden")}</strong> — {t("card.draft_banner.action")}
        </span>
      </div>
      <Button size="xs" variant="warning" className="shrink-0 shadow-none">
        {t("card.draft_banner.btn")}
      </Button>
    </div>
  );
};

export default CardDraftBanner;
