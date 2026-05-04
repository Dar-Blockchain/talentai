import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, TextField, Button, Typography, Stack, CircularProgress, InputAdornment } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useForm } from "react-hook-form";
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
import { authOutlinedInputAutofillSx } from "@/components/features/register/authInputAutofillSx";

type FormValues = { email: string; code: string };

const CODE_LENGTH = 6;
const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const submitBtnSx = {
  textTransform: "none",
  fontFamily: "Poppins",
  fontWeight: 700,
  borderRadius: { xs: "11px", sm: "14px" },
  height: { xs: 42, sm: 53 },
  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
  color: "#fff",
  boxShadow: `0 4px 20px ${ACCENT}50`,
  letterSpacing: "0.01em",
  fontSize: { xs: "0.82rem", sm: "1rem" },
  transition: "all 0.2s",
  "&:hover": {
    background: `linear-gradient(135deg, #0caa9d 0%, ${ACCENT2} 100%)`,
    boxShadow: `0 8px 28px ${ACCENT}60`,
    transform: "translateY(-1px)",
  },
  "&:active": { transform: "translateY(0)" },
  "&.Mui-disabled": { background: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
};

interface Props { themeColors: any }

const SigninForm: React.FC<Props> = ({ themeColors: _themeColors }) => {
  const { t } = useTranslation("auth");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();
  const returnUrl = router.query.returnUrl as string | undefined;

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

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<FormValues>({
    defaultValues: { email: "", code: "" },
    mode: "onTouched",
  });

  const codeValue = watch("code");
  const emailValue = watch("email");

  useEffect(() => {
    if (invitationEmail) setValue("email", invitationEmail);
  }, [invitationEmail, setValue]);

  useEffect(() => () => { clearTimer(); }, []);

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

  const handleVerifyCode = async () => {
    const { email, code } = getValues();
    setLoading(true);
    try {
      clearTimer();
      const userLocation = await getUserLocation();
      const response = await dispatch(verifyOTP({ email: email.toLowerCase().trim(), otp: code, location: userLocation })).unwrap();
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

  const onSubmit = async (data: FormValues) => {
    if (step === 1) await handleSendCode(data.email);
    else await handleVerifyCode();
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: { xs: "11px", sm: "14px" },
      fontFamily: "Poppins",
      fontSize: { xs: "0.8125rem", sm: "calc(1rem - 2px)" },
      bgcolor: "#F9FAFB",
      transition: "background-color 0.15s",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#D1D5DB" },
      "&:hover": { bgcolor: "#F3F4F6" },
      "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
      "&.Mui-focused": { bgcolor: "#fff" },
      ...authOutlinedInputAutofillSx,
    },
    "& .MuiInputBase-input": {
      fontSize: { xs: "0.8125rem", sm: "calc(1rem - 2px)" },
      fontFamily: "Poppins",
      py: { xs: 0.5, sm: 0.625 },
    },
    "& .MuiFormHelperText-root": {
      fontFamily: "Poppins",
      fontSize: { xs: "0.68rem", sm: "0.75rem" },
      mx: 0,
      mt: { xs: 0.35, sm: 0.125 },
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <Box>
          <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.78rem" }, fontWeight: 500, color: "#374151", fontFamily: "Poppins", mb: { xs: 0.65, sm: 0.75 } }}>
            {t("signin.email_label")}
          </Typography>
          <TextField
            margin="none"
            error={!!errors.email}
            helperText={invitationEmail ? t("signin.email_prefilled") : errors.email?.message}
            fullWidth
            placeholder="you@company.com"
            disabled={loading || !!invitationEmail}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
            {...register("email", {
              required: t("signin.validation.email_required"),
              pattern: { value: /^\S+@\S+\.\S+$/, message: t("signin.validation.email_invalid") },
            })}
          />
          <Typography sx={{ fontSize: { xs: "0.66rem", sm: "0.72rem" }, color: "#9CA3AF", fontFamily: "Poppins", mt: { xs: 0.5, sm: 0.65 }, lineHeight: 1.45 }}>
            {t("signin.email_hint")}
          </Typography>
        </Box>
      )}

      {/* ── Step 2: OTP ── */}
      {step === 2 && (
        <Box>
          {/* Clean header */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 2.25 } }}>
            <Box sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: { xs: "12px", sm: "13px" },
              bgcolor: `${ACCENT}0F`,
              border: `1px solid ${ACCENT}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: { xs: 1.35, sm: 1.5 },
            }}>
              <EmailOutlinedIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: ACCENT }} />
            </Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: { xs: "0.92rem", sm: "1rem" }, color: "#111827", mb: { xs: 0.35, sm: 0.5 } }}>
              {t("signin.code_sent_title")}
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: { xs: "0.76rem", sm: "0.83rem" }, color: "#6B7280", px: { xs: 0.25, sm: 1 }, lineHeight: { xs: 1.45, sm: 1.55 } }}>
              {t("signin.code_sent_to")}{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#374151" }}>{emailValue}</Box>
            </Typography>
          </Box>

          {/* OTP boxes */}
          <Stack direction="row" spacing={{ xs: 1, sm: 1.125 }} justifyContent="center">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const filled = !!codeValue[i];
              return (
                <Box
                  key={i}
                  sx={{
                    width: { xs: 38, sm: 55 },
                    height: { xs: 46, sm: 65 },
                    borderRadius: { xs: "11px", sm: "13px" },
                    border: `1.5px solid ${filled ? ACCENT : "#D1FAF5"}`,
                    bgcolor: filled ? `${ACCENT}0C` : "#F8FFFE",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.15s, background-color 0.15s",
                    "&:focus-within": {
                      borderColor: ACCENT,
                      bgcolor: "#fff",
                      boxShadow: `0 0 0 3px ${ACCENT}18`,
                    },
                  }}
                >
                  <Box
                    component="input"
                    ref={(el: unknown) => { codeInputsRef.current[i] = el as HTMLInputElement | null; }}
                    value={codeValue[i] || ""}
                    maxLength={1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const cur = getValues("code");
                      if (!raw) { const arr = cur.split(""); arr[i] = ""; setValue("code", arr.join("")); return; }
                      const arr = cur.split(""); arr[i] = raw[0]; setValue("code", arr.join(""));
                      if (i < CODE_LENGTH - 1) codeInputsRef.current[i + 1]?.focus();
                    }}
                    onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      const paste = e.clipboardData.getData("text").replace(/\D/g, "");
                      if (!paste) return;
                      const cur = getValues("code");
                      const arr = cur.split("");
                      for (let j = 0; j < CODE_LENGTH; j++) arr[j] = paste[j] || arr[j] || "";
                      setValue("code", arr.join(""));
                      codeInputsRef.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Backspace" && !getValues("code")[i] && i > 0) codeInputsRef.current[i - 1]?.focus();
                    }}
                    sx={{
                      width: "100%", height: "100%", border: "none", outline: "none",
                      background: "transparent", textAlign: "center",
                      fontSize: { xs: "1.2rem", sm: "calc(1.6rem - 2px)" }, fontWeight: 700, color: "#0F172A",
                      fontFamily: "Poppins", cursor: "text",
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* ── Timer ── */}
      {(isExpired || isRunning) && (
        <Box sx={{ textAlign: "center", mt: { xs: 1, sm: 1.125 } }}>
          <Typography sx={{
            fontSize: { xs: "0.72rem", sm: "0.78rem" }, fontFamily: "Poppins", fontWeight: 500,
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
        type={step === 2 && isExpired ? "button" : "submit"}
        fullWidth
        variant="contained"
        disabled={loading || (step === 2 && !isExpired && codeValue.length < CODE_LENGTH)}
        onClick={step === 2 && isExpired ? () => {
          setValue("code", "");
          codeInputsRef.current.forEach((el) => { if (el) el.value = ""; });
          handleSendCode(getValues("email"));
        } : undefined}
        endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
        startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
        sx={{
          ...submitBtnSx,
          mt: { xs: 1.75, sm: 2.25 },
        }}
      >
        {loading
          ? (step === 1 ? t("signin.btn_sending") : isExpired ? t("signin.btn_resending") : t("signin.btn_verifying"))
          : (step === 1 ? t("signin.btn_send") : isExpired ? t("signin.btn_resend") : t("signin.btn_verify"))}
      </Button>

      {/* ── Security note ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 0.65, sm: 0.75 }, mt: { xs: 1, sm: 1.125 } }}>
        <LockOutlinedIcon sx={{ fontSize: 12, color: "#C4C9D4" }} />
        <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.72rem" }, color: "#9CA3AF", fontFamily: "Poppins" }}>
          {t("signin.security_note")}
        </Typography>
      </Box>

      {/* ── Change email ── */}
      {step === 2 && (
        <Button
          variant="text"
          fullWidth
          sx={{
            mt: { xs: 1, sm: 1.125 },
            height: { xs: 38, sm: 39 },
            borderRadius: "10px",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "0.78rem", sm: "0.85rem" },
            textTransform: "none",
            color: "#6B7280",
            border: "1px solid #E5E7EB",
            "&:hover": { bgcolor: `${ACCENT}08`, color: ACCENT, borderColor: `${ACCENT}44`, boxShadow: "none" },
          }}
          onClick={() => { clearTimer(); setStep(1); setValue("code", ""); }}
        >
          {t("signin.change_email")}
        </Button>
      )}
    </Box>
  );
};

export default SigninForm;
