import { Box, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const RegisterContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" } }}>

      {/* ── Left panel ── */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        flex: { md: "0 0 44%", lg: "0 0 50%" },
        flexDirection: "column",
        justifyContent: "center",
        px: { md: 5, lg: 8 },
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

        {/* Concentric rings */}
        {[480, 360, 250, 150].map((size) => (
          <Box key={size} sx={{
            position: "absolute",
            right: -(size / 2.2),
            top: "50%",
            transform: "translateY(-50%)",
            width: size, height: size,
            borderRadius: "50%",
            border: "1px solid rgba(94,234,212,0.1)",
            pointerEvents: "none",
          }} />
        ))}

        {/* Floating dots */}
        <Box sx={{ position: "absolute", top: "28%", right: "22%", width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(94,234,212,0.5)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "62%", right: "34%", width: 5, height: 5, borderRadius: "50%", bgcolor: "rgba(94,234,212,0.35)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "42%", right: "14%", width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(167,243,208,0.4)", pointerEvents: "none" }} />

        {/* Logo */}
        <Box sx={{ position: "absolute", top: 40, left: { md: 40, lg: 64 }, zIndex: 1 }}>
          <NextLink href="/home/company" style={{ textDecoration: "none", display: "inline-block" }}>
            <Image src="/images/home/TalentAiLogo.png" alt="TalentAI" width={140} height={36} style={{ objectFit: "contain" }} />
          </NextLink>
        </Box>

        {/* Centre content */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 400 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 0.6, borderRadius: "20px", bgcolor: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)", mb: 3 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#5eead4" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#5eead4", fontFamily: "Poppins", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Join TalentAI
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { md: "2.6rem", lg: "3.5rem" }, fontWeight: 800, color: "#fff", fontFamily: "Poppins", lineHeight: 1.08, mb: 3 }}>
            Start hiring<br />
            <Box component="span" sx={{ background: "linear-gradient(90deg, #5eead4 0%, #a7f3d0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              smarter today.
            </Box>
          </Typography>

          <Box sx={{ width: 56, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #5eead4, transparent)", mb: 3 }} />

          <Typography sx={{ fontSize: { md: "0.95rem", lg: "1.1rem" }, color: "rgba(255,255,255,0.5)", fontFamily: "Poppins", lineHeight: 1.9 }}>
            Create your account and access AI-powered interviews, candidate scoring, and blockchain-verified credentials.
          </Typography>
        </Box>

        {/* Copyright */}
        <Typography sx={{ position: "absolute", bottom: 32, left: { md: 40, lg: 64 }, fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", fontFamily: "Poppins", zIndex: 1 }}>
          © 2026 TalentAI Inc.
        </Typography>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: { xs: "flex-start", md: "center" },
        background: "linear-gradient(160deg, #f0fdfb 0%, #f8fffe 60%, #ffffff 100%)",
        px: { xs: 2, sm: 4, lg: 6 },
        py: { xs: 4, sm: 5, md: 6 },
        minHeight: { xs: "100vh", md: "unset" },
        position: "relative",
        overflowY: "auto",
      }}>
        {/* Dot pattern — fades out at edges */}
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(${ACCENT}1A 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)",
        }} />

        {/* Soft ambient glow */}
        <Box sx={{
          position: "absolute", top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 500,
          background: `radial-gradient(ellipse, ${ACCENT}09 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <Box sx={{ width: "100%", maxWidth: 680, position: "relative", zIndex: 1, py: { xs: 0, md: 2 } }}>

          {/* ── Mobile header ── */}
          <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", alignItems: "center", mb: 4, pt: 1 }}>
            <NextLink href="/home/company" style={{ textDecoration: "none" }}>

                <Image src="/logo.svg" alt="TalentAI" width={130} height={34} style={{ objectFit: "contain" }} />
            </NextLink>
          </Box>

          {/* ── Card ── */}
          <Box sx={{
            bgcolor: "#fff",
            borderRadius: { xs: "20px", sm: "26px", md: "30px" },
            border: "1px solid rgba(13,148,136,0.1)",
            boxShadow: {
              xs: `0 2px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(13,148,136,0.06)`,
              sm: `0 0 0 5px rgba(13,148,136,0.04), 0 24px 64px -10px rgba(0,0,0,0.13)`,
            },
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Accent bar */}
            <Box sx={{ height: 5, background: `linear-gradient(90deg, ${ACCENT} 0%, #2DD4BF 45%, #34D399 80%, #6EE7B7 100%)` }} />

            {/* Top inner glow */}
            <Box sx={{
              position: "absolute", top: 5, left: 0, right: 0, height: 100,
              background: `linear-gradient(180deg, ${ACCENT}07 0%, transparent 100%)`,
              pointerEvents: "none",
            }} />

            <Box sx={{
              px: { xs: 2.5, sm: 3.5, md: 4, lg: 5.5 },
              pt: { xs: 3.5, sm: 4, md: 4.5, lg: 5 },
              pb: { xs: 4, sm: 4.5, md: 5, lg: 5.5 },
              position: "relative",
            }}>
              {children}
            </Box>
          </Box>

          {/* ── Footer note ── */}
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 32, height: "1px", bgcolor: "#E5E7EB" }} />
              <Typography sx={{ fontSize: "0.68rem", color: "#D1D5DB", fontFamily: "Poppins" }}>🔒</Typography>
              <Box sx={{ width: 32, height: "1px", bgcolor: "#E5E7EB" }} />
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "Poppins", textAlign: "center", lineHeight: 1.9 }}>
              By registering you agree to our{" "}
              <NextLink href="/terms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>Terms of Use</NextLink>
              {" "}and{" "}
              <NextLink href="/privacy" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</NextLink>
            </Typography>
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default RegisterContainer;
