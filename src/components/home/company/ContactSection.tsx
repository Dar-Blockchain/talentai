import { useState } from "react";
import { Box, Typography, TextField, Button, MenuItem, Stack } from "@mui/material";
import CheckCircleOutlineIcon  from "@mui/icons-material/CheckCircleOutline";
import EmailOutlinedIcon       from "@mui/icons-material/EmailOutlined";
import AccessTimeOutlinedIcon  from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon      from "@mui/icons-material/GroupsOutlined";
import TrendingUpOutlinedIcon  from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardOutlined    from "@mui/icons-material/ArrowForwardOutlined";
import { motion } from "framer-motion";

const ACCENT = "#0D9488";
const VP     = { once: true, margin: "-80px" };
const ease   = [0.22, 1, 0.36, 1] as const;

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];

const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontFamily: "Poppins", fontSize: "14px",
    color: "#111827", bgcolor: "#F9FAFB", transition: "box-shadow 0.2s",
    "& fieldset":             { borderColor: "#E5E7EB" },
    "&:hover fieldset":       { borderColor: "#D1D5DB" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused":          { boxShadow: "0 0 0 3px rgba(13,148,136,0.08)" },
  },
  "& .MuiInputLabel-root":             { fontFamily: "Poppins", fontSize: "14px", color: "#9CA3AF" },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
  "& .MuiFormHelperText-root":         { fontFamily: "Poppins", fontSize: "11px" },
  "& .MuiSelect-icon":                 { color: "#9CA3AF" },
  "& .MuiInputBase-input":             { color: "#111827" },
};

const TRUST_ITEMS = [
  { Icon: AccessTimeOutlinedIcon, label: "< 24h reply",    desc: "No runaround",  color: "#0D9488", colorBg: "rgba(13,148,136,0.10)" },
  { Icon: GroupsOutlinedIcon,     label: "Dedicated team", desc: "From day one",  color: "#6366F1", colorBg: "rgba(99,102,241,0.10)"  },
  { Icon: TrendingUpOutlinedIcon, label: "75% faster",     desc: "Hiring cycles", color: "#F59E0B", colorBg: "rgba(245,158,11,0.10)"  },
];

