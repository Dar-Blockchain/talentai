import { Box } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { useTranslation } from "react-i18next";

interface Props {
  loading: boolean;
  onClick: () => void;
}

const GenerateButton = ({ loading, onClick }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
      <Button
        className="h-11 w-full rounded-[10px] text-[13.5px] font-bold shadow-none transition-all"
        onClick={onClick}
        disabled={loading}
        loading={loading}
      >
        {!loading && <AutoAwesomeOutlined sx={{ fontSize: 17 }} />}
        {loading ? t("create.form.btn_generating") : t("create.form.btn_generate")}
      </Button>
    </Box>
  );
};

export default GenerateButton;
