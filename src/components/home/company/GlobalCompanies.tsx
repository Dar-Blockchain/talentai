import React from "react";
import { Box, Typography } from "@mui/material";

const ROW_LABEL_SX = {
  fontFamily: "Poppins",
  fontWeight: 600,
  fontSize: "14px",
  letterSpacing: "0.8px",
  textTransform: "uppercase" as const,
  color: "rgba(89,91,95,0.6)",
  mb: 2,
  textAlign: "center",
};

const clients = [
  { name: "Lightency",     logo: "/images/GLOBAL_COMPANIES/Lightency.png" },
  { name: "Dar Blockchain", logo: "/images/GLOBAL_COMPANIES/DarBlockchain.png" },
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
      {/* Row 1 — Clients (static) */}
      <Typography sx={ROW_LABEL_SX}>Trusted by</Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: { xs: 4, md: 6 }, px: 2, flexWrap: "wrap" }}>
        {clients.map((item) => (
          <Box
            key={item.name}
            component="img"
            src={item.logo}
            alt={`${item.name} logo`}
            sx={{
              height: { xs: 24, md: 32 },
              width: "auto",
              objectFit: "contain",
              opacity: 0.7,
              filter: "grayscale(100%)",
              transition: "opacity 0.2s, filter 0.2s",
              "&:hover": { opacity: 1, filter: "grayscale(0%)" },
            }}
          />
        ))}
      </Box>

      {/* Divider */}
      <Box sx={{ my: 4, borderTop: "1px solid rgba(89,91,95,0.15)" }} />

      {/* Row 2 — Technology partners */}
      <Typography sx={ROW_LABEL_SX}>Partners</Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, mt: 2, flexWrap: "wrap" }}>
        <Box component="img" src="/images/partners/nivdia.png"          alt="NVIDIA Inception Program" sx={{ height: "60px", width: "auto", objectFit: "contain" }} />
        <Box component="img" src="/images/partners/F6s.png"            alt="F6S Top Company AI"       sx={{ height: "60px", width: "auto", objectFit: "contain" }} />
        <Box component="img" src="/images/partners/Hedera-Logo-Lockup-Dark.png" alt="Hedera"          sx={{ height: "60px", width: "auto", objectFit: "contain" }} />
      </Box>
    </Box>
  );
};

export default GlobalCompanies;
