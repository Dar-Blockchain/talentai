import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Backdrop } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";

export const STORAGE_KEY = "talentai_onboarding_done";
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
    description: "Let's walk you through the platform in about a minute. We'll cover every feature so you can start hiring smarter right away.",
    position: "center",
  },
  {
    target: "center",
    title: "Dashboard 📊",
    description: "Your home base. At a glance you can see:\n\n• Active Job Posts & Campaigns\n• Total Applicants across all posts\n• Interview activity over the last 30 days\n• Applications Over Time & per Job Post charts\n• Top-performing job posts by candidate score",
    position: "center",
  },
  {
    target: "[data-tour='nav-posts']",
    title: "Job Posts",
    description: "Create and manage your open positions here.\n\n• Hit '+ New Job Post' to launch the creation wizard\n• Choose manual entry or let the AI generate the post for you\n• Draft posts can be resumed any time from where you left off\n• Once live, edit is disabled once candidates have passed interview",
    position: "right",
  },
  {
    target: "[data-tour='nav-applications']",
    title: "Applications",
    description: "Every candidate who applied across all your posts lands here.\n\n• Filter by name, skill, or specific job post\n• See CV score, current status, and applied date at a glance\n• Click any card to open the full candidate profile and take action",
    position: "right",
  },
  {
    target: "[data-tour='nav-interviews']",
    title: "Interviews",
    description: "Track all AI-powered candidate assessments.\n\n• View scores, AI report, and pipeline stage for each candidate\n• Filter by status: Pending, Completed, Passed, Failed\n• Click a card to see the full interview transcript and analysis",
    position: "right",
  },
  {
    target: "[data-tour='nav-campaigns']",
    title: "Campaigns",
    description: "Automate your hiring pipeline end-to-end.\n\n• Create a campaign to bundle a job post with an interview flow\n• Set automatic invite emails, reminders, and deadlines\n• Track completion rates and candidate progress in real time",
    position: "right",
  },
  {
    target: "[data-tour='nav-departments']",
    title: "Departments & Employees",
    description: "Organise your company structure.\n\n• Create departments and assign team members\n• Members can access their own interview dashboards\n• Useful for multi-team hiring across the organisation",
    position: "right",
  },
  {
    target: "[data-tour='nav-settings']",
    title: "Settings — Company Info",
    description: "Keep your company profile complete and up-to-date.\n\n• Company name, email, industry and size\n• Required experience level for posted roles\n• A complete profile builds trust with candidates browsing your listings",
    position: "right",
  },
  {
    target: "[data-tour='settings-tab-contact']",
    title: "Settings — Contact & Presence",
    description: "Tell candidates where you are and how to find you.\n\n• Country / location and employment type (Remote, On-site, Hybrid)\n• LinkedIn company page and website URL\n• These appear on your public company profile",
    position: "bottom",
  },
  {
    target: "[data-tour='settings-tab-apikeys']",
    title: "Settings — API Keys",
    description: "Integrate TalentAI with your own tools and services.\n\n• Create a key with a name, service identifier, and permission scopes\n• Set a rate limit (requests per second) and an expiry date\n• Toggle keys on/off or regenerate them at any time\n• The plain key is shown only once at creation — copy it immediately",
    position: "bottom",
  },
  {
    target: "[data-tour='header-chat']",
    title: "Messaging 💬",
    description: "Chat directly with candidates.\n\nNew message notifications appear here as candidates respond to interview invites or reach out directly.",
    position: "bottom",
  },
  {
    target: "[data-tour='header-notif']",
    title: "Notifications 🔔",
    description: "All important events appear here:\n\n• Interview completions and scores\n• New applications on your posts\n• Pipeline status changes\n• System alerts and reminders\n\nClick 'View all notifications' to see the full history.",
    position: "bottom",
  },
  {
    target: "center",
    title: "You're all set! 🎉",
    description: "That covers everything on TalentAI. You can replay this tour any time by clicking the Help button in Settings.\n\nGood luck with your hiring!",
    position: "center",
  },
];

function getPopoverStyle(rect: DOMRect | null, position: Step["position"]) {
  const GAP = 14;
  const W = 340;

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
      top: Math.min(rect.top, window.innerHeight - 260),
      left: rect.right + GAP,
      width: W,
    };
  }
  if (position === "left") {
    return {
      position: "fixed" as const,
      top: Math.min(rect.top, window.innerHeight - 260),
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

interface OnboardingTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ forceOpen, onClose }) => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Auto-start on first visit
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Re-open when parent forces it (Help button)
  useEffect(() => {
    if (forceOpen) { setStep(0); setActive(true); }
  }, [forceOpen]);

  useEffect(() => {
    if (!active) return;
    const target = STEPS[step]?.target;
    if (!target || target === "center") { setRect(null); return; }
    const el = document.querySelector(target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step, active]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setActive(false);
    onClose?.();
  };
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
      width: isCentered ? 440 : 340,
      maxWidth: "calc(100vw - 24px)",
    }}>
      {/* Top progress bar */}
      <Box sx={{ height: 4, bgcolor: "#F3F4F6", position: "relative" }}>
        <Box sx={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${((step + 1) / STEPS.length) * 100}%`,
          background: `linear-gradient(90deg, ${TEAL}, #34D399)`,
          transition: "width 0.3s ease",
        }} />
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.25 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#111827", lineHeight: 1.3, pr: 1 }}>
            {current.title}
          </Typography>
          <Box onClick={finish} sx={{ cursor: "pointer", color: "#9CA3AF", "&:hover": { color: "#374151" }, flexShrink: 0, mt: 0.25 }}>
            <CloseOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        <Typography sx={{ fontSize: "0.83rem", color: "#6B7280", lineHeight: 1.7, mb: 2.5, whiteSpace: "pre-line" }}>
          {current.description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Step dots */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", maxWidth: 160 }}>
            {STEPS.map((_, i) => (
              <Box key={i} onClick={() => setStep(i)} sx={{
                width: i === step ? 14 : 5, height: 5, borderRadius: "4px",
                bgcolor: i === step ? TEAL : i < step ? `${TEAL}60` : "#E5E7EB",
                transition: "all 0.2s",
                cursor: "pointer",
              }} />
            ))}
          </Box>

          {/* Step counter + buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 500 }}>
              {step + 1} / {STEPS.length}
            </Typography>
            {!isFirst && (
              <Button size="small" onClick={prev}
                startIcon={<ArrowBackOutlined sx={{ fontSize: 13 }} />}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", borderRadius: "8px", px: 1.5, minWidth: 0, "&:hover": { bgcolor: "#F3F4F6" } }}>
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
      <Backdrop open sx={{ zIndex: 9990, bgcolor: "rgba(0,0,0,0.5)" }} onClick={finish} />

      {/* Highlight ring around targeted element */}
      {!isCentered && rect && (
        <Box sx={{
          position: "fixed",
          top: rect.top - 6, left: rect.left - 6,
          width: rect.width + 12, height: rect.height + 12,
          borderRadius: "12px", border: `2px solid ${TEAL}`,
          boxShadow: `0 0 0 4px ${TEAL}30`,
          pointerEvents: "none", zIndex: 9995,
          transition: "all 0.25s ease",
        }} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
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
