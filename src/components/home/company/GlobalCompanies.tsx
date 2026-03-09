import React from "react";
import { Box, Typography } from "@mui/material";

const ROW_LABEL_SX = {
  fontFamily: "Poppins",
  fontWeight: 600,
  fontSize: "11px",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  color: "rgba(89,91,95,0.5)",
  mb: 2,
  textAlign: "center",
};

const STATS = [
  {
    value: "90%",
    label: "Less Screening Time",
    accent: "#0CDA8B",
    bg: "rgba(12,218,139,0.08)",
    bar: 90,
    icon: "⚡",
  },
  {
    value: "10x",
    label: "Cheaper Than Traditional",
    accent: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
    bar: 75,
    icon: "💰",
  },
  {
    value: "24/7",
    label: "AI Interviews Available",
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    bar: 100,
    icon: "🤖",
  },
  {
    value: "0",
    label: "Bias in Evaluation",
    accent: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    bar: 0,
    icon: "⚖️",
  },
];

const clients = [
  { name: "Lightency",      logo: "/images/GLOBAL_COMPANIES/Lightency.png" },
  { name: "Dar Blockchain",  logo: "/images/GLOBAL_COMPANIES/DarBlockchain.png" },
];

const GlobalCompanies: React.FC = () => {
  return (
    <Box sx={{
      maxWidth: 1400,
      mx: "auto",
      background: "#EFF0F0",
      borderRadius: 3,
      px: { xs: 3, md: 6 },
      py: { xs: 4, md: 5 },
    }}>

      {/* ── Stats cards ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: { xs: 2, md: 2.5 },
        mb: 5,
      }}>
        {STATS.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
              transition: "transform 0.18s, box-shadow 0.18s",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
              },
            }}
          >
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: stat.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>
              {stat.icon}
            </Box>
            <Typography sx={{
              fontFamily: "Poppins", fontWeight: 800,
              fontSize: { xs: "28px", md: "36px" },
              lineHeight: 1, color: stat.accent, letterSpacing: "-0.5px",
            }}>
              {stat.value}
            </Typography>
            <Typography sx={{
              fontFamily: "Poppins", fontSize: "12px",
              fontWeight: 600, color: "#374151", lineHeight: 1.4,
            }}>
              {stat.label}
            </Typography>
            <Box sx={{ height: 4, bgcolor: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{
                height: "100%", width: `${stat.bar}%`,
                bgcolor: stat.accent, borderRadius: 2, transition: "width 1s ease",
              }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ mb: 4, borderTop: "1px solid rgba(89,91,95,0.12)" }} />

      {/* ── Clients ── */}
      <Typography sx={ROW_LABEL_SX}>Trusted by teams that can't afford a slow hire</Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: { xs: 4, md: 6 }, px: 2, flexWrap: "wrap", mb: 4 }}>
        {clients.map((item) => (
          <Box
            key={item.name}
            component="img"
            src={item.logo}
            alt={`${item.name} logo`}
            sx={{
              height: { xs: 24, md: 32 }, width: "auto", objectFit: "contain",
              opacity: 0.6, filter: "grayscale(100%)",
              transition: "opacity 0.2s, filter 0.2s",
              "&:hover": { opacity: 1, filter: "grayscale(0%)" },
            }}
          />
        ))}
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ mb: 4, borderTop: "1px solid rgba(89,91,95,0.12)" }} />

      {/* ── Partners ── */}
      <Typography sx={ROW_LABEL_SX}>Built on award-winning infrastructure</Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: { xs: 3, md: 5 }, mt: 2, flexWrap: "wrap" }}>
        <Box component="img" src="/images/partners/nivdia.png"                  alt="NVIDIA Inception Program"  sx={{ height: "52px", width: "auto", objectFit: "contain", opacity: 0.85, "&:hover": { opacity: 1 } }} />
        <Box component="img" src="/images/partners/F6s.png"                     alt="FGS #22 Top AI Company"    sx={{ height: "52px", width: "auto", objectFit: "contain", opacity: 0.85, "&:hover": { opacity: 1 } }} />
        <Box component="img" src="/images/partners/Hedera-Logo-Lockup-Dark.png" alt="Built on Hedera Hashgraph" sx={{ height: "52px", width: "auto", objectFit: "contain", opacity: 0.85, "&:hover": { opacity: 1 } }} />
      </Box>
    </Box>
  );
};

export default GlobalCompanies;
