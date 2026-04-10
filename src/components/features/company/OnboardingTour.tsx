import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Backdrop } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import TourCard from "./tour/TourCard";
import { STEPS, TOTAL } from "./tour/tourSteps";
import { resolveRect, popoverStyle } from "./tour/tourUtils";

const TEAL = "#0D9488";

const OnboardingTour: React.FC = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  const trafficCounter = useSelector(
    (state: RootState) => state.user.connectedUser.user?.trafficCounter ?? 0
  );

  useEffect(() => {
    if (trafficCounter === 1 && !localStorage.getItem("tour_shown")) {
      const t = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(t);
    }
  }, [trafficCounter]);

  const finish = useCallback(() => {
    localStorage.setItem("tour_shown", "1");
    setActive(false);
  }, []);

  const next = useCallback(() => setStep(s => { if (s < TOTAL - 1) return s + 1; finish(); return s; }), [finish]);
  const prev = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const jump = useCallback((i: number) => setStep(i), []);

  const current = STEPS[step];
  const isCentered = current.position === "center";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rect = useMemo(() => active ? resolveRect(current.target) : null, [active, step]);
  const style = useMemo(() => popoverStyle(rect, current.position), [rect, current.position]);

  if (!active) return null;

  return (
    <>
      <Backdrop open sx={{ zIndex: 9990, bgcolor: "rgba(0,0,0,0.5)" }} onClick={finish} />

      {!isCentered && rect && (
        <Box sx={{ position: "fixed", top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, borderRadius: "12px", border: `2px solid ${TEAL}`, boxShadow: `0 0 0 4px ${TEAL}30`, pointerEvents: "none", zIndex: 9995, transition: "all 0.25s ease" }} />
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }} transition={{ duration: 0.2, ease: "easeOut" }} style={{ ...style, zIndex: 9999 }}>
          <TourCard step={step} current={current} onPrev={prev} onNext={next} onFinish={finish} onJump={jump} />
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default OnboardingTour;
