import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Slide,
  Collapse,
  Switch,
  Divider,
} from "@mui/material";
import CookieOutlined from "@mui/icons-material/CookieOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import AdsClickOutlined from "@mui/icons-material/AdsClick";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlined from "@mui/icons-material/KeyboardArrowUpOutlined";

const COOKIE_KEY = "talentai_cookie_consent";
const TEAL = "#0D9488";

interface CookiePrefs {
  analytics: boolean;
  marketing: boolean;
}

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({ analytics: true, marketing: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const save = (value: string) => {
    localStorage.setItem(COOKIE_KEY, value);
    setVisible(false);
  };

  const acceptAll = () => save("accepted");
  const rejectAll = () => save("declined");
  const savePrefs  = () => save(JSON.stringify({ essential: true, ...prefs }));

  const categories = [
    {
      key: "essential" as const,
      icon: <ShieldOutlined sx={{ fontSize: 16, color: TEAL }} />,
      label: "Essential",
      desc: "Required for authentication, sessions, and security. Cannot be disabled.",
      always: true,
    },
    {
      key: "analytics" as const,
      icon: <BarChartOutlined sx={{ fontSize: 16, color: "#7C3AED" }} />,
      label: "Analytics",
      desc: "Help us understand how visitors use TalentAI to improve features and performance.",
      always: false,
    },
    {
      key: "marketing" as const,
      icon: <AdsClickOutlined sx={{ fontSize: 16, color: "#D97706" }} />,
      label: "Marketing",
      desc: "Deliver relevant job opportunities and recruitment content based on your activity.",
      always: false,
    },
  ];

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          bgcolor: "#111827",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── Expanded preferences panel (above main row) ── */}
        <Collapse in={expanded}>
          <Box
            sx={{
              maxWidth: 1400,
              mx: "auto",
              px: { xs: 2, sm: 4, md: 6 },
              pt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {categories.map((cat) => (
              <Box
                key={cat.key}
                sx={{
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "7px",
                        bgcolor: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cat.icon}
                    </Box>
                    <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.82rem", color: "#F9FAFB" }}>
                      {cat.label}
                    </Typography>
                  </Box>

                  {cat.always ? (
                    <Box
                      sx={{
                        fontSize: "0.68rem",
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        color: TEAL,
                        bgcolor: "rgba(13,148,136,0.12)",
                        px: 0.9,
                        py: 0.25,
                        borderRadius: "5px",
                      }}
                    >
                      Always on
                    </Box>
                  ) : (
                    <Switch
                      checked={prefs[cat.key as keyof CookiePrefs] === true}
                      onChange={(e) => setPrefs(p => ({ ...p, [cat.key]: e.target.checked }))}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: TEAL },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: TEAL },
                        "& .MuiSwitch-track": { bgcolor: "rgba(255,255,255,0.2)" },
                      }}
                    />
                  )}
                </Box>

                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.73rem", color: "#6B7280", lineHeight: 1.6 }}>
                  {cat.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Save preferences row */}
          <Box
            sx={{
              maxWidth: 1400,
              mx: "auto",
              px: { xs: 2, sm: 4, md: 6 },
              py: 1.5,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={savePrefs}
              size="small"
              variant="contained"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "none",
                bgcolor: TEAL,
                color: "#fff",
                px: 2.5,
                py: 0.7,
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": { bgcolor: "#0B7A71", boxShadow: "none" },
              }}
            >
              Save preferences
            </Button>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />
        </Collapse>

        {/* ── Main row ── */}
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 1.75, sm: 1.5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* Icon + text */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                flexShrink: 0,
                mt: 0.15,
                width: 34,
                height: 34,
                borderRadius: "9px",
                bgcolor: "rgba(13,148,136,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CookieOutlined sx={{ fontSize: 17, color: TEAL }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.88rem", color: "#F9FAFB", mb: 0.2 }}>
                We value your privacy
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.76rem", color: "#9CA3AF", lineHeight: 1.6, maxWidth: 700 }}>
                TalentAI uses <strong style={{ color: "#D1D5DB" }}>essential</strong>,{" "}
                <strong style={{ color: "#D1D5DB" }}>analytics</strong>, and{" "}
                <strong style={{ color: "#D1D5DB" }}>marketing</strong> cookies to ensure the platform works,
                improve your experience, and personalise job recommendations. Accept all or manage your preferences.
              </Typography>
            </Box>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, flexWrap: "wrap" }}>
            <Button
              onClick={() => setExpanded(v => !v)}
              size="small"
              endIcon={expanded ? <KeyboardArrowDownOutlined sx={{ fontSize: 15 }} /> : <KeyboardArrowUpOutlined sx={{ fontSize: 15 }} />}
              startIcon={<TuneOutlined sx={{ fontSize: 15 }} />}
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "0.78rem",
                textTransform: "none",
                color: expanded ? "#F9FAFB" : "#9CA3AF",
                border: `1px solid ${expanded ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: "8px",
                px: 1.75,
                py: 0.65,
                bgcolor: expanded ? "rgba(255,255,255,0.06)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#F9FAFB", border: "1px solid rgba(255,255,255,0.22)" },
              }}
            >
              Manage
            </Button>

            <Button
              onClick={rejectAll}
              size="small"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "0.78rem",
                textTransform: "none",
                color: "#9CA3AF",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                px: 1.75,
                py: 0.65,
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#D1D5DB", border: "1px solid rgba(255,255,255,0.22)" },
              }}
            >
              Reject all
            </Button>

            <Button
              onClick={acceptAll}
              size="small"
              variant="contained"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "none",
                bgcolor: TEAL,
                color: "#fff",
                px: 2.25,
                py: 0.65,
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": { bgcolor: "#0B7A71", boxShadow: "none" },
              }}
            >
              Accept all
            </Button>

            <Box
              onClick={rejectAll}
              sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#4B5563", ml: 0.25, "&:hover": { color: "#9CA3AF" } }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>

      </Box>
    </Slide>
  );
};

export default CookieBanner;
