import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import { Box } from "@mui/material";
import { REGISTER_ACCENT } from "./registerConstants";

type Props = {
  label: string;
  onClick: () => void;
  /** Tighter spacing for dense flows (e.g. company register). */
  dense?: boolean;
};

/** Outline pill matching {@link RegisterSignInLink} primary button styling. */
const RegisterChangeRoleButton = ({ label, onClick, dense }: Props) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      width: "100%",
      height: dense ? { xs: 38, sm: 41 } : { xs: 40, sm: 43 },
      /** مسافة بين زر «تغيير الدور» والعنوان أسفله */
      mb: dense ? { xs: 0.85, sm: 0.775 } : { xs: 1.15, sm: 1.875 },
      px: { xs: 1.5, sm: 2 },
      borderRadius: { xs: "12px", sm: "14px" },
      border: `1.5px solid ${REGISTER_ACCENT}44`,
      bgcolor: "transparent",
      color: REGISTER_ACCENT,
      fontFamily: "Poppins",
      fontWeight: 700,
      fontSize: { xs: "0.78rem", sm: "0.95rem" },
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": {
        bgcolor: `${REGISTER_ACCENT}08`,
        borderColor: REGISTER_ACCENT,
      },
    }}
  >
    <ArrowBackOutlined sx={{ fontSize: { xs: 16, sm: 17 }, flexShrink: 0 }} />
    {label}
  </Box>
);

export default RegisterChangeRoleButton;
