import { useEffect, useState } from "react";
import BackToLandingButton from "@/components/features/signin/BackToLandingButton";
import SigninForm from "@/components/features/signin/SigninForm";
import SignInHeader from "@/components/features/signin/SignInHeader";
import SigninContainer from "@/components/features/signin/SinginContainer";
import { Box, Typography, Button, Divider } from "@mui/material";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import { useTranslation } from "react-i18next";

const ACCENT = "#0D9488";

const themeColors = {
  primary: ACCENT,
  primaryHover: "#0B8078",
  primaryLight: "#0F9E92",
  gradient: `linear-gradient(135deg, ${ACCENT} 0%, #059669 100%)`,
};

const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const Signin = () => {
  const { t } = useTranslation("auth");
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    if (isMobileDevice()) setShowMobileWarning(true);
  }, []);

  return (
    <>
      <SigninContainer>
        <SignInHeader themeColors={themeColors} />
        <SigninForm themeColors={themeColors} />
        <Divider sx={{ my: 2.5, borderColor: "#F3F4F6" }} />
        <BackToLandingButton themeColors={themeColors} />
      </SigninContainer>

      {/* ── Mobile warning sheet ── */}
      {showMobileWarning && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, bgcolor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 480, bgcolor: "#fff", borderRadius: "24px 24px 0 0", px: 3, pt: 3.5, pb: 5, textAlign: "center" }}>
            <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#E5E7EB", mx: "auto", mb: 3 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneIphoneOutlinedIcon sx={{ fontSize: 26, color: "#9CA3AF" }} />
              </Box>
              <Typography sx={{ fontSize: "1.1rem", color: "#D1D5DB" }}>→</Typography>
              <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: `${ACCENT}14`, border: `1px solid ${ACCENT}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DesktopWindowsOutlinedIcon sx={{ fontSize: 26, color: ACCENT }} />
              </Box>
            </Box>

            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.05rem", color: "#111827", mb: 0.75 }}>
              {t("mobile_warning.title")}
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.75, mb: 3 }}>
              {t("mobile_warning.message")}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowMobileWarning(false)}
              sx={{
                background: `linear-gradient(135deg, ${ACCENT} 0%, #059669 100%)`,
                color: "#fff", fontFamily: "Poppins", fontWeight: 700,
                fontSize: "0.88rem", textTransform: "none", borderRadius: "12px",
                height: 48, boxShadow: `0 4px 14px ${ACCENT}44`, mb: 1.25,
                "&:hover": { background: `linear-gradient(135deg, #0B8078 0%, #047857 100%)` },
              }}
            >
              {t("mobile_warning.continue")}
            </Button>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: "#9CA3AF" }}>
              {t("mobile_warning.note")}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Signin;
