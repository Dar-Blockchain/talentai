import { Box, Button, CircularProgress } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { useTranslation } from "react-i18next";
import { TEAL } from "./styles";

interface Props {
  loading: boolean;
  onClick: () => void;
}

const GenerateButton = ({ loading, onClick }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
      <Button
        variant="contained" fullWidth onClick={onClick} disabled={loading}
        startIcon={loading ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <AutoAwesomeOutlined sx={{ fontSize: 17 }} />}
        sx={{
          textTransform: "none", fontWeight: 700, fontSize: "13.5px",
          borderRadius: "10px", height: 44,
          bgcolor: TEAL, color: "#fff", boxShadow: "none",
          "&:hover": { bgcolor: "#0F766E", boxShadow: "0 4px 14px rgba(13,148,136,0.28)" },
          "&.Mui-disabled": { bgcolor: TEAL, opacity: 0.65, color: "#fff" },
          transition: "all 0.2s",
        }}
      >
        {loading ? t("create.form.btn_generating") : t("create.form.btn_generate")}
      </Button>
    </Box>
  );
};

export default GenerateButton;
