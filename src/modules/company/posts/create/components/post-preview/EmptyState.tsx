import { Sparkles as AutoAwesomeOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./styles";

export const LoadingState = () => {
  const { t } = useTranslation("posts");
  return (
    <Card className="p-6 h-full items-center justify-center gap-4">
      <Spinner className="size-10" style={{ color: TEAL }} />
      <p className="text-sm text-[#6B7280]">{t("create.preview.loading")}</p>
    </Card>
  );
};

export const EmptyState = () => {
  const { t } = useTranslation("posts");
  return (
    <Card className="p-6 h-full items-center justify-center gap-4">
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full border"
        style={{ backgroundColor: TEAL_BG, borderColor: TEAL_BORDER }}
      >
        <AutoAwesomeOutlined size={32} color={TEAL} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-[#111827]">{t("create.preview.empty_title")}</p>
        <p className="mt-1 text-[13px] text-[#6B7280]">{t("create.preview.empty_subtitle")}</p>
      </div>
    </Card>
  );
};
