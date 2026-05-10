import { RootState } from "@/store/store";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

type Props = { themeColors: any };

const ACCENT = "#0D9488";

const SignInHeader: React.FC<Props> = ({ themeColors }) => {
  const { t } = useTranslation("auth");
  const userType = useSelector((state: RootState) => state.user.userType);

  return (
    <Box sx={{ mb: { xs: 1.75, sm: 2 }, textAlign: "center" }}>
      {/* Mobile-only logo */}
      <NextLink href="/" style={{ display: "inline-block" }}>
        <Box
          component="img"
          src={userType === "company" ? "/logo.svg" : "/logo-purple.svg"}
          alt="TalentAI Logo"
          sx={{ height: { xs: 20, sm: 22 }, display: { xs: "block", md: "none" }, mb: 1.75, mx: "auto", cursor: "pointer" }}
        />
      </NextLink>

      <Typography sx={{
        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
        fontWeight: 700,
        fontFamily: "Poppins",
        color: "#0F172A",
        lineHeight: 1.15,
        mb: 0.5,
        letterSpacing: "-0.022em",
      }}>
        {t("signin.title")}
      </Typography>

      <Typography sx={{
        fontSize: { xs: "0.78rem", sm: "0.82rem" },
        color: "#6B7280",
        fontFamily: "Poppins",
        lineHeight: 1.5,
      }}>
        {t("signin.subtitle_prefix")}
        <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>TalentAI</Box>
        {t("signin.subtitle_suffix")}
      </Typography>
    </Box>
  );
};

export default SignInHeader;
