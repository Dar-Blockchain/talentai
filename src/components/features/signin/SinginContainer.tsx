import { Box, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const SigninContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" } }}>

      {/* ── Left panel ── */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        flex: "0 0 50%",
        flexDirection: "column",
        justifyContent: "center",
        px: 8,
        py: 6,
        background: "linear-gradient(155deg, #052e2b 0%, #08504a 45%, #0a6b62 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow orbs */}
        <Box sx={{ position: "absolute", top: -100, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 65%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -140, left: -100, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Grid overlay */}
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Decorative concentric rings */}
        {[480, 360, 250, 150].map((size, i) => (
          <Box key={size} sx={{
            position: "absolute",
            right: -(size / 2.2),
            top: "50%",
            transform: "translateY(-50%)",
            width: size,
            height: size,
            borderRadius: "50%",
            border: `1px solid rgba(94,234,212,${0.12 - i * 0.025})`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Floating dots */}
        <Box sx={{ position: "absolute", top: "28%", right: "22%", width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(94,234,212,0.5)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "62%", right: "34%", width: 5, height: 5, borderRadius: "50%", bgcolor: "rgba(94,234,212,0.35)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "42%", right: "14%", width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(167,243,208,0.4)", pointerEvents: "none" }} />

        {/* Logo */}
        <Box sx={{ position: "absolute", top: 40, left: 64, zIndex: 1 }}>
          <NextLink href="/home/company" style={{ textDecoration: "none", display: "inline-block" }}>
            <Image src="/images/home/TalentAiLogo.png" alt="TalentAI" width={140} height={36} style={{ objectFit: "contain" }} />
          </NextLink>
        </Box>

        {/* Centre content */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 400 }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.6, borderRadius: "20px",
            bgcolor: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)",
            mb: 3,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#5eead4" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#5eead4", fontFamily: "Poppins", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {t("signin_panel.badge")}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "4.5rem", fontWeight: 800, color: "#fff", fontFamily: "Poppins", lineHeight: 1.08, mb: 3 }}>
            {t("signin_panel.headline_1")}<br />
            <Box component="span" sx={{ background: "linear-gradient(90deg, #5eead4 0%, #a7f3d0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("signin_panel.headline_2")}
            </Box>
          </Typography>

          <Box sx={{ width: 56, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #5eead4, transparent)", mb: 3 }} />

          <Typography sx={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", fontFamily: "Poppins", lineHeight: 1.9 }}>
            {t("signin_panel.body")}
          </Typography>
        </Box>

        {/* Copyright */}
        <Typography sx={{ position: "absolute", bottom: 32, left: 64, fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", fontFamily: "Poppins", zIndex: 1 }}>
          {t("signin_panel.copyright")}
        </Typography>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #f0fdfb 0%, #f7fffe 60%, #ffffff 100%)",
        px: { xs: 3, sm: 5 },
        py: { xs: 5, md: 6 },
        minHeight: { xs: "100vh", md: "unset" },
        position: "relative",
      }}>
        {/* Dot pattern */}
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.45,
          backgroundImage: `radial-gradient(${ACCENT}18 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
        }} />

        <Box sx={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 1 }}>
          {/* Card */}
          <Box sx={{
            bgcolor: "#fff",
            borderRadius: "28px",
            border: "1px solid rgba(13,148,136,0.12)",
            boxShadow: `0 0 0 4px rgba(13,148,136,0.04), 0 20px 60px -12px rgba(0,0,0,0.12)`,
            overflow: "hidden",
          }}>
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${ACCENT} 0%, #34D399 100%)` }} />
            <Box sx={{ px: { xs: 4, sm: 5.5 }, pt: 5, pb: 5.5 }}>
              {children}
            </Box>
          </Box>

          {/* Footer note */}
          <Typography sx={{ mt: 3, fontSize: "12px", color: "#9CA3AF", fontFamily: "Poppins", textAlign: "center", lineHeight: 1.8 }}>
            {t("signin_panel.footer_prefix")}{" "}
            <NextLink href="/terms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("signin_panel.terms")}</NextLink>
            {" "}{t("signin_panel.footer_and")}{" "}
            <NextLink href="/privacy" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("signin_panel.privacy")}</NextLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SigninContainer;