const FEATURES = [
  "Fully automated screening pipeline",
  "Bias-free AI assessments",
  "Blockchain-verified credentials",
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
    setSending(true); setSendError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/";
      const res = await fetch(`${baseUrl}contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const json = await res.json().catch(() => null);
        const msg: string = json?.message || "Something went wrong. Please try again.";
        if      (/message/i.test(msg)) setErrors((prev) => ({ ...prev, message: msg }));
        else if (/email/i.test(msg))   setErrors((prev) => ({ ...prev, email: msg }));
        else if (/name/i.test(msg))    setErrors((prev) => ({ ...prev, name: msg }));
        else if (/company/i.test(msg)) setErrors((prev) => ({ ...prev, company: msg }));
        else setSendError(msg);
      }
    } catch {
      setSendError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>

      {/* ── Centered header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.55, ease }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center",
            bgcolor: "rgba(13,148,136,0.07)", border: "1.5px solid rgba(13,148,136,0.25)",
            borderRadius: "24px", px: 2.5, py: 0.9, mb: 2.5,
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "1px", textTransform: "uppercase" }}>
              Let's Talk
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 800,
            fontSize: { xs: "30px", md: "52px" },
            lineHeight: 1.08, color: "#111827",
            letterSpacing: "-1px", mb: 1.5,
          }}>
            Ready to Hire{" "}
            <Box component="span" sx={{ color: ACCENT }}>Smarter?</Box>
          </Typography>
          <Typography sx={{
            fontFamily: "Poppins", fontSize: { xs: "14px", md: "16px" },
            color: "#9CA3AF", maxWidth: 420, mx: "auto", lineHeight: 1.7,
          }}>
            Tell us where your pipeline is breaking — we'll show you how to fix it.
          </Typography>
        </Box>
      </motion.div>

      {/* ── Bento grid ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
        gap: { xs: 2, md: 2.5 },
        alignItems: "start",
      }}>

        {/* ── LEFT column: stacked bento ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>

          {/* Dark headline card */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VP}
            transition={{ duration: 0.6, ease }}
          >
            <Box sx={{
              bgcolor: "#111827", borderRadius: "20px",
              p: { xs: 3.5, md: 4 },
              position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              gap: 3,
              border: "1px solid rgba(255,255,255,0.05)",
              transition: "border-color 0.3s",
              "&:hover": { borderColor: "rgba(13,148,136,0.22)" },
            }}>
              {/* Glow orbs */}
              <Box sx={{
                position: "absolute", top: -60, right: -60, width: 240, height: 240,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <Box sx={{
                position: "absolute", bottom: -50, left: -50, width: 180, height: 180,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Dot grid */}
              <Box sx={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }} />

              {/* Watermark */}
              <Typography sx={{
                position: "absolute", bottom: -16, right: 16,
                fontFamily: "Poppins", fontWeight: 900, fontSize: "100px",
                lineHeight: 1, color: "rgba(255,255,255,0.025)",
                letterSpacing: "-6px", userSelect: "none", pointerEvents: "none",
              }}>
                AI
              </Typography>

              <Box sx={{ position: "relative" }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center",
                  bgcolor: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.25)",
                  borderRadius: "20px", px: 1.5, py: 0.4, mb: 2,
                }}>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", fontWeight: 700, color: ACCENT, letterSpacing: "1px", textTransform: "uppercase" }}>
                    Why TalentAI
                  </Typography>
                </Box>
                <Typography sx={{
                  fontFamily: "Poppins", fontWeight: 700,
                  fontSize: { xs: "20px", md: "22px" },
                  color: "#fff", lineHeight: 1.3, mb: 2,
                }}>
                  A process your team{" "}
                  <Box component="span" sx={{ color: ACCENT }}>is proud of.</Box>
                </Typography>

                {/* Feature bullets */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                  {FEATURES.map((feat, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                        bgcolor: ACCENT, boxShadow: `0 0 6px ${ACCENT}55`,
                      }} />
                      <Typography sx={{
                        fontFamily: "Poppins", fontSize: "12.5px",
                        color: "rgba(255,255,255,0.45)", lineHeight: 1.4,
                      }}>
                        {feat}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Trust list */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, position: "relative" }}>
                {TRUST_ITEMS.map((item, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: "8px", flexShrink: 0,
                      bgcolor: `${item.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <item.Icon sx={{ fontSize: 14, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "13px", color: "#fff", lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "11.5px", color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Email footer */}
              <Box sx={{ position: "relative", pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "9px",
                    bgcolor: "rgba(13,148,136,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <EmailOutlinedIcon sx={{ fontSize: 15, color: ACCENT }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.5px", textTransform: "uppercase", mb: 0.15 }}>
                      Email us
                    </Typography>
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "12.5px", color: "rgba(255,255,255,0.55)" }}>
                      contact@talentai.bid
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#4ADE80", boxShadow: "0 0 7px #4ADE80" }} />
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>
                      Online
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }} />
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "rgba(255,255,255,0.18)" }}>
                    Average reply time: under 2 hours
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* ── RIGHT: form card ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VP}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <Box sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            border: "1px solid #F0F0F0",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}>
            {/* Teal top accent */}
            <Box sx={{ height: "3px", background: `linear-gradient(90deg, ${ACCENT} 0%, rgba(13,148,136,0.12) 100%)` }} />

            <Box sx={{ p: { xs: 3, md: 4 } }}>
              {submitted ? (
                <Box sx={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  py: 10, gap: 2.5, textAlign: "center",
                }}>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Box sx={{
                      width: 72, height: 72, borderRadius: "50%",
                      bgcolor: "rgba(13,148,136,0.08)", border: "2px solid rgba(13,148,136,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 38, color: ACCENT }} />
                    </Box>
                  </motion.div>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "22px", color: "#111827" }}>
                    Message sent!
                  </Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#9CA3AF", maxWidth: 260 }}>
                    We'll get back to you within 24 hours — no sales runaround.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  <Box sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "18px", color: "#111827", mb: 0.5 }}>
                      Tell us about your team
                    </Typography>
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#9CA3AF" }}>
                      We'll reach out with a personalised demo.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Full name" size="small" fullWidth required
                      value={form.name} onChange={handleChange("name")}
                      error={!!errors.name} helperText={errors.name} sx={FIELD_SX} />
                    <TextField label="Work email" size="small" fullWidth required type="email"
                      value={form.email} onChange={handleChange("email")}
                      error={!!errors.email} helperText={errors.email} sx={FIELD_SX} />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Company" size="small" fullWidth required
                      value={form.company} onChange={handleChange("company")}
                      error={!!errors.company} helperText={errors.company} sx={FIELD_SX} />
                    <TextField label="Team size" size="small" fullWidth select
                      value={form.teamSize} onChange={handleChange("teamSize")} sx={FIELD_SX}
                      SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", mt: 0.5 } } } }}
                    >
                      <MenuItem value="" disabled sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#9CA3AF" }}>Select…</MenuItem>
                      {TEAM_SIZES.map((s) => (
                        <MenuItem key={s} value={s} sx={{
                          fontFamily: "Poppins", fontSize: "13px", color: "#374151",
                          "&:hover": { bgcolor: "rgba(13,148,136,0.06)" },
                          "&.Mui-selected": { bgcolor: "rgba(13,148,136,0.08)", "&:hover": { bgcolor: "rgba(13,148,136,0.12)" } },
                        }}>{s}</MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <TextField label="Where is your pipeline breaking?"
                    size="small" fullWidth required multiline rows={4}
                    value={form.message} onChange={handleChange("message")}
                    error={!!errors.message} helperText={errors.message} sx={FIELD_SX} />

                  <motion.div
                    whileHover={!sending ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!sending ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Button
                      variant="contained" fullWidth disabled={sending}
                      endIcon={<ArrowForwardOutlined />} onClick={handleSubmit}
                      sx={{
                        bgcolor: ACCENT, color: "#fff",
                        fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
                        textTransform: "none", borderRadius: "10px", py: 1.6,
                        boxShadow: `0 4px 18px rgba(13,148,136,0.35)`,
                        "&:hover": { bgcolor: ACCENT, boxShadow: `0 8px 28px rgba(13,148,136,0.45)` },
                        "&.Mui-disabled": { bgcolor: ACCENT, color: "#fff", opacity: 0.55 },
                      }}
                    >
                      {sending ? "Sending…" : "Send Message"}
                    </Button>
                  </motion.div>

                  {sendError && (
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#EF4444", textAlign: "center" }}>
                      {sendError}
                    </Typography>
                  )}

                  <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#D1D5DB", textAlign: "center" }}>
                    No spam. We respect your privacy. GDPR compliant.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </motion.div>

      </Box>
    </Box>
  );
};

export default ContactSection;
