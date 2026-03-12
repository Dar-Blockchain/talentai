import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";

const ACCENT     = "#0CDA8B";
const ACCENT_BG  = "rgba(12,218,139,0.10)";
const TEXT_DARK  = "#0b1b1f";

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];

const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontFamily: "Poppins",
    fontSize: "14px",
    bgcolor: "#fff",
    "&.Mui-focused fieldset": { borderColor: ACCENT },
    "&:hover fieldset": { borderColor: "rgba(12,218,139,0.5)" },
  },
  "& .MuiInputLabel-root": { fontFamily: "Poppins", fontSize: "14px" },
  "& .MuiInputLabel-root.Mui-focused": { color: TEXT_DARK },
  "& .MuiFormHelperText-root": { fontFamily: "Poppins", fontSize: "11px" },
};

const TRUST_ITEMS = [
  {
    icon: <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />,
    text: "Response within 24 hours — no sales runaround",
  },
  {
    icon: <GroupsOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />,
    text: "Dedicated onboarding team from day one",
  },
  {
    icon: <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: ACCENT }} />,
    text: "Teams cut time-to-hire by up to 75%",
  },
];

interface FormState { name: string; email: string; company: string; teamSize: string; message: string }
interface Errors    { name?: string; email?: string; company?: string; message?: string }

const ContactSection: React.FC = () => {
  const [form, setForm]           = useState<FormState>({ name: "", email: "", company: "", teamSize: "", message: "" });
  const [errors, setErrors]       = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.message.trim()) e.message = "Message is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof Errors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSending(true);
    setSendError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/";
      const res = await fetch(`${baseUrl}contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSendError("Something went wrong. Please try again or email us directly.");
      }
    } catch {
      setSendError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      {/* ── Section header ── */}
      <Box sx={{ textAlign: "left", mb: { xs: 5, md: 7 }, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {/* Overline pill */}
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          bgcolor: ACCENT_BG, border: `1.5px solid rgba(12,218,139,0.40)`,
          borderRadius: "24px", px: 2.5, py: 1, mb: 2,
        }}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: ACCENT, letterSpacing: "0.6px" }}>
            Let's Talk
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: { xs: "26px", md: "38px" },
          lineHeight: 1.2,
          color: TEXT_DARK,
          mb: 1.5,
        }}>
          Reclaim Your Calendar.{" "}
          <Box component="span" sx={{ color: ACCENT }}>Hire with Confidence.</Box>
        </Typography>

        <Typography sx={{
          fontFamily: "Poppins",
          fontWeight: 400,
          fontSize: { xs: "15px", md: "17px" },
          lineHeight: 1.65,
          color: "#4B5563",
          maxWidth: 840,
        }}>
          Every day without TalentAI is another $500 lost to an open role — and another great candidate hired by your competitor. Let's fix your pipeline today.
        </Typography>
      </Box>

      {/* ── Two-column card ── */}
      <Box sx={{
        maxWidth: 1000,
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.10)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}>

        {/* ── Left dark panel ── */}
        <Box sx={{
          background: "#0E0F10",
          p: { xs: 4, md: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 5,
          position: "relative",
          overflow: "hidden",
        }}>
          <Box sx={{ position: "relative" }}>
            <Typography sx={{
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: { xs: "20px", md: "24px" },
              color: "#fff",
              lineHeight: 1.3,
              mb: 2,
            }}>
              Let's build a hiring process<br />
              <Box component="span" sx={{ color: ACCENT }}>your team is proud of</Box>
            </Typography>
            <Typography sx={{
              fontFamily: "Poppins",
              fontSize: "14px",
              color: "rgba(255,255,255,0.50)",
              lineHeight: 1.75,
            }}>
              You didn't get into HR to spend your days scheduling interviews and sorting spreadsheets. Tell us where your pipeline is breaking — we'll show you exactly how TalentAI fixes it.
            </Typography>
          </Box>

          {/* Trust bullets */}
          <Stack spacing={2} sx={{ position: "relative" }}>
            {TRUST_ITEMS.map((item, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: "8px",
                  bgcolor: ACCENT_BG, border: `1px solid rgba(12,218,139,0.20)`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.1,
                }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 500, lineHeight: 1.5 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Email footer */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1,
            pt: 2, borderTop: "1px solid rgba(255,255,255,0.07)",
            position: "relative",
          }}>
            <EmailOutlinedIcon sx={{ fontSize: 14, color: ACCENT }} />
            <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "rgba(255,255,255,0.40)" }}>
              contact@talentai.bid
            </Typography>
          </Box>
        </Box>

        {/* ── Right form panel ── */}
        <Box sx={{ bgcolor: "#fff", p: { xs: 4, md: 5 } }}>
          {submitted ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", py: 8, gap: 2.5 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: "50%",
                bgcolor: ACCENT_BG, display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid rgba(12,218,139,0.40)`,
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 40, color: ACCENT }} />
              </Box>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "22px", color: TEXT_DARK }}>
                Message sent!
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#6B7280", maxWidth: 260 }}>
                We'll get back to you within 24 hours — no sales runaround.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {/* Form title */}
              <Box sx={{ mb: 0.5 }}>
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "18px", color: TEXT_DARK, mb: 0.5 }}>
                  Tell us about your team
                </Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#6B7280" }}>
                  We'll reach out with a personalised demo.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Full name"  size="small" fullWidth required value={form.name}    onChange={handleChange("name")}    error={!!errors.name}    helperText={errors.name}    sx={FIELD_SX} />
                <TextField label="Work email" size="small" fullWidth required type="email" value={form.email}   onChange={handleChange("email")}   error={!!errors.email}   helperText={errors.email}   sx={FIELD_SX} />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Company"   size="small" fullWidth required value={form.company}  onChange={handleChange("company")} error={!!errors.company} helperText={errors.company} sx={FIELD_SX} />
                <TextField label="Team size" size="small" fullWidth select  value={form.teamSize}  onChange={handleChange("teamSize")} sx={FIELD_SX}>
                  <MenuItem value="" disabled sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#9CA3AF" }}>Select…</MenuItem>
                  {TEAM_SIZES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontFamily: "Poppins", fontSize: "13px" }}>{s}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                label="Where is your pipeline breaking?"
                size="small" fullWidth required multiline rows={4}
                value={form.message}
                onChange={handleChange("message")}
                error={!!errors.message}
                helperText={errors.message}
                sx={FIELD_SX}
              />
              <Button
                variant="contained"
                fullWidth
                disabled={sending}
                endIcon={<ArrowForwardOutlined />}
                onClick={handleSubmit}
                sx={{
                  backgroundColor: ACCENT,
                  color: "#fff",
                  boxShadow: "none",
                  borderRadius: 0,
                  textTransform: "none",
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "15px",
                  py: 1.5,
                  "&:hover": { backgroundColor: ACCENT, boxShadow: "none" },
                  "&.Mui-disabled": { backgroundColor: ACCENT, color: "#fff", opacity: 0.7 },
                }}
              >
                {sending ? "Sending…" : "Send Message"}
              </Button>
              {sendError && (
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#EF4444", textAlign: "center" }}>
                  {sendError}
                </Typography>
              )}
              <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF", textAlign: "center" }}>
                No spam. We respect your privacy. GDPR compliant.
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContactSection;
