import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { REGISTER_ACCENT } from "./registerConstants";

type Props = {
  returnUrl?: string;
  dividerLabel: string;
  buttonLabel: string;
  /** Reduces vertical padding for tall forms (e.g. company register). */
  dense?: boolean;
};

const SignInLink = ({ returnUrl, dividerLabel, buttonLabel, dense }: Props) => (
  <Box sx={{ pt: dense ? { xs: 0, sm: 0 } : { xs: 0.25, sm: 0.5 } }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.125 }, mb: dense ? { xs: 0.75, sm: 0.875 } : { xs: 1, sm: 1.625 } }}>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      <Typography
        sx={{
          fontSize: { xs: "0.62rem", sm: "0.75rem" },
          color: "#9CA3AF",
          fontFamily: "Poppins",
          whiteSpace: "nowrap",
        }}
      >
        {dividerLabel}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
    </Box>
    <Link
      href={returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin"}
      style={{ textDecoration: "none" }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: dense ? { xs: 38, sm: 41 } : { xs: 40, sm: 43 },
          borderRadius: { xs: "12px", sm: "14px" },
          border: `1.5px solid ${REGISTER_ACCENT}44`,
          color: REGISTER_ACCENT,
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: { xs: "0.78rem", sm: "0.95rem" },
          transition: "all 0.2s",
          "&:hover": { bgcolor: `${REGISTER_ACCENT}08`, borderColor: REGISTER_ACCENT },
        }}
      >
        {buttonLabel}
      </Box>
    </Link>
  </Box>
);

export default SignInLink;
