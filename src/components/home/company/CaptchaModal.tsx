import React, { useRef, useState, useCallback } from "react";
import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";

interface CaptchaModalProps {
  open: boolean;
  onVerified: () => void;
  onClose: () => void;
}

const TRACK_WIDTH = 320;
const THUMB_SIZE = 52;
const SNAP_THRESHOLD = 20; // px from end to snap

const CaptchaModal: React.FC<CaptchaModalProps> = ({ open, onVerified, onClose }) => {
  const [x, setX] = useState(0);
  const [verified, setVerified] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const maxX = TRACK_WIDTH - THUMB_SIZE;

  const reset = useCallback(() => {
    setX(0);
    setVerified(false);
    setDragging(false);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (verified) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    startXRef.current = e.clientX - x;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || verified) return;
    const newX = Math.min(Math.max(e.clientX - startXRef.current, 0), maxX);
    setX(newX);

    if (newX >= maxX - SNAP_THRESHOLD) {
      setX(maxX);
      setVerified(true);
      setDragging(false);
      setTimeout(() => {
        onVerified();
        onClose();
        setTimeout(reset, 300);
      }, 700);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging || verified) return;
    setDragging(false);
    // Snap back if not reached
    setX(0);
  };

  const progress = Math.min(x / maxX, 1);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          maxWidth: 400,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              background: "linear-gradient(135deg,#e6fff4,#ccfce8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldIcon sx={{ color: "#0CDA8B", fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827", lineHeight: 1.2 }}>
              Human Verification
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
              Slide to confirm you&apos;re not a robot
            </Typography>
          </Box>
          <Box
            onClick={handleClose}
            sx={{ cursor: "pointer", color: "#d1d5db", "&:hover": { color: "#6b7280" } }}
          >
            <CloseIcon fontSize="small" />
          </Box>
        </Box>

        {/* Slider body */}
        <Box sx={{ px: 3, py: 4, background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>

          {/* Status text */}
          <Typography
            sx={{
              fontSize: 13,
              color: verified ? "#059669" : "#6b7280",
              fontWeight: verified ? 700 : 400,
              transition: "color .3s",
            }}
          >
            {verified ? "✓ Verified! Opening booking page…" : "Drag the arrow all the way to the right"}
          </Typography>

          {/* Track */}
          <Box
            ref={trackRef}
            sx={{
              width: TRACK_WIDTH,
              height: THUMB_SIZE,
              borderRadius: `${THUMB_SIZE / 2}px`,
              background: "#f3f4f6",
              border: `1.5px solid ${verified ? "#0CDA8B" : "#e5e7eb"}`,
              position: "relative",
              overflow: "hidden",
              userSelect: "none",
              transition: "border-color .3s",
            }}
          >
            {/* Fill */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: x + THUMB_SIZE,
                background: verified
                  ? "linear-gradient(90deg,#0CDA8B,#09c47c)"
                  : `linear-gradient(90deg, rgba(12,218,139,${0.15 + progress * 0.25}), rgba(12,218,139,${0.05 + progress * 0.15}))`,
                transition: dragging ? "none" : "width .4s ease, background .3s",
                borderRadius: `${THUMB_SIZE / 2}px`,
              }}
            />

            {/* Track label */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: verified ? "rgba(255,255,255,0.0)" : `rgba(156,163,175,${1 - progress * 1.5})`,
                  letterSpacing: "0.5px",
                  transition: "color .2s",
                  userSelect: "none",
                }}
              >
                {verified ? "" : "slide  ›  ›  ›"}
              </Typography>
            </Box>

            {/* Thumb */}
            <Box
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              sx={{
                position: "absolute",
                top: 0,
                left: x,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: "50%",
                background: verified
                  ? "linear-gradient(135deg,#0CDA8B,#09c47c)"
                  : "#fff",
                boxShadow: verified
                  ? "0 4px 20px rgba(12,218,139,0.5)"
                  : "0 2px 12px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: verified ? "default" : dragging ? "grabbing" : "grab",
                transition: dragging ? "none" : "left .4s ease, background .3s, box-shadow .3s",
                zIndex: 2,
                touchAction: "none",
              }}
            >
              {verified ? (
                <CheckIcon sx={{ color: "#fff", fontSize: 24 }} />
              ) : (
                <ArrowForwardIcon
                  sx={{
                    color: "#0CDA8B",
                    fontSize: 22,
                    transform: `translateX(${progress * 3}px)`,
                    transition: "transform .1s",
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Branding */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, opacity: 0.35 }}>
            <ShieldIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
            <Typography sx={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.3px" }}>
              Protected by TalentAI
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CaptchaModal;
