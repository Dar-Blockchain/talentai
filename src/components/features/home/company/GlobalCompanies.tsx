import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const clients = [
  { name: "Dar Blockchain", logo: "/images/GLOBAL_COMPANIES/DarBlockchain.png" },
  { name: "Lightency",      logo: "/images/GLOBAL_COMPANIES/Lightency.png" },
];

const partners = [
  { logo: "/images/partners/nivdia.png",  alt: "NVIDIA Inception Program" },
  { logo: "/images/partners/F6s.png",     alt: "F6S #22 Top AI Company" },
  { logo: "/images/partners/hedera.png",  alt: "Built on Hedera Hashgraph" },
];

const VP   = { once: true, margin: "-40px" };
const ease = [0.22, 1, 0.36, 1] as const;

const allLogos = [
  ...clients.map((c) => ({ src: c.logo, alt: c.name, h: 26 })),
  ...partners.map((p) => ({ src: p.logo, alt: p.alt, h: 32 })),
];

const GlobalCompanies: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.5, ease }}
      >
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 500, fontSize: "12px",
          letterSpacing: "2px", textTransform: "uppercase",
          color: "rgba(89,91,95,0.45)", textAlign: "center", mb: 3,
        }}>
          {t("trusted")}
        </Typography>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VP}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
      >
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: { xs: 3, md: 0 },
        }}>
          {allLogos.map((logo, i) => (
            <motion.div
              key={logo.alt}
              variants={{
                hidden:  { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
              }}
            >
              <Box sx={{
                display: "flex",
                alignItems: "center",
                px: { xs: 0, md: 4 },
                borderRight: {
                  md: i < allLogos.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                },
              }}>
                <Box
                  component="img"
                  src={logo.src}
                  alt={logo.alt}
                  sx={{
                    height: { xs: logo.h * 0.85, md: logo.h },
                    width: "auto",
                    objectFit: "contain",
                    opacity: 0.75,
                    filter: "grayscale(20%)",
                    transition: "opacity 0.2s, filter 0.2s",
                    "&:hover": { opacity: 1, filter: "grayscale(0%)" },
                  }}
                />
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
};

export default GlobalCompanies;
