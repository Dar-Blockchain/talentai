import { RootState } from "@/store/store";
import { Box, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSelector } from "react-redux";

type Props = { themeColors: any };

const ACCENT = "#0D9488";

const SignInHeader: React.FC<Props> = ({ themeColors }) => {
  const userType = useSelector((state: RootState) => state.user.userType);

  return (
    <Box sx={{ mb: 3.5 }}>
      {/* Mobile-only logo */}
      <Box
        component="img"
        src={userType === "company" ? "/logo.svg" : "/logo-purple.svg"}
        alt="TalentAI Logo"
        sx={{ height: 26, display: { xs: "block", md: "none" }, mb: 3 }}
      />

      {/* Icon avatar with glow ring */}
      <Box sx={{ position: "relative", display: "inline-flex", mb: 2.5 }}>
        {/* Outer glow ring */}
        <Box sx={{
          position: "absolute", inset: -6,
          borderRadius: "22px",
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
          border: `1px solid ${ACCENT}20`,
        }} />
        <Box sx={{
          width: 56, height: 56,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${ACCENT}20 0%, ${ACCENT}0C 100%)`,
          border: `1.5px solid ${ACCENT}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}>
          <LockOutlinedIcon sx={{ fontSize: 24, color: ACCENT }} />
        </Box>
      </Box>

      <Typography sx={{
        fontSize: "2rem",
        fontWeight: 800,
        fontFamily: "Poppins",
        color: "#0F172A",
        lineHeight: 1.15,
        mb: 0.75,
        letterSpacing: "-0.025em",
      }}>
        Welcome back
      </Typography>
      <Typography sx={{
        fontSize: "1rem",
        color: "#6B7280",
        fontFamily: "Poppins",
        lineHeight: 1.6,
      }}>
        Sign in to your{" "}
        <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>TalentAI</Box>
        {" "}account
      </Typography>
    </Box>
  );
};

export default SignInHeader;
