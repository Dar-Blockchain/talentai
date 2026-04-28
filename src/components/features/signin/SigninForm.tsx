import React, { useEffect, useMemo, useState, useRef } from "react";
import { Box, TextField, Button, Typography, Stack, CircularProgress, InputAdornment } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { signinUser, verifyOTP } from "@/store/slices/authSlice";
import { fetchEmployeePermissions } from "@/store/slices/memberSlice";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { formatTimeLeft } from "@/utils/functions";
import { useTranslation } from "react-i18next";

type FormValues = { email: string; code: string };

const CODE_LENGTH = 6;
const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

interface Props { themeColors: any }

const SigninForm: React.FC<Props> = ({ themeColors }) => {
  const { t } = useTranslation("auth");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();
  const returnUrl = router.query.returnUrl as string | undefined;

  const emailSchema = Yup.object({ email: Yup.string().email(t("signin.validation.email_invalid")).required(t("signin.validation.email_required")) });
  const codeSchema  = Yup.object({ code: Yup.string().length(6, t("signin.validation.code_length")).required(t("signin.validation.code_required")) });

  const invitationEmail = useMemo(() => {
    if (!returnUrl) return "";
    try {
      const url = new URL(decodeURIComponent(returnUrl), window.location.origin);
      const token = url.searchParams.get("token");
      if (!token) return "";
      const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
      if (!base64) return "";
      const payload = JSON.parse(atob(base64));
      return payload.userEmail ?? payload.email ?? payload.inviteeEmail ?? "";
    } catch { return ""; }
  }, [returnUrl]);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: 300, storageKey: "email_code_expires_at" });

  const handleSendCode = async (email: string) => {
    setLoading(true);
    try {
      await dispatch(signinUser(email.toLowerCase().trim())).unwrap();
      startTimer();
      setStep(2);
    } catch (err: any) {
      showToast({ message: err || "Sign in failed. Please try again.", severity: "error" });
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async (values: FormValues) => {
    setLoading(true);
    try {
      clearTimer();
      const userLocation = await getUserLocation();
      const response = await dispatch(verifyOTP({ email: values.email.toLowerCase().trim(), otp: values.code, location: userLocation })).unwrap();
      if (!response.token) { showToast({ message: "Verification successful, but there was an issue signing you in.", severity: "error" }); setLoading(false); return; }
      if (response.user?.role === "Employee" && response.user?._id) await dispatch(fetchEmployeePermissions(response.user._id));
      handleRedirectTo(response.user, response.profile);
    } catch {
      showToast({ message: "The code you entered didn't match. Please check and try again.", severity: "error" });
      setLoading(false);
    }
  };

  const handleRedirectTo = (user: any, profile: any) => {
    const role = user?.role;
    if (role === "Admin") { router.replace("/dashboard/admin"); return; }
    if (!profile?._id) { router.replace(returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/register"); return; }
    if (returnUrl) { router.replace(decodeURIComponent(returnUrl)); return; }
    if (role === "Employee") { router.replace("/employee/dashboard"); return; }
    if (role === "Company") { router.replace("/company/dashboard"); return; }
    router.replace("/dashboard/candidate");
  };

  useEffect(() => () => { clearTimer(); }, []);

  const fieldSx = {
    "& .MuiInputLabel-root": { color: "#9CA3AF", fontFamily: "Poppins", fontSize: "1rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      fontFamily: "Poppins",
      fontSize: "1rem",
      height: 58,
      bgcolor: "#F8FFFE",
      "& fieldset": { borderColor: "#D1FAF5" },
      "&:hover fieldset": { borderColor: `${ACCENT}66` },
      "&:hover": { bgcolor: "#F0FDFA" },
      "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
      "&.Mui-focused": { bgcolor: "#fff" },
    },
  };

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{ email: invitationEmail, code: "" }}
      validationSchema={step === 1 ? emailSchema : codeSchema}
      onSubmit={(values) => { if (step === 1) handleSendCode(values.email); else handleVerifyCode(values); }}
    >
      {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
        <Box component="form" onSubmit={handleSubmit}>

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", fontFamily: "Poppins", mb: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t("signin.email_label")}
              </Typography>
              <TextField
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={invitationEmail ? t("signin.email_prefilled") : touched.email && errors.email}
                fullWidth
                placeholder="you@company.com"
                disabled={loading || !!invitationEmail}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 20, color: ACCENT }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", fontFamily: "Poppins", mt: 1 }}>
                {t("signin.email_hint")}
              </Typography>
            </Box>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <Box>
              {/* Email confirmation card */}
              <Box sx={{ textAlign: "center", mb: 3.5 }}>
                {/* Icon with pulse ring */}
                <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
                  <Box sx={{
                    position: "absolute", inset: -7, borderRadius: "22px",
                    border: `1.5px solid ${ACCENT}22`,
                    animation: "pulseRing 2.4s ease-in-out infinite",
                    "@keyframes pulseRing": {
                      "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
                      "50%":       { opacity: 0.15, transform: "scale(1.08)" },
                    },
                  }} />
                  <Box sx={{
                    width: 60, height: 60, borderRadius: "18px",
                    background: `linear-gradient(135deg, ${ACCENT}18 0%, ${ACCENT2}12 100%)`,
                    border: `1.5px solid ${ACCENT}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 8px 24px ${ACCENT}20`,
                  }}>
                    <EmailOutlinedIcon sx={{ fontSize: 26, color: ACCENT }} />
                  </Box>
                </Box>

                <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.05rem", color: "#111827", mb: 0.5 }}>
                  {t("signin.code_sent_title")}
                </Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#6B7280", mb: 1.75 }}>
                  {t("signin.code_sent_to")}
                </Typography>

                {/* Email chip */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 1,
                  px: 2, py: 0.8, borderRadius: "12px",
                  bgcolor: `${ACCENT}0C`, border: `1.5px solid ${ACCENT}28`,
                  boxShadow: `0 2px 10px ${ACCENT}12`,
                }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: ACCENT, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.9rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.01em" }}>
                    {values.email}
                  </Typography>
                </Box>

                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: "#9CA3AF", mt: 1.5 }}>
                  {t("signin.spam_note")}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} justifyContent="center">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const filled = !!values.code[i];
                  return (
                    <Box
                      key={i}
                      sx={{
                        width: 58, height: 68,
                        borderRadius: "14px",
                        border: `2px solid ${filled ? ACCENT : "#D1D5DB"}`,
                        bgcolor: filled ? `${ACCENT}08` : "#F9FAFB",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                        "&:focus-within": {
                          borderColor: ACCENT,
                          bgcolor: "#fff",
                          boxShadow: `0 0 0 4px ${ACCENT}1A`,
                        },
                      }}
                    >
                      <Box
                        component="input"
                        ref={(el: HTMLInputElement | null) => (codeInputsRef.current[i] = el)}
                        value={values.code[i] || ""}
                        maxLength={1}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          if (!raw) { const arr = values.code.split(""); arr[i] = ""; setFieldValue("code", arr.join("")); return; }
                          const arr = values.code.split(""); arr[i] = raw[0]; setFieldValue("code", arr.join(""));
                          if (i < CODE_LENGTH - 1) codeInputsRef.current[i + 1]?.focus();
                        }}
                        onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                          e.preventDefault();
                          const paste = e.clipboardData.getData("text").replace(/\D/g, "");
                          if (!paste) return;
                          const arr = values.code.split("");
                          for (let j = 0; j < CODE_LENGTH; j++) arr[j] = paste[j] || arr[j] || "";
                          setFieldValue("code", arr.join(""));
                          codeInputsRef.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Backspace" && !values.code[i] && i > 0) codeInputsRef.current[i - 1]?.focus();
                        }}
                        sx={{
                          width: "100%", height: "100%", border: "none", outline: "none",
                          background: "transparent", textAlign: "center",
                          fontSize: "1.75rem", fontWeight: 700, color: ACCENT,
                          fontFamily: "Poppins", cursor: "text",
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>

              {touched.code && errors.code && (
                <Typography sx={{ color: "#EF4444", fontSize: "0.78rem", fontFamily: "Poppins", mt: 1.5, textAlign: "center" }}>
                  {errors.code}
                </Typography>
              )}
            </Box>
          )}

          {/* ── Timer ── */}
          {(isExpired || isRunning) && (
            <Box sx={{ textAlign: "center", mt: 1.5 }}>
              <Typography sx={{
                fontSize: "0.8rem", fontFamily: "Poppins", fontWeight: 500,
                color: secondsLeft > 60 ? "#9CA3AF" : secondsLeft > 0 ? "#F59E0B" : "#EF4444",
                transition: "color 0.3s",
              }}>
                {secondsLeft > 0
                  ? t("signin.code_expires", { time: formatTimeLeft(secondsLeft) })
                  : t("signin.code_expired")}
              </Typography>
            </Box>
          )}

          {/* ── Submit ── */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || (step === 2 && !isExpired && values.code.length < CODE_LENGTH)}
            onClick={() => {
              if (step === 2 && isExpired) {
                setFieldValue("code", "", false);
                codeInputsRef.current.forEach((el) => { if (el) el.value = ""; });
                handleSendCode(values.email);
              }
            }}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
            sx={{
              mt: 3,
              height: 56,
              borderRadius: "14px",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.01em",
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
              boxShadow: `0 4px 20px ${ACCENT}50`,
              color: "#fff",
              transition: "all 0.2s",
              "&:hover": {
                background: `linear-gradient(135deg, #0caa9d 0%, #059669 100%)`,
                boxShadow: `0 8px 28px ${ACCENT}60`,
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "translateY(0)" },
              "&.Mui-disabled": { background: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
            }}
          >
            {loading
              ? (step === 1 ? t("signin.btn_sending") : isExpired ? t("signin.btn_resending") : t("signin.btn_verifying"))
              : (step === 1 ? t("signin.btn_send") : isExpired ? t("signin.btn_resend") : t("signin.btn_verify"))}
          </Button>

          {/* ── Security note ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mt: 1.5 }}>
            <LockOutlinedIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "Poppins" }}>
              {t("signin.security_note")}
            </Typography>
          </Box>

          {/* ── Change email ── */}
          {step === 2 && (
            <Button
              variant="text"
              fullWidth
              sx={{
                mt: 1.5,
                height: 42,
                borderRadius: "10px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "0.85rem",
                textTransform: "none",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                "&:hover": { bgcolor: `${ACCENT}08`, color: ACCENT, borderColor: `${ACCENT}44` },
              }}
              onClick={() => { clearTimer(); setStep(1); setFieldValue("code", ""); }}
            >
              {t("signin.change_email")}
            </Button>
          )}
        </Box>
      )}
    </Formik>
  );
};

export default SigninForm;
