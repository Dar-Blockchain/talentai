import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = { themeColors: any };

const ACCENT = "#0D9488";

const BackToLandingButton: React.FC<Props> = ({ themeColors }) => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const registerHref = returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/register";

  return (
    <Box sx={{
      textAlign: "center",
      pt: 0.5,
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
        <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "Poppins", whiteSpace: "nowrap" }}>
          New to TalentAI?
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      </Box>
      <Link href={registerHref} style={{ textDecoration: "none" }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 48, borderRadius: "14px",
          border: `1.5px solid ${ACCENT}44`,
          color: ACCENT, fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem",
          transition: "all 0.2s",
          "&:hover": { bgcolor: `${ACCENT}08`, borderColor: ACCENT },
        }}>
          Create a free account
        </Box>
      </Link>
    </Box>
  );
};

export default BackToLandingButton;
