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
    <Box sx={{ pt: { xs: 0.25, sm: 0.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.125 }, mb: { xs: 1, sm: 1.625 } }}>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
        <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.75rem" }, color: "#9CA3AF", fontFamily: "Poppins", whiteSpace: "nowrap" }}>
          {t("signin.new_here")}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      </Box>
      <Link href={registerHref} style={{ textDecoration: "none" }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "100%",
          height: { xs: 40, sm: 43 },
          borderRadius: { xs: "12px", sm: "14px" },
          border: `1.5px solid ${themeColors.primary}44`,
          color: themeColors.primary,
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: { xs: "0.78rem", sm: "0.95rem" },
          transition: "all 0.2s",
          "&:hover": { bgcolor: `${themeColors.primary}08`, borderColor: themeColors.primary },
        }}>
          {t("signin.create_account")}
        </Box>
      </Link>
    </Box>
  );
};

export default BackToLandingButton;
