import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { REGISTER_DESKTOP_MIN_PX, registerMq } from "@/components/features/register/registerLayout";

const ACCENT = "#0D9488";

type RegisterContainerProps = {
  children: React.ReactNode;
  /** تسجيل شركة على الجوال: تخطيط أضيق، تمرير داخل اللوحة، أقل مساحة عمودية */
  companyMobileLayout?: boolean;
};

const scrollHiddenBelowDesktopSplit = (theme: Theme, inset?: { pb: string; pt: string }) => ({
  [theme.breakpoints.down(REGISTER_DESKTOP_MIN_PX)]: {
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": { width: 0, height: 0, display: "none" },
    ...(inset ?? {}),
  },
});

const RegisterContainer: React.FC<RegisterContainerProps> = ({ children, companyMobileLayout }) => {
  const { t } = useTranslation("auth");

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...(!companyMobileLayout && { height: "100vh" }),
        ...(companyMobileLayout && {
          height: "100dvh",
          minHeight: "100dvh",
        }),
        [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
          flexDirection: "row",
          ...(companyMobileLayout && {
            height: "100vh",
            minHeight: "100vh",
          }),
        },
      })}
    >
      {/* ── Left panel ── */}
      <Box
        sx={(theme) => ({
          display: "none",
          flexDirection: "column",
          justifyContent: "center",
          px: "clamp(32px, 5vw, 64px)",
          py: "clamp(24px, 5vh, 48px)",
          background: "linear-gradient(155deg, #052e2b 0%, #08504a 45%, #0a6b62 100%)",
          position: "relative",
          overflow: "hidden",
          [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
            display: "flex",
            flex: "0 0 45%",
          },
          [theme.breakpoints.up("lg")]: {
            flex: "0 0 50%",
          },
        })}
      >
        <Box sx={{ position: "absolute", top: -100, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 65%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -140, left: -100, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 65%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {[480, 360, 250, 150].map((size, i) => (
          <Box
            key={size}
            sx={{
              position: "absolute",
              right: -(size / 2.2),
              top: "50%",
              transform: "translateY(-50%)",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `1px solid rgba(94,234,212,${0.12 - i * 0.025})`,
              pointerEvents: "none",
            }}
          />
        ))}
        <Box sx={{ position: "absolute", top: "28%", right: "22%", width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(94,234,212,0.5)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "62%", right: "34%", width: 5, height: 5, borderRadius: "50%", bgcolor: "rgba(94,234,212,0.35)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "42%", right: "14%", width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(167,243,208,0.4)", pointerEvents: "none" }} />

        <Box sx={{ position: "absolute", top: "clamp(24px, 4vh, 40px)", left: "clamp(32px, 4vw, 64px)", zIndex: 1 }}>
          <NextLink href="/home/company" style={{ textDecoration: "none", display: "inline-block" }}>
            <Image
              src="/images/home/TalentAiLogo.png"
              alt="TalentAI"
              width={140}
              height={36}
              style={{ objectFit: "contain", width: "clamp(100px, 10vw, 140px)", height: "auto" }}
            />
          </NextLink>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: "clamp(240px, 34vw, 440px)" }}>
          <Box sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.6,
            borderRadius: "20px",
            bgcolor: "rgba(94,234,212,0.1)",
            border: "1px solid rgba(94,234,212,0.2)",
            mb: "clamp(10px, 2vh, 24px)",
          }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#5eead4", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "clamp(0.6rem, 0.65vw, 0.78rem)", fontWeight: 600, color: "#5eead4", fontFamily: "Poppins", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {t("register_panel.badge")}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "clamp(1.6rem, 3.2vw, 3.8rem)", fontWeight: 800, color: "#fff", fontFamily: "Poppins", lineHeight: 1.08, mb: "clamp(10px, 2vh, 24px)" }}>
            {t("register_panel.headline_1")}<br />
            <Box component="span" sx={{ background: "linear-gradient(90deg, #5eead4 0%, #a7f3d0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("register_panel.headline_2")}
            </Box>
          </Typography>

          <Box sx={{ width: "clamp(36px, 4vw, 56px)", height: 3, borderRadius: 2, background: "linear-gradient(90deg, #5eead4, transparent)", mb: "clamp(10px, 2vh, 24px)" }} />

          <Typography sx={{ fontSize: "clamp(0.78rem, 0.88vw, 1.05rem)", color: "rgba(255,255,255,0.5)", fontFamily: "Poppins", lineHeight: 1.85 }}>
            {t("register_panel.body")}
          </Typography>
        </Box>

        <Typography sx={{ position: "absolute", bottom: "clamp(18px, 3vh, 32px)", left: "clamp(32px, 4vw, 64px)", fontSize: "clamp(0.6rem, 0.65vw, 0.75rem)", color: "rgba(255,255,255,0.2)", fontFamily: "Poppins", zIndex: 1 }}>
          {t("register_panel.copyright")}
        </Typography>
      </Box>

      {/* ── Right panel ── */}
      <Box
        sx={(theme) => ({
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          background: "#F7F8FA",
          ...(companyMobileLayout && {
            background: "#F4F6F6",
            [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
              background: "#F7F8FA",
            },
          }),
          position: "relative",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <Box sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(13,148,136,0.05) 0%, transparent 60%)",
        }}
        />

        <Box
          sx={(theme) => ({
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            position: "relative",
            zIndex: 1,
            WebkitOverflowScrolling: "touch",
            ...(companyMobileLayout && {
              justifyContent: "flex-start",
              px: { xs: 1.25, sm: 1.75, md: 2.25 },
              py: { xs: 0.9, sm: 1.1, md: 1.35 },
              [registerMq.tabletOnly]: {
                justifyContent: "space-between",
                px: 1.25,
                py: 0.9,
              },
              [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                justifyContent: "center",
                px: 4,
                py: 3,
              },
              [theme.breakpoints.up("lg")]: {
                px: 5,
              },
              ...scrollHiddenBelowDesktopSplit(theme, {
                pb: `calc(${theme.spacing(1)} + env(safe-area-inset-bottom, 0px))`,
                pt: `calc(${theme.spacing(0.5)} + env(safe-area-inset-top, 0px))`,
              }),
            }),
            ...(!companyMobileLayout && {
              [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                px: 4,
              },
              [theme.breakpoints.up("lg")]: {
                px: 5,
              },
            }),
          })}
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              mb: 2.5,
              flexShrink: 0,
              ...(companyMobileLayout && {
                mb: { xs: 0.5, sm: 0.5 },
                [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                  mb: 2,
                },
              }),
              [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                display: "none",
              },
            })}
          >
            <NextLink href="/home/company" style={{ textDecoration: "none", display: "inline-block" }}>
              <Image
                src="/logo.svg"
                alt="TalentAI"
                width={110}
                height={28}
                style={{
                  objectFit: "contain",
                  width: companyMobileLayout ? 90 : 110,
                  height: "auto",
                }}
              />
            </NextLink>
          </Box>

          <Box
            sx={(theme) => ({
              width: "100%",
              minWidth: 0,
              maxWidth: { xs: "100%", sm: 560, md: 620 },
              flexShrink: 0,
              [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                maxWidth: 600,
              },
              [theme.breakpoints.up("lg")]: {
                maxWidth: 640,
              },
            })}
          >
            <Box
              sx={(theme) => ({
                bgcolor: "#fff",
                borderRadius: companyMobileLayout ? { xs: "14px" } : { xs: "18px" },
                boxShadow: companyMobileLayout
                  ? {
                    xs: "0 1px 0 rgba(13,148,136,0.08), 0 6px 24px rgba(13,148,136,0.1)",
                  }
                  : "0 0 0 1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -4px rgba(0,0,0,0.06)",
                overflow: "hidden",
                [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                  borderRadius: "20px",
                  ...(companyMobileLayout && {
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -4px rgba(0,0,0,0.06)",
                  }),
                },
              })}
            >
              <Box sx={{ height: 2, bgcolor: ACCENT }} />
              <Box
                sx={(theme) => ({
                  px: { xs: 3, sm: 4 },
                  pt: { xs: 3, sm: 3.5 },
                  pb: { xs: 3, sm: 3.5 },
                  ...(companyMobileLayout && {
                    px: { xs: 1.25, sm: 1.75, md: 2.25 },
                    pt: { xs: 1.15, sm: 1.4, md: 1.65 },
                    pb: { xs: 1.15, sm: 1.4, md: 1.65 },
                    [registerMq.tabletOnly]: {
                      px: 1.25,
                      pt: 1.15,
                      pb: 1.15,
                    },
                  }),
                  [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                    px: 4.5,
                    pt: 3.5,
                    pb: 3.5,
                  },
                })}
              >
                {children}
              </Box>
            </Box>

            <Typography
              sx={(theme) => ({
                mt: { xs: 1.5, sm: 2 },
                fontSize: "11.5px",
                color: "#9CA3AF",
                fontFamily: "Poppins",
                textAlign: "center",
                lineHeight: 1.65,
                ...(companyMobileLayout && {
                  mt: { xs: 1, sm: 1 },
                  fontSize: { xs: "12px", sm: "12px" },
                  px: { xs: 0.5, sm: 0.5 },
                  [theme.breakpoints.up(REGISTER_DESKTOP_MIN_PX)]: {
                    mt: 2,
                    fontSize: "11.5px",
                    px: 0,
                  },
                }),
              })}
            >
              {t("register_panel.footer_prefix")}{" "}
              <NextLink href="/terms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("register_panel.terms")}</NextLink>
              {" "}{t("register_panel.footer_and")}{" "}
              <NextLink href="/privacy" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("register_panel.privacy")}</NextLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterContainer;
