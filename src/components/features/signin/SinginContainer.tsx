import { Box, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const SigninContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      overflowX: "hidden",
    }}>

      {/* ── Left panel ── */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        flex: { md: "0 0 45%", lg: "0 0 50%" },
        flexDirection: "column",
        justifyContent: "center",
        px: "clamp(32px, 5vw, 64px)",
        py: "clamp(24px, 5vh, 48px)",
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
        <Box sx={{ position: "absolute", top: "clamp(24px, 4vh, 40px)", left: "clamp(32px, 4vw, 64px)", zIndex: 10 }}>
          <NextLink href="/" style={{ textDecoration: "none", display: "inline-flex", cursor: "pointer" }}>
            <Image
              src="/images/home/TalentAiLogo.png"
              alt="TalentAI"
              width={140}
              height={36}
              style={{ objectFit: "contain", width: "clamp(100px, 10vw, 140px)", height: "auto" }}
            />
          </NextLink>
        </Box>

        {/* Centre content */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: "clamp(240px, 34vw, 440px)" }}>
          {/* Badge */}
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.6, borderRadius: "20px",
            bgcolor: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)",
            mb: "clamp(10px, 2vh, 24px)",
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#5eead4", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "clamp(0.6rem, 0.65vw, 0.78rem)", fontWeight: 600, color: "#5eead4", fontFamily: "Poppins", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {t("signin_panel.badge")}
            </Typography>
          </Box>

          {/* Headline */}
          <Typography sx={{ fontSize: "clamp(1.8rem, 3.6vw, 4.5rem)", fontWeight: 800, color: "#fff", fontFamily: "Poppins", lineHeight: 1.08, mb: "clamp(10px, 2vh, 24px)" }}>
            {t("signin_panel.headline_1")}<br />
            <Box component="span" sx={{ background: "linear-gradient(90deg, #5eead4 0%, #a7f3d0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("signin_panel.headline_2")}
            </Box>
          </Typography>

          {/* Divider bar */}
          <Box sx={{ width: "clamp(36px, 4vw, 56px)", height: 3, borderRadius: 2, background: "linear-gradient(90deg, #5eead4, transparent)", mb: "clamp(10px, 2vh, 24px)" }} />

          {/* Body */}
          <Typography sx={{ fontSize: "clamp(0.78rem, 0.88vw, 1.05rem)", color: "rgba(255,255,255,0.5)", fontFamily: "Poppins", lineHeight: 1.85 }}>
            {t("signin_panel.body")}
          </Typography>
        </Box>

        {/* Copyright */}
        <Typography sx={{ position: "absolute", bottom: "clamp(18px, 3vh, 32px)", left: "clamp(32px, 4vw, 64px)", fontSize: "clamp(0.6rem, 0.65vw, 0.75rem)", color: "rgba(255,255,255,0.2)", fontFamily: "Poppins", zIndex: 1 }}>
          {t("signin_panel.copyright")}
        </Typography>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{
        flex: 1,
        overflowY: "auto",
        scrollBehavior: "smooth",
        background: "#F7F8FA",
        position: "relative",
      }}>
        {/* Subtle bottom radial accent */}
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(13,148,136,0.05) 0%, transparent 60%)",
        }} />

        <Box sx={{
          minHeight: { xs: "100%", md: "100dvh" },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 4.5, lg: 5 },
          py: { xs: 2, sm: 2.5, md: 2.5, lg: 3 },
          position: "relative",
          zIndex: 1,
        }}>
        <Box sx={{ width: "100%", maxWidth: { xs: 360, sm: 400, md: 420 } }}>
          {/* Card */}
          <Box sx={{
            bgcolor: "#fff",
            borderRadius: { xs: "16px", md: "18px" },
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            <Box sx={{ height: 2, bgcolor: ACCENT }} />
            <Box sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 2.5, sm: 2.75 }, pb: { xs: 2.5, sm: 2.75 } }}>
              {children}
            </Box>
          </Box>

          {/* Footer note */}
          <Typography sx={{ mt: { xs: 1.25, md: 1.25 }, px: { xs: 0.5, md: 0.75 }, fontSize: "11px", color: "#9CA3AF", fontFamily: "Poppins", textAlign: "center", lineHeight: 1.55 }}>
            {t("signin_panel.footer_prefix")}{" "}
            <NextLink href="/terms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("signin_panel.terms")}</NextLink>
            {" "}{t("signin_panel.footer_and")}{" "}
            <NextLink href="/privacy" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("signin_panel.privacy")}</NextLink>
          </Typography>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SigninContainer;
