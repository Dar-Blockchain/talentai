import React from "react";
import { Box, Typography } from "@mui/material";

const STATS = [
  {
    value: "90%",
    label: "Less Screening Time",
    sub: "AI filters candidates automatically",
    accent: "#0CDA8B",
    bg: "rgba(12,218,139,0.08)",
    border: "rgba(12,218,139,0.20)",
  },
  {
    value: "10x",
    label: "Cheaper Than Traditional",
    sub: "vs. recruiters & agencies",
    accent: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.20)",
  },
  {
    value: "24/7",
    label: "AI Interviews Available",
    sub: "No scheduling, no delays",
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.20)",
  },
  {
    value: "0",
    label: "Bias in Evaluation",
    sub: "Standardized scoring, always",
    accent: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.20)",
  },
];

const clients = [
  { name: "Lightency",     logo: "/images/GLOBAL_COMPANIES/Lightency.png" },
  { name: "Dar Blockchain", logo: "/images/GLOBAL_COMPANIES/DarBlockchain.png" },
];

const partners = [
  { logo: "/images/partners/nivdia.png",                  alt: "NVIDIA Inception Program" },
  { logo: "/images/partners/F6s.png",                     alt: "F6S #22 Top AI Company" },
  { logo: "/images/partners/Hedera-Logo-Lockup-Dark.png", alt: "Built on Hedera Hashgraph" },
];

const GlobalCompanies: React.FC = () => (
  <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>

    {/* ── Stats row ── */}
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
      gap: { xs: 0, md: 0 },
      mb: 7,
      borderRadius: "14px",
      overflow: "hidden",
      border: "1px solid rgba(0,0,0,0.07)",
      boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
    }}>
      {STATS.map((stat, i) => (
        <Box
          key={stat.label}
          sx={{
            bgcolor: "#fff",
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 3, md: 3.5 },
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            borderRight: { md: i < STATS.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none" },
            borderBottom: { xs: i < 2 ? "1px solid rgba(0,0,0,0.07)" : "none", md: "none" },
            position: "relative",
            overflow: "hidden",
            transition: "background 0.2s",
            "&:hover": { bgcolor: stat.bg },
            /* left accent bar */
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0, top: "20%", bottom: "20%",
              width: "3px",
              borderRadius: "0 3px 3px 0",
              background: stat.accent,
              opacity: 0,
              transition: "opacity 0.2s",
            },
            "&:hover::before": { opacity: 1 },
          }}
        >
          <Typography sx={{
            fontFamily: "Poppins",
            fontWeight: 800,
            fontSize: { xs: "36px", md: "48px" },
            lineHeight: 1,
            color: stat.accent,
            letterSpacing: "-2px",
          }}>
            {stat.value}
          </Typography>
          <Typography sx={{
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: { xs: "13px", md: "14px" },
            color: "#111827",
            lineHeight: 1.3,
            mt: 0.5,
          }}>
            {stat.label}
          </Typography>
          <Typography sx={{
            fontFamily: "Poppins",
            fontSize: "11px",
            color: "#9CA3AF",
            lineHeight: 1.5,
          }}>
            {stat.sub}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* ── Trusted by ── */}
    <Box sx={{ mb: 5 }}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 2, mb: 3,
        "&::before, &::after": {
          content: '""', flex: 1,
          height: "1px", bgcolor: "rgba(0,0,0,0.08)",
        },
      }}>
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 600, fontSize: "11px",
          letterSpacing: "1.5px", textTransform: "uppercase",
          color: "rgba(89,91,95,0.5)", whiteSpace: "nowrap", px: 1,
        }}>
          Trusted by
        </Typography>
      </Box>

      <Box sx={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: { xs: 3, md: 4 }, flexWrap: "wrap",
      }}>
        {clients.map((item) => (
          <Box
            key={item.name}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              px: 3, py: 1.5,
              bgcolor: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "10px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.2s, border-color 0.2s",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                borderColor: "rgba(12,218,139,0.30)",
              },
            }}
          >
            <Box
              component="img"
              src={item.logo}
              alt={item.name}
              sx={{
                height: { xs: 22, md: 28 }, width: "auto", objectFit: "contain",
                opacity: 0.7,
                transition: "opacity 0.2s",
                "&:hover": { opacity: 1 },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>

    {/* ── Built on ── */}
    <Box>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 2, mb: 3,
        "&::before, &::after": {
          content: '""', flex: 1,
          height: "1px", bgcolor: "rgba(0,0,0,0.08)",
        },
      }}>
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 600, fontSize: "11px",
          letterSpacing: "1.5px", textTransform: "uppercase",
          color: "rgba(89,91,95,0.5)", whiteSpace: "nowrap", px: 1,
        }}>
          Award-winning infrastructure
        </Typography>
      </Box>

      <Box sx={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: { xs: 3, md: 4 }, flexWrap: "wrap",
      }}>
        {partners.map((p) => (
          <Box
            key={p.alt}
            sx={{
              display: "flex", alignItems: "center",
              px: 3, py: 1.5,
              bgcolor: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "10px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.2s, border-color 0.2s",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                borderColor: "rgba(12,218,139,0.30)",
              },
            }}
          >
            <Box
              component="img"
              src={p.logo}
              alt={p.alt}
              sx={{
                height: { xs: 28, md: 36 }, width: "auto", objectFit: "contain",
                opacity: 0.65, filter: "grayscale(20%)",
                transition: "opacity 0.2s, filter 0.2s",
                "&:hover": { opacity: 1, filter: "grayscale(0%)" },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>

  </Box>
);

export default GlobalCompanies;
