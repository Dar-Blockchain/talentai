"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const ACCENT      = "#0D9488";
const ACCENT_DIM  = "rgba(13,148,136,0.55)";
const GLOW_SOFT   = "rgba(13,148,136,0.15)";

/* ── Reticle SVG ─────────────────────────────────────────────────────── */
const Reticle: React.FC<{ size: number; dim?: boolean }> = ({ size, dim }) => {
  const c  = size / 2;
  const r  = c - 5;
  const bk = 9;   // bracket arm length
  const bi = 6;   // bracket inset from edge
  const color = dim ? ACCENT_DIM : ACCENT;

  const tl = `M ${bi} ${bi + bk} L ${bi} ${bi} L ${bi + bk} ${bi}`;
  const tr = `M ${size - bi - bk} ${bi} L ${size - bi} ${bi} L ${size - bi} ${bi + bk}`;
  const bl = `M ${bi} ${size - bi - bk} L ${bi} ${size - bi} L ${bi + bk} ${size - bi}`;
  const br = `M ${size - bi - bk} ${size - bi} L ${size - bi} ${size - bi} L ${size - bi} ${size - bi - bk}`;

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Dashed outer ring — rotated via parent motion.div */}
      <circle
        cx={c} cy={c} r={r}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4 5"
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* Corner brackets */}
      {[tl, tr, bl, br].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* Cardinal tick marks */}
      {[0, 90, 180, 270].map((deg) => {
        const rad  = (deg * Math.PI) / 180;
        const x1   = c + (r - 4) * Math.cos(rad);
        const y1   = c + (r - 4) * Math.sin(rad);
        const x2   = c + (r + 1) * Math.cos(rad);
        const y2   = c + (r + 1) * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.8} />;
      })}
    </svg>
  );
};

/* ── Main component ──────────────────────────────────────────────────── */
const CustomCursor: React.FC = () => {
  const [visible,  setVisible]  = useState(false);
  const [clicking, setClicking] = useState(false);
  const [onLink,   setOnLink]   = useState(false);

  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);

  const rx = useSpring(mx, { stiffness: 190, damping: 26 });
  const ry = useSpring(my, { stiffness: 190, damping: 26 });

  const gx = useSpring(mx, { stiffness: 55, damping: 18 });
  const gy = useSpring(my, { stiffness: 55, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
      const el = e.target as HTMLElement;
      setOnLink(!!el.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]"));
    };
    const onDown  = () => setClicking(true);
    const onUp    = () => setClicking(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove",   onMove);
    window.addEventListener("mousedown",   onDown);
    window.addEventListener("mouseup",     onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove",   onMove);
      window.removeEventListener("mousedown",   onDown);
      window.removeEventListener("mouseup",     onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [mx, my]);

  const base: React.CSSProperties = {
    position: "fixed", top: 0, left: 0,
    translateX: "-50%", translateY: "-50%",
    pointerEvents: "none",
  };

  return (
    <>
      {/* ── Ambient glow halo ─────────────────────── */}
      <motion.div
        animate={{ scale: clicking ? 0.7 : onLink ? 1.5 : 1, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{
          ...base, x: gx, y: gy,
          width: 110, height: 110,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_SOFT} 0%, transparent 70%)`,
          zIndex: 9994,
          filter: "blur(3px)",
        }}
      />

      {/* ── Scan pulse ring — repeating AI sonar ─── */}
      <motion.div
        animate={{
          scale:   visible ? [1, 2.8] : 1,
          opacity: visible ? [0.45, 0] : 0,
        }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.4, ease: "easeOut" }}
        style={{
          ...base, x: rx, y: ry,
          width: 36, height: 36,
          borderRadius: "50%",
          border: `1px solid ${ACCENT}`,
          zIndex: 9993,
        }}
      />

      {/* ── Rotating reticle ──────────────────────── */}
      <motion.div
        animate={{
          scale:   clicking ? 0.72 : onLink ? 1.45 : 1,
          opacity: visible  ? 1    : 0,
          rotate:  360,
        }}
        transition={{
          scale:   { duration: 0.2,  ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2 },
          rotate:  { duration: 10, repeat: Infinity, ease: "linear" },
        }}
        style={{
          ...base, x: rx, y: ry,
          zIndex: 9996,
        }}
      >
        <Reticle size={48} />
      </motion.div>

      {/* ── Core dot ──────────────────────────────── */}
      <motion.div
        animate={{
          scale:   clicking ? 0.45 : onLink ? 1.8 : 1,
          opacity: visible  ? 1    : 0,
        }}
        transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...base, x: mx, y: my,
          width: 7, height: 7,
          borderRadius: "50%",
          backgroundColor: ACCENT,
          boxShadow: `0 0 6px ${ACCENT}, 0 0 18px rgba(13,148,136,0.55)`,
          zIndex: 9999,
        }}
      />
    </>
  );
};

export default CustomCursor;
