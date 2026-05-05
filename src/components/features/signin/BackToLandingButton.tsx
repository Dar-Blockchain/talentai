import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

type Props = { themeColors: any };

const BackToLandingButton: React.FC<Props> = ({ themeColors }) => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const registerHref = returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/register";

  return (
    <Box sx={{ pt: 0.25 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.75 }}>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#F1F5F9" }} />
        <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.72rem" }, color: "#C4C9D4", fontFamily: "Poppins", whiteSpace: "nowrap" }}>
          {t("signin.new_here")}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#F1F5F9" }} />
      </Box>
      <Link href={registerHref} style={{ textDecoration: "none" }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: { xs: 42, sm: 44 }, borderRadius: "12px",
          border: "1.5px solid #E5E7EB",
          color: "#374151", fontFamily: "Poppins", fontWeight: 600,
          fontSize: { xs: "0.83rem", sm: "0.87rem" },
          transition: "all 0.15s",
          "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
        }}>
          {t("signin.create_account")}
        </Box>
      </Link>
    </Box>
  );
};

export default BackToLandingButton;
