import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = { themeColors: any };

const ACCENT = "#0D9488";

const SignInHeader: React.FC<Props> = ({ themeColors: _themeColors }) => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{ mb: { xs: 1.85, sm: 2.875 }, textAlign: "center" }}>
      {/* Teal accent marks */}
      {/* <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", mb: 1.75 }}>
        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: `${ACCENT}55` }} />
        <Box sx={{ width: 22, height: "2.5px", borderRadius: "2px", bgcolor: ACCENT }} />
        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: `${ACCENT}55` }} />
      </Box> */}

      <Typography sx={{
        fontSize: { xs: "clamp(1.15rem, 4vw, 1.65rem)", sm: "clamp(1.5rem, 2.8vw, 1.9rem)" },
        fontWeight: 800,
        fontFamily: "Poppins",
        color: "#0F172A",
        lineHeight: { xs: 1.12, sm: 1.15 },
        mb: { xs: 0.85, sm: 0.625 },
        letterSpacing: "-0.025em",
      }}>
        {t("signin.title")}
      </Typography>

      <Typography sx={{
        fontSize: { xs: "0.8rem", sm: "0.95rem" },
        color: "#6B7280",
        fontFamily: "Poppins",
        lineHeight: { xs: 1.5, sm: 1.6 },
      }}>
        {t("signin.subtitle_prefix")}
        <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>TalentAI</Box>
        {t("signin.subtitle_suffix")}
      </Typography>
    </Box>
  );
};

export default SignInHeader;
