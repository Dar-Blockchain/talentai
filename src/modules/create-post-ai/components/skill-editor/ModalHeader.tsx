import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  skillType: "hard" | "soft";
  mode: "add" | "edit";
  onClose: () => void;
}

const ModalHeader = ({ skillType, mode, onClose }: Props) => {
  const { t } = useTranslation("posts");

  const titleKey =
    skillType === "hard"
      ? mode === "edit"
        ? "create.post_form.skill_modal.title_edit_hard"
        : "create.post_form.skill_modal.title_add_hard"
      : mode === "edit"
        ? "create.post_form.skill_modal.title_edit_soft"
        : "create.post_form.skill_modal.title_add_soft";

  return (
    <DialogTitle sx={{ borderBottom: "1px solid rgba(227, 229, 233, 1)", color: "black" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ color: "rgba(41, 210, 145, 1)", fontFamily: "Poppins", fontWeight: 600, fontSize: "20px" }}
        >
          {t(titleKey)}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "black" }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
  );
};

export default ModalHeader;
