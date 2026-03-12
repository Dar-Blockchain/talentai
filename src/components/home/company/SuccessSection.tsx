import { Box, Typography } from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";

const ACCENT   = "#0CDA8B";
const ACCENT_BG = "rgba(12,218,139,0.08)";
const RED      = "#EF4444";
const RED_BG   = "rgba(239,68,68,0.07)";

const ROWS = [
  {
    before: "42+ days to fill a position",
    after:  "Under 10 days, start to offer",
  },
  {
    before: "23 hours/week scheduling interviews",
    after:  "Zero scheduling — AI runs 24/7",
  },
  {
    before: "Gut-feeling decisions, 39% poor hire rate",
    after:  "Data-driven scoring, consistent every time",
  },
  {
    before: "Resume spam — 200+ unqualified applications",
    after:  "Smart matching surfaces best-fit candidates first",
  },
  {
    before: "No verifiable candidate history",
    after:  "Blockchain-verified credentials, fraud-proof",
  },
  {
    before: "Interviewer bias and inconsistency",
    after:  "Standardized AI evaluation — fair for every candidate",
  },
];

const SuccessSection: React.FC = () => (
  <Box
    sx={{
      maxWidth: 1200,
      mx: "auto",
      px: { xs: 2, md: 4 },
      py: { xs: 2, md: 3 },
    }}
  >
    {/* ── Header ── */}
    <Box sx={{ textAlign: "left", mb: { xs: 5, md: 7 } }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 1,
        bgcolor: ACCENT_BG, border: "1.5px solid rgba(12,218,139,0.40)",
        borderRadius: "24px", px: 2.5, py: 1, mb: 2,
      }}>
        <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: ACCENT, letterSpacing: "0.6px" }}>
          The Transformation
        </Typography>
      </Box>

      <Typography sx={{
        fontFamily: "Poppins",
        fontWeight: 700,
        fontSize: { xs: "26px", md: "40px" },
        lineHeight: 1.15,
        color: "#111827",
        mb: 1.5,
      }}>
        Imagine Hiring Like This
      </Typography>

      <Typography sx={{
        fontFamily: "Poppins", fontSize: { xs: "15px", md: "17px" },
        color: "#6B7280", lineHeight: 1.65, maxWidth: 700,
      }}>
        See the before-and-after difference TalentAI makes for every team that deploys it.
      </Typography>
    </Box>

    {/* ── Table ── */}
    <Box sx={{ maxWidth: 900, mx: "auto" }}>

      {/* Column headers */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        mb: 2,
      }}>
        {/* Without header */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          bgcolor: RED_BG, border: "1px solid rgba(239,68,68,0.18)",
          borderRadius: 2, px: 3, py: 1.5,
        }}>
          <Box sx={{
            width: 24, height: 24, borderRadius: "50%",
            bgcolor: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CloseOutlined sx={{ fontSize: 14, color: "#fff" }} />
          </Box>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", color: RED }}>
            Without TalentAI
          </Typography>
        </Box>

        {/* With header */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          bgcolor: ACCENT_BG, border: "1px solid rgba(12,218,139,0.22)",
          borderRadius: 2, px: 3, py: 1.5,
        }}>
          <Box sx={{
            width: 24, height: 24, borderRadius: "50%",
            bgcolor: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CheckOutlined sx={{ fontSize: 14, color: "#0b1b1f" }} />
          </Box>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", color: ACCENT }}>
            With TalentAI
          </Typography>
        </Box>
      </Box>

      {/* Rows */}
      <Box sx={{
        bgcolor: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}>
        {ROWS.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: i < ROWS.length - 1 ? "1px solid #F3F4F6" : "none",
            }}
          >
            {/* Before cell */}
            <Box sx={{
              display: "flex", alignItems: "flex-start", gap: 1.5,
              px: { xs: 2, md: 3 }, py: 2.5,
              borderRight: "1px solid #F3F4F6",
              bgcolor: i % 2 === 0 ? "#FAFAFA" : "#fff",
            }}>
              <Box sx={{
                width: 20, height: 20, borderRadius: "50%",
                bgcolor: RED_BG, border: "1px solid rgba(239,68,68,0.20)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, mt: 0.15,
              }}>
                <CloseOutlined sx={{ fontSize: 11, color: RED }} />
              </Box>
              <Typography sx={{
                fontFamily: "Poppins", fontSize: { xs: "13px", md: "14px" },
                color: "#6B7280", lineHeight: 1.5,
              }}>
                {row.before}
              </Typography>
            </Box>

            {/* After cell */}
            <Box sx={{
              display: "flex", alignItems: "flex-start", gap: 1.5,
              px: { xs: 2, md: 3 }, py: 2.5,
              bgcolor: i % 2 === 0 ? "rgba(12,218,139,0.02)" : "#fff",
            }}>
              <Box sx={{
                width: 20, height: 20, borderRadius: "50%",
                bgcolor: ACCENT_BG, border: "1px solid rgba(12,218,139,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, mt: 0.15,
              }}>
                <CheckOutlined sx={{ fontSize: 11, color: ACCENT }} />
              </Box>
              <Typography sx={{
                fontFamily: "Poppins", fontSize: { xs: "13px", md: "14px" },
                fontWeight: 600, color: "#111827", lineHeight: 1.5,
              }}>
                {row.after}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

export default SuccessSection;
