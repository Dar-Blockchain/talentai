import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Backdrop } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";

const STORAGE_KEY = "talentai_onboarding_done";
const TEAL = "#0D9488";

interface Step {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

const STEPS: Step[] = [
  {
    target: "center",
    title: "Welcome to TalentAI 👋",
    description: "Let's walk you through the platform in 30 seconds. We'll show you how to create a job post, set up an interview pipeline, and track candidates.",
    position: "center",
  },
  {
    target: "center",
    title: "Dashboard Overview 📊",
    description: "Your dashboard gives you a full picture of your hiring activity in one place:\n\n• Active Job Posts — how many positions are currently open\n• Active Campaigns — your automated hiring pipelines running right now\n• Interview Activity — daily interview volume over the last 30 days\n• Top Job Posts — which roles attract the most candidates and their average score",
    position: "center",
  },
  {
    target: "[data-tour='nav-posts']",
    title: "Create a Job Post",
    description: "Click 'Posts' in the sidebar to manage your open positions. From there, hit '+ New Job Post' to create your first listing.",
    position: "right",
  },
  {
    target: "[data-tour='nav-interviews']",
    title: "Track Interviews",
    description: "The 'Interviews' section shows all candidate assessments. Click any card to see scores, AI report, and pipeline progress.",
    position: "right",
  },
  {
    target: "[data-tour='nav-settings']",
    title: "Company Settings",
    description: "Set up your company profile, logo, and contact info in Settings. A complete profile builds trust with candidates.",
    position: "right",
  },
  {
    target: "[data-tour='header-chat']",
    title: "Messaging",
    description: "Chat directly with candidates here. New message notifications appear as candidates respond to your interview invites.",
    position: "bottom",
  },
  {
    target: "[data-tour='header-notif']",
    title: "Notifications",
    description: "All important events land here — interview completions, new applications, pipeline updates, and system alerts.",
    position: "bottom",
  },
];

function getPopoverStyle(rect: DOMRect | null, position: Step["position"]) {
  const GAP = 12;
  const W = 320;

  if (!rect || position === "center") {
    return {
      position: "fixed" as const,
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none" as const,
    };
  }

  if (position === "right") {
    return {
      position: "fixed" as const,
      top: Math.min(rect.top, window.innerHeight - 240),
      left: rect.right + GAP,
      width: W,
    };
  }
  if (position === "left") {
    return {
      position: "fixed" as const,
      top: Math.min(rect.top, window.innerHeight - 240),
      left: rect.left - W - GAP,
      width: W,
    };
  }
  if (position === "top") {
    return {
      position: "fixed" as const,
      bottom: window.innerHeight - rect.top + GAP,
      left: Math.min(Math.max(rect.left + rect.width / 2 - W / 2, 12), window.innerWidth - W - 12),
      width: W,
    };
  }
  // bottom
  return {
    position: "fixed" as const,
    top: rect.bottom + GAP,
    left: Math.min(Math.max(rect.left + rect.width / 2 - W / 2, 12), window.innerWidth - W - 12),
    width: W,
  };
}

const OnboardingTour: React.FC = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const target = STEPS[step]?.target;
    if (!target || target === "center") { setRect(null); return; }
    const el = document.querySelector(target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step, active]);

  const finish = () => { localStorage.setItem(STORAGE_KEY, "1"); setActive(false); };
  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : finish();
  const prev = () => step > 0 && setStep(s => s - 1);

  if (!active) return null;

  const current = STEPS[step];
  const isCentered = current.position === "center";
  const popoverStyle = getPopoverStyle(rect, current.position);
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const card = (
    <Box sx={{
      bgcolor: "#fff", borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.18)", border: "1px solid #E5E7EB",
      pointerEvents: "auto",
      width: isCentered ? 420 : 320,
      maxWidth: "calc(100vw - 24px)",
    }}>
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${TEAL}, #34D399)` }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827", lineHeight: 1.3, pr: 1 }}>
            {current.title}
          </Typography>
          <Box onClick={finish} sx={{ cursor: "pointer", color: "#9CA3AF", "&:hover": { color: "#374151" }, flexShrink: 0 }}>
            <CloseOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        <Typography sx={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.65, mb: 2, whiteSpace: "pre-line" }}>
          {current.description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Dots */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {STEPS.map((_, i) => (
              <Box key={i} sx={{
                width: i === step ? 16 : 6, height: 6, borderRadius: "4px",
                bgcolor: i === step ? TEAL : i < step ? `${TEAL}50` : "#E5E7EB",
                transition: "all 0.2s",
              }} />
            ))}
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {!isFirst && (
              <Button size="small" onClick={prev}
                startIcon={<ArrowBackOutlined sx={{ fontSize: 13 }} />}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#F3F4F6" } }}>
                Back
              </Button>
            )}
            <Button size="small" variant="contained" onClick={next}
              endIcon={isLast ? <CheckOutlined sx={{ fontSize: 13 }} /> : <ArrowForwardOutlined sx={{ fontSize: 13 }} />}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "8px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
              {isLast ? "Done!" : "Next"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Backdrop open sx={{ zIndex: 9990, bgcolor: "rgba(0,0,0,0.45)" }} onClick={finish} />

      {/* Highlight ring */}
      {!isCentered && rect && (
        <Box sx={{
          position: "fixed",
          top: rect.top - 6, left: rect.left - 6,
          width: rect.width + 12, height: rect.height + 12,
          borderRadius: "12px", border: `2px solid ${TEAL}`,
          boxShadow: `0 0 0 4px ${TEAL}25`,
          pointerEvents: "none", zIndex: 9995,
        }} />
      )}

      {/* Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.93, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ ...popoverStyle, zIndex: 9999 }}
        >
          {card}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default OnboardingTour;
