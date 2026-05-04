import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { Box } from "@mui/material";
import { REGISTER_ACCENT } from "./registerConstants";

type Props = {
  label: string;
  onClick: () => void;
};

/** Same styles as `talentai-dev` src/pages/register/index.tsx (form header change-role link). */
const RegisterChangeRoleButton = ({ label, onClick }: Props) => (
  <Box
    onClick={onClick}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      mb: 2.5,
      cursor: "pointer",
      color: "#9CA3AF",
      fontFamily: "Poppins",
      fontSize: "0.8rem",
      fontWeight: 500,
      "&:hover": { color: REGISTER_ACCENT },
      transition: "color 0.2s",
    }}
  >
    <ArrowForwardOutlined sx={{ fontSize: 15, transform: "rotate(180deg)" }} />
    {label}
  </Box>
);

export default RegisterChangeRoleButton;
