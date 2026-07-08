import { Button } from "@/modules/shared/ui/shadcn/button";
import { Sparkles as AutoAwesomeOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  loading: boolean;
  onClick: () => void;
}

const GenerateButton = ({ loading, onClick }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <div className="px-5 pt-4 pb-5">
      <Button
        className="h-11 w-full rounded-[10px] text-[13.5px] font-bold shadow-none transition-all"
        onClick={onClick}
        disabled={loading}
        loading={loading}
      >
        {!loading && <AutoAwesomeOutlined size={17} />}
        {loading ? t("create.form.btn_generating") : t("create.form.btn_generate")}
      </Button>
    </div>
  );
};

export default GenerateButton;
