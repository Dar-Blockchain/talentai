import { useEffect, useState } from "react";
import BackToLandingButton from "@/components/features/signin/BackToLandingButton";
import SigninForm from "@/components/features/signin/SigninForm";
import SignInHeader from "@/components/features/signin/SignInHeader";
import SigninContainer from "@/components/features/signin/SinginContainer";
import { RootState } from "@/store/store";
import { Box, Typography, Button, Divider } from "@mui/material";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import { useSelector } from "react-redux";

const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

const Signin = () => {
  const userType = useSelector((state: RootState) => state.user.userType);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    if (isMobileDevice()) setShowMobileWarning(true);
  }, []);

  const themeColors = {
    primary:
      userType === "company"
        ? "rgba(41, 210, 145, 0.83)"
        : userType === "employee"
        ? "rgba(33, 150, 243, 0.83)"
        : "rgba(131, 16, 255, 0.83)",
    primaryHover:
      userType === "company"
        ? "rgba(41, 210, 145, 0.73)"
        : userType === "employee"
        ? "rgba(33, 150, 243, 0.73)"
        : "rgba(131, 16, 255, 0.73)",
    primaryLight:
      userType === "company"
        ? "rgba(41, 210, 145, 0.93)"
        : userType === "employee"
        ? "rgba(33, 150, 243, 0.93)"
        : "rgba(131, 16, 255, 0.93)",
    gradient:
      userType === "company"
        ? "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)"
        : userType === "employee"
        ? "linear-gradient(135deg, rgba(33, 150, 243, 0.33), #2196F3)"
        : "linear-gradient(135deg, rgba(131, 16, 255, 0.33), #8310FF)",
  };

  return (
    <>
      <SigninContainer>
        <SignInHeader themeColors={themeColors} />
        <SigninForm themeColors={themeColors} />
        <Divider sx={{ my: 3 }} />
        <BackToLandingButton themeColors={themeColors} />
      </SigninContainer>

      {/* ── Mobile device warning overlay ── */}
      {showMobileWarning && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            bgcolor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 480,
              bgcolor: "#fff",
              borderRadius: "24px 24px 0 0",
              px: 3,
              pt: 3.5,
              pb: 5,
              textAlign: "center",
            }}
          >
            {/* Drag handle */}
            <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#E5E7EB", mx: "auto", mb: 3 }} />

            {/* Icons */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneIphoneOutlinedIcon sx={{ fontSize: 26, color: "#9CA3AF" }} />
              </Box>
              <Typography sx={{ fontSize: "1.2rem", color: "#D1D5DB" }}>→</Typography>
              <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: "rgba(131,16,255,0.08)", border: "1px solid rgba(131,16,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DesktopWindowsOutlinedIcon sx={{ fontSize: 26, color: "#8310FF" }} />
              </Box>
            </Box>

            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.05rem", color: "#111827", mb: 0.75 }}>
              Best experienced on desktop
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.75, mb: 3 }}>
              TalentAI is designed for desktop use — AI interviews require a camera and microphone that work best on a PC or laptop. Please open this link on your computer for the full experience.
            </Typography>

            {/* CTA */}
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowMobileWarning(false)}
              sx={{
                bgcolor: "#8310FF", color: "#fff", fontFamily: "Poppins", fontWeight: 700,
                fontSize: "0.88rem", textTransform: "none", borderRadius: "12px", py: 1.35,
                boxShadow: "none", mb: 1.25,
                "&:hover": { bgcolor: "#6d0ee0", boxShadow: "none" },
              }}
            >
              Continue anyway
            </Button>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: "#9CA3AF" }}>
              Some features may not work correctly on mobile devices.
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Signin;
