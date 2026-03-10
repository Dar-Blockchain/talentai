import React from "react";
import { Box, Typography } from "@mui/material";

const clients = [
  { name: "Dar Blockchain", logo: "/images/GLOBAL_COMPANIES/DarBlockchain.png" },
  { name: "Lightency",      logo: "/images/GLOBAL_COMPANIES/Lightency.png" },
];

const partners = [
  { logo: "/images/partners/nivdia.png",  alt: "NVIDIA Inception Program" },
  { logo: "/images/partners/F6s.png",     alt: "F6S #22 Top AI Company" },
  { logo: "/images/partners/hedera.png",  alt: "Built on Hedera Hashgraph" },
];

const LABEL_SX = {
  fontFamily: "Poppins", fontWeight: 600, fontSize: "11px",
  letterSpacing: "1.5px", textTransform: "uppercase" as const,
  color: "rgba(89,91,95,0.5)", mb: 2,
};

const GlobalCompanies: React.FC = () => (
  <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      gap: { xs: 4, md: 0 },
      alignItems: "center",
    }}>

      {/* TRUSTED BY */}
      <Box>
        <Typography sx={LABEL_SX}>Trusted by</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 3, md: 4 }, flexWrap: "wrap" }}>
          {clients.map((item) => (
            <Box
              key={item.name}
              component="img"
              src={item.logo}
              alt={item.name}
              sx={{ height: { xs: 24, md: 30 }, width: "auto", objectFit: "contain" }}
            />
          ))}
        </Box>
      </Box>

      {/* PARTNERS */}
      <Box sx={{ borderLeft: { md: "1px solid rgba(0,0,0,0.08)" }, pl: { md: 6 } }}>
        <Typography sx={LABEL_SX}>Partners</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 3, md: 4 }, flexWrap: "wrap" }}>
          {partners.map((p) => (
            <Box
              key={p.alt}
              component="img"
              src={p.logo}
              alt={p.alt}
              sx={{ height: { xs: 28, md: 36 }, width: "auto", objectFit: "contain" }}
            />
          ))}
        </Box>
      </Box>

    </Box>
  </Box>
);

export default GlobalCompanies;
