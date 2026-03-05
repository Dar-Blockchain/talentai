import React, { useState } from "react";
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

const ACCENT    = "rgba(12,218,139,1)";
const ACCENT_DIM = "rgba(12,218,139,0.7)";
const ACCENT_BG  = "rgba(12,218,139,0.10)";
const TEXT_DARK  = "#0b1b1f";

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];

const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0.5,
    fontFamily: "Poppins",
    fontSize: "14px",
    bgcolor: "rgba(255,255,255,0.85)",
    "&.Mui-focused fieldset": { borderColor: ACCENT },
    "&:hover fieldset": { borderColor: "rgba(12,218,139,0.5)" },
  },
  "& .MuiInputLabel-root": { fontFamily: "Poppins", fontSize: "14px" },
  "& .MuiInputLabel-root.Mui-focused": { color: TEXT_DARK },
  "& .MuiFormHelperText-root": { fontFamily: "Poppins", fontSize: "11px" },
};

const TRUST_ITEMS = [
  { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />, text: "Reply within 24 hours" },
  { icon: <GroupsOutlinedIcon     sx={{ fontSize: 18, color: ACCENT }} />, text: "Dedicated onboarding team" },
  { icon: <TrendingUpOutlinedIcon  sx={{ fontSize: 18, color: ACCENT }} />, text: "Hire 75% faster from day one" },
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
        px: 3,
        py: { xs: 6, md: 8 },
        background: "linear-gradient(0deg, #F3F7FB, #F3F7FB)",
        backgroundImage: `
          linear-gradient(0deg, #F3F7FB, #F3F7FB),
          linear-gradient(90deg, rgba(0,255,157,0.15) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0,255,157,0.15) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        backgroundBlendMode: "overlay",
        maxWidth: "98%",
        borderRadius: "10px",
        mx: "auto",
      }}
    >
      {/* Section heading */}
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "36px", lineHeight: "43.2px", textAlign: "center", color: TEXT_DARK, mb: 1 }}>
        Get in Touch
      </Typography>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 400, fontSize: "20px", lineHeight: 1.6, textAlign: "center", color: TEXT_DARK, mb: 6 }}>
        Tell us about your team and we'll show you how TalentAI fits.
      </Typography>

      {/* Two-column card */}
      <Box sx={{
        maxWidth: 960,
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" },
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
      }}>

        {/* Left — dark panel matching Hero/BiasFree dark style */}
        <Box sx={{
          background: "#141415",
          p: { xs: 4, md: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 4,
        }}>
          <Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "22px", color: "#fff", mb: 1.5, lineHeight: 1.3 }}>
              Let's talk about<br />your hiring goals
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              Whether you're scaling a team or optimizing your pipeline, our AI hiring platform is built for you.
            </Typography>
          </Box>

          {/* Trust bullets */}
          <Stack spacing={2.5}>
            {TRUST_ITEMS.map((item, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: ACCENT_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${ACCENT}30` }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Email */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 2, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <EmailOutlinedIcon sx={{ fontSize: 15, color: ACCENT }} />
            <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              contact@talentai.bid
            </Typography>
          </Box>
        </Box>

        {/* Right — form panel */}
        <Box sx={{ bgcolor: "rgba(243,247,251,0.95)", p: { xs: 4, md: 5 } }}>
          {submitted ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", py: 6, gap: 2 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: ACCENT_BG, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${ACCENT}50` }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: ACCENT }} />
              </Box>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "20px", color: TEXT_DARK }}>
                Message sent!
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#6B7280" }}>
                We'll get back to you within 24 hours.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
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
                label="How can we help?"
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
                onClick={handleSubmit}
                sx={{
                  backgroundColor: ACCENT,
                  color: TEXT_DARK,
                  boxShadow: "none",
                  borderRadius: 0.5,
                  textTransform: "none",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  py: 1.25,
                  "&:hover": { backgroundColor: ACCENT_DIM },
                  "&.Mui-disabled": { backgroundColor: ACCENT_DIM, color: TEXT_DARK, opacity: 0.7 },
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
                No spam. We respect your privacy.
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContactSection;
