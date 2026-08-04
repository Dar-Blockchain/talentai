import { Sparkles as AutoAwesomeOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./styles";

const CardHeader = () => {
  const { t } = useTranslation("posts");
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5"
      style={{ backgroundColor: TEAL_BG, borderBottom: `1px solid ${TEAL_BORDER}` }}
    >
      <div
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]"
        style={{ backgroundColor: TEAL }}
      >
        <AutoAwesomeOutlined size={17} color="#fff" />
      </div>
      <div>
        <p className="text-[13.5px] font-bold leading-[1.25] text-[#111827]">
          {t("create.form.header_title")}
        </p>
        <p className="text-[11.5px] leading-[1.3] text-[#6B7280]">
          {t("create.form.header_subtitle")}
        </p>
      </div>
    </div>
  );
};

export default CardHeader;
