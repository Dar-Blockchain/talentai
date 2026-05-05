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
    <Box sx={{ mb: { xs: 2.5, sm: 3 }, textAlign: "center" }}>
      {/* Mobile-only logo */}
      <Box
        component="img"
        src={userType === "company" ? "/logo.svg" : "/logo-purple.svg"}
        alt="TalentAI Logo"
        sx={{ height: { xs: 22, sm: 24 }, display: { xs: "block", md: "none" }, mb: 2.5, mx: "auto" }}
      />

      {/* Teal accent marks */}
      {/* <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", mb: 1.75 }}>
        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: `${ACCENT}55` }} />
        <Box sx={{ width: 22, height: "2.5px", borderRadius: "2px", bgcolor: ACCENT }} />
        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: `${ACCENT}55` }} />
      </Box> */}

      <Typography sx={{
        fontSize: { xs: "1.45rem", sm: "1.6rem", md: "1.75rem" },
        fontWeight: 700,
        fontFamily: "Poppins",
        color: "#0F172A",
        lineHeight: 1.15,
        mb: 0.75,
        letterSpacing: "-0.022em",
      }}>
        {t("signin.title")}
      </Typography>

      <Typography sx={{
        fontSize: { xs: "0.83rem", sm: "0.87rem", md: "0.9rem" },
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
