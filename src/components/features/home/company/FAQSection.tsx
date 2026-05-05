import { useState } from "react";
import { Box, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const ACCENT        = "#0D9488";
const ACCENT_BG     = "rgba(13,148,136,0.08)";
const ACCENT_BORDER = "rgba(13,148,136,0.35)";
const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const FAQ_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

interface FaqItem { question: string; answer: string }

/* ── Individual FAQ item ───────────────────────────── */
const FAQItem: React.FC<{
  faq: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}> = ({ faq, index, open, onToggle }) => (
  <motion.div
    variants={{
      hidden:  { opacity: 0, y: 18 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
    }}
  >
    <Box
      onClick={onToggle}
      sx={{
        borderRadius: "16px",
        border: `1px solid ${open ? "rgba(13,148,136,0.30)" : "rgba(0,0,0,0.07)"}`,
        bgcolor: open ? "rgba(13,148,136,0.03)" : "#fff",
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        boxShadow: open
          ? "0 4px 24px rgba(13,148,136,0.10)"
          : "0 1px 6px rgba(0,0,0,0.04)",
        "&:hover": {
          borderColor: "rgba(13,148,136,0.25)",
          boxShadow: "0 4px 20px rgba(13,148,136,0.08)",
        },
        position: "relative",
      }}
    >
      {/* Teal left accent bar */}
      <Box sx={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
        bgcolor: open ? ACCENT : "transparent",
        borderRadius: "16px 0 0 16px",
        transition: "background 0.2s",
      }} />

      {/* Question row */}
      <Box sx={{
        display: "flex", alignItems: "center",
        gap: 2, px: { xs: 2.5, md: 3 }, py: { xs: 2, md: 2.5 },
      }}>
        {/* Index badge */}
        <Box sx={{
          width: 32, height: 32, borderRadius: "10px", flexShrink: 0,
          bgcolor: open ? ACCENT_BG : "rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>
          <Typography sx={{
            fontFamily: "Poppins", fontSize: "11px", fontWeight: 800,
            color: open ? ACCENT : "#9CA3AF", letterSpacing: "0.5px",
          }}>
            {String(index + 1).padStart(2, "0")}
          </Typography>
        </Box>

        {/* Question text */}
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 600,
          fontSize: { xs: "14px", md: "15px" },
          color: open ? "#111827" : "#374151",
          lineHeight: 1.45, flex: 1,
          transition: "color 0.2s",
        }}>
          {faq.question}
        </Typography>

        {/* Toggle icon */}
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease }}
          style={{ flexShrink: 0 }}
        >
          <Box sx={{
            width: 30, height: 30, borderRadius: "50%",
            bgcolor: open ? ACCENT : "rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>
            <AddOutlined sx={{ fontSize: 16, color: open ? "#fff" : "#9CA3AF" }} />
          </Box>
        </motion.div>
      </Box>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
            style={{ overflow: "hidden" }}
          >
            <Box sx={{
              px: { xs: 2.5, md: 3 }, pb: { xs: 2.5, md: 3 },
              pl: { xs: "68px", md: "76px" },
            }}>
              <Typography sx={{
                fontFamily: "Poppins", fontSize: { xs: "13.5px", md: "14px" },
                color: "#6B7280", lineHeight: 1.8,
              }}>
                {faq.answer}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  </motion.div>
);

/* ── Main section ──────────────────────────────────── */
const FAQSection: React.FC = () => {
  const { t } = useTranslation("home");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const faqs: FaqItem[] = FAQ_KEYS.map((k) => ({
    question: t(`faq.q${k}`),
    answer:   t(`faq.a${k}`),
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <Box sx={{ position: "relative", overflow: "hidden", py: { xs: 6, md: 9 } }}>

        {/* Animated background */}
        <motion.div
          animate={{
            borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "50% 40% 60% 30% / 30% 70% 40% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
            x: [0, 25, 0], y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -100, left: -100, width: 420, height: 380,
            background: "radial-gradient(circle at 40% 40%, rgba(13,148,136,0.08) 0%, transparent 70%)", pointerEvents: "none" }}
        />

        <motion.div
          animate={{
            borderRadius: ["40% 60% 60% 40% / 40% 50% 60% 50%", "60% 40% 40% 60% / 60% 40% 50% 40%", "50% 50% 30% 70% / 50% 40% 60% 50%", "40% 60% 60% 40% / 40% 50% 60% 50%"],
            x: [0, -20, 0], y: [0, 18, 0],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{ position: "absolute", bottom: -80, right: -80, width: 380, height: 340,
            background: "radial-gradient(circle at 60% 55%, rgba(13,148,136,0.06) 0%, transparent 70%)", pointerEvents: "none" }}
        />

        <motion.div
          animate={{ x: ["-120%", "220%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 7 }}
          style={{ position: "absolute", top: "-10%", left: 0, width: "30%", height: "120%",
            background: "linear-gradient(105deg, transparent 25%, rgba(13,148,136,0.05) 50%, transparent 75%)",
            transform: "skewX(-12deg)", pointerEvents: "none" }}
        />

        <motion.div
          animate={{ y: [0, -22, 0], rotate: [45, 68, 45], opacity: [0.10, 0.20, 0.10] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "6%", right: "6%", width: 64, height: 64,
            border: "1.5px solid rgba(13,148,136,0.28)", transform: "rotate(45deg)", pointerEvents: "none" }}
        />

        <motion.div
          animate={{ y: [0, 18, 0], rotate: [45, 22, 45], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{ position: "absolute", bottom: "8%", left: "5%", width: 44, height: 44,
            border: "1.5px solid rgba(13,148,136,0.22)", transform: "rotate(45deg)", pointerEvents: "none" }}
        />

        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 5, 0], opacity: [0.07, 0.14, 0.07] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          style={{ position: "absolute", top: "40%", right: "3%", width: 80, height: 44,
            border: "1px solid rgba(13,148,136,0.20)", borderRadius: "6px", pointerEvents: "none" }}
        />

        <motion.div
          animate={{ scale: [1, 1.10, 1], opacity: [0.06, 0.02, 0.06] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 700, height: 700, borderRadius: "50%",
            border: "1px solid rgba(13,148,136,0.15)", pointerEvents: "none" }}
        />

        {/* Content */}
        <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 2, md: 4 }, position: "relative" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VP}
            transition={{ duration: 0.55, ease }}
          >
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Box sx={{
                display: "inline-flex", alignItems: "center",
                bgcolor: ACCENT_BG, border: `1.5px solid ${ACCENT_BORDER}`,
                borderRadius: "24px", px: 2.5, py: 0.9, mb: 3,
              }}>
                <Typography sx={{
                  fontFamily: "Poppins", fontSize: "11px", fontWeight: 700,
                  color: ACCENT, letterSpacing: "1.2px", textTransform: "uppercase",
                }}>
                  {t("faq.overline")}
                </Typography>
              </Box>

              <Typography sx={{
                fontFamily: "Poppins", fontWeight: 800,
                fontSize: { xs: "28px", md: "44px" },
                lineHeight: 1.1, color: "#111827", mb: 1.5,
                letterSpacing: "-0.5px",
              }}>
                {t("faq.headline_1")}{" "}
                <Box component="span" sx={{ color: ACCENT }}>{t("faq.headline_accent")}</Box>
              </Typography>

              <Typography sx={{
                fontFamily: "Poppins", fontSize: { xs: "14px", md: "16px" },
                color: "#9CA3AF", lineHeight: 1.7,
              }}>
                {t("faq.body")}
              </Typography>
            </Box>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {faqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  faq={faq}
                  index={i}
                  open={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </Box>
          </motion.div>

        </Box>
      </Box>
    </>
  );
};

export default FAQSection;
