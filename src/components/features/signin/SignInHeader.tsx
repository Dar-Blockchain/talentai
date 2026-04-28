import { RootState } from "@/store/store";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

type Props = { themeColors: any };

const ACCENT = "#0D9488";

const SignInHeader: React.FC<Props> = ({ themeColors }) => {
  const { t } = useTranslation("auth");
  const userType = useSelector((state: RootState) => state.user.userType);

  return (
    <Box sx={{ mb: 3.5, textAlign: "center" }}>
      {/* Mobile-only logo */}
      <Box
        component="img"
        src={userType === "company" ? "/logo.svg" : "/logo-purple.svg"}
        alt="TalentAI Logo"
        sx={{ height: 26, display: { xs: "block", md: "none" }, mb: 3, mx: "auto" }}
      />

      <Typography sx={{
        fontSize: "2rem",
        fontWeight: 800,
        fontFamily: "Poppins",
        color: "#0F172A",
        lineHeight: 1.15,
        mb: 0.75,
        letterSpacing: "-0.025em",
      }}>
        {t("signin.title")}
      </Typography>
      <Typography sx={{
        fontSize: "1rem",
        color: "#6B7280",
        fontFamily: "Poppins",
        lineHeight: 1.6,
      }}>
        {t("signin.subtitle_prefix")}
        <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>TalentAI</Box>
        {t("signin.subtitle_suffix")}
      </Typography>
    </Box>
  );
};

export default SignInHeader;
