import { Box, Typography } from "@mui/material";

const ACCENT    = "#0CDA8B";
const ACCENT_BG = "rgba(12,218,139,0.08)";
const ACCENT_BORDER = "rgba(12,218,139,0.25)";

const STEPS = [
  {
    number: "01",
    label: "Build Your Pipeline",
    description:
      "Choose your interview modules, set pass/fail thresholds, and launch your first AI-driven role in under 30 minutes. No IT required.",
    tag: "Setup",
  },
  {
    number: "02",
    label: "AI Agents Interview Candidates",
    description:
      "Your AI recruiter runs 24/7 — assessing technical depth, soft skills, and culture fit through natural conversation, at scale, without bias.",
    tag: "Automated",
  },
  {
    number: "03",
    label: "Review & Hire",
    description:
      "Receive auto-ranked shortlists with blockchain-verified credentials. Compare candidates side-by-side and extend offers with full confidence.",
    tag: "Decision",
  },
];

export default function GradientStepper() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 0 } }}>
      {STEPS.map((step, i) => (
        <Box
          key={step.number}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 56px 1fr" },
            alignItems: "center",
            gap: { xs: 0, md: 0 },
          }}
        >
          {/* Left: content card (odd steps) or spacer (even steps) */}
          {i % 2 === 0 ? (
            <Box sx={{ display: { xs: "none", md: "block" } }}><StepCard step={step} /></Box>
          ) : (
            <Box sx={{ display: { xs: "none", md: "block" } }} />
          )}

          {/* Center: timeline track */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
              minHeight: 160,
              position: "relative",
            }}
          >
            {/* Top line */}
            <Box sx={{
              flex: 1,
              width: 2,
              bgcolor: i === 0 ? "transparent" : ACCENT_BORDER,
              minHeight: 32,
            }} />

            {/* Circle */}
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: ACCENT_BG,
              border: `2px solid ${ACCENT_BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              zIndex: 1,
            }}>
              <Typography sx={{
                fontFamily: "Poppins",
                fontWeight: 800,
                fontSize: "14px",
                color: ACCENT,
                lineHeight: 1,
              }}>
                {step.number}
              </Typography>
            </Box>

            {/* Bottom line */}
            <Box sx={{
              flex: 1,
              width: 2,
              bgcolor: i === STEPS.length - 1 ? "transparent" : ACCENT_BORDER,
              minHeight: 32,
            }} />
          </Box>

          {/* Right: content card (even steps) or spacer (odd steps) */}
          {i % 2 !== 0 ? (
            <Box sx={{ display: { xs: "none", md: "block" } }}><StepCard step={step} /></Box>
          ) : (
            <Box sx={{ display: { xs: "none", md: "block" } }} />
          )}

          {/* Mobile: full-width card with number inline */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <MobileStepCard step={step} isLast={i === STEPS.length - 1} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function StepCard({ step }: { step: typeof STEPS[number] }) {
  return (
    <Box sx={{
      bgcolor: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 3,
      p: { xs: 3, md: 4 },
      boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
      position: "relative",
      overflow: "hidden",
      m: { md: 2 },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: "linear-gradient(90deg, rgba(12,218,139,0.9) 0%, rgba(12,218,139,0.15) 100%)",
        borderRadius: "3px 3px 0 0",
      },
    }}>
      {/* Big decorative number */}
      <Typography sx={{
        fontFamily: "Poppins",
        fontWeight: 900,
        fontSize: "72px",
        lineHeight: 1,
        color: "rgba(12,218,139,0.08)",
        position: "absolute",
        top: 8,
        right: 16,
        userSelect: "none",
        letterSpacing: "-4px",
      }}>
        {step.number}
      </Typography>

      {/* Tag */}
      <Box sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: ACCENT_BG,
        border: `1px solid ${ACCENT_BORDER}`,
        borderRadius: "20px",
        px: 1.5,
        py: 0.4,
        mb: 2,
      }}>
        <Typography sx={{
          fontFamily: "Poppins",
          fontSize: "11px",
          fontWeight: 700,
          color: ACCENT,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}>
          {step.tag}
        </Typography>
      </Box>

      <Typography sx={{
        fontFamily: "Poppins",
        fontWeight: 700,
        fontSize: { xs: "18px", md: "20px" },
        color: "#111827",
        mb: 1.5,
        lineHeight: 1.3,
        position: "relative",
      }}>
        {step.label}
      </Typography>
      <Typography sx={{
        fontFamily: "Poppins",
        fontSize: "14px",
        color: "#6B7280",
        lineHeight: 1.75,
        position: "relative",
      }}>
        {step.description}
      </Typography>
    </Box>
  );
}

function MobileStepCard({ step, isLast }: { step: typeof STEPS[number]; isLast: boolean }) {
  return (
    <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
      {/* Left: number + vertical line */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <Box sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: ACCENT_BG,
          border: `2px solid ${ACCENT_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "13px", color: "#059669" }}>
            {step.number}
          </Typography>
        </Box>
        {!isLast && (
          <Box sx={{ width: 2, flex: 1, minHeight: 40, bgcolor: ACCENT_BORDER, mt: 1 }} />
        )}
      </Box>

      {/* Right: content */}
      <Box sx={{
        flex: 1,
        bgcolor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 3,
        p: 3,
        mb: isLast ? 0 : 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "3px",
          background: "linear-gradient(90deg, rgba(12,218,139,0.9) 0%, rgba(12,218,139,0.15) 100%)",
          borderRadius: "3px 3px 0 0",
        },
      }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.5,
          bgcolor: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}`,
          borderRadius: "20px", px: 1.5, py: 0.4, mb: 1.5,
        }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {step.tag}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "17px", color: "#111827", mb: 1, lineHeight: 1.3 }}>
          {step.label}
        </Typography>
        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#6B7280", lineHeight: 1.75 }}>
          {step.description}
        </Typography>
      </Box>
    </Box>
  );
}
