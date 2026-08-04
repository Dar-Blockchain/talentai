import { Sparkles as AutoAwesomeOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { INDIGO } from "./styles";

const PreviewHeader = () => {
  const { t } = useTranslation("posts");
  return (
    <Card className="p-6 gap-0 border-l-4" style={{ borderLeftColor: INDIGO }}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C7D2FE] bg-[#EEF2FF]">
          <AutoAwesomeOutlined size={20} color={INDIGO} />
        </div>
        <div>
          <p className="text-[15px] font-bold text-[#111827]">{t("create.preview.header_title")}</p>
          <p className="text-xs text-[#6B7280]">{t("create.preview.header_subtitle")}</p>
        </div>
      </div>
    </Card>
  );
};

export default PreviewHeader;
