import { Button } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import { useTranslation } from "react-i18next";
import { TEAL, TEAL_BG } from "./styles";

interface Props {
  skillType: "hard" | "soft";
  onClick: () => void;
}

const AddSkillButton: React.FC<Props> = ({ skillType, onClick }) => {
  const { t } = useTranslation("posts");
  return (
    <Button
      variant="outlined"
      startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
      onClick={onClick}
      sx={{
        height: 30, fontSize: "12px", fontWeight: 600, textTransform: "none",
        borderRadius: "15px", px: 1.5,
        border: "1px dashed #D1D5DB",
        color: "#6B7280", bgcolor: "#F9FAFB",
        "&:hover": { borderColor: TEAL, color: TEAL, bgcolor: TEAL_BG },
      }}
    >
      {t(skillType === "hard" ? "create.preview.btn_add_hard_skill" : "create.preview.btn_add_soft_skill")}
    </Button>
  );
};

export default AddSkillButton;
