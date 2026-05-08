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

type FormValues = { email: string; code: string };

const CODE_LENGTH = 6;
const ACCENT = "#0D9488";

interface Props { themeColors: any }

const SigninForm: React.FC<Props> = ({ themeColors }) => {
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
  const isOtpLocked = step === 2 && loading;

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
    router.replace("/candidate/dashboard");
  };

  const onSubmit = async (data: FormValues) => {
    if (step === 1) await handleSendCode(data.email);
    else await handleVerifyCode();
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontFamily: "Poppins",
      fontSize: { xs: "0.85rem", sm: "0.88rem" },
      height: { xs: 44, sm: 46 },
      bgcolor: "#F9FAFB",
      transition: "background-color 0.15s",
      "& fieldset": { borderColor: "#E5E7EB", borderWidth: "1.5px" },
      "&:hover fieldset": { borderColor: "#D1D5DB" },
      "&:hover": { bgcolor: "#F3F4F6" },
      "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
      "&.Mui-focused": { bgcolor: "#fff" },
      "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
        WebkitBoxShadow: "0 0 0 1000px #F9FAFB inset",
        WebkitTextFillColor: "#0F172A",
        caretColor: "#0F172A",
        transition: "background-color 9999s ease-out 0s",
        borderRadius: "inherit",
      },
    },
    "& .MuiFormHelperText-root": { fontFamily: "Poppins", fontSize: "0.7rem", mt: 0.5 },
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <Box>
          <Typography sx={{ fontSize: { xs: "0.73rem", sm: "0.75rem" }, fontWeight: 500, color: "#374151", fontFamily: "Poppins", mb: 0.5 }}>
            {t("signin.email_label")}
          </Typography>
          <TextField
            error={!!errors.email}
            helperText={invitationEmail ? t("signin.email_prefilled") : errors.email?.message}
            fullWidth
            placeholder="you@company.com"
            disabled={loading || !!invitationEmail}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
            {...register("email", {
              required: t("signin.validation.email_required"),
              pattern: { value: /^\S+@\S+\.\S+$/, message: t("signin.validation.email_invalid") },
            })}
          />
          <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.7rem" }, color: "#9CA3AF", fontFamily: "Poppins", mt: 0.5 }}>
            {t("signin.email_hint")}
          </Typography>
        </Box>
      )}

      {/* ── Step 2: OTP ── */}
      {step === 2 && (
        <Box>
          {/* Clean header */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 2.25, md: 2.25 } }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "11px",
              bgcolor: `${ACCENT}0F`,
              border: `1px solid ${ACCENT}1A`,
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 1.25,
            }}>
              <EmailOutlinedIcon sx={{ fontSize: 21, color: ACCENT }} />
            </Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1rem" }, color: "#111827", mb: 0.5 }}>
              {t("signin.code_sent_title")}
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: { xs: "0.78rem", sm: "0.83rem" }, color: "#6B7280", px: 1 }}>
              {t("signin.code_sent_to")}{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#374151" }}>{emailValue}</Box>
            </Typography>
          </Box>

          {/* OTP boxes */}
          <Stack direction="row" spacing={{ xs: 0.75, sm: 1, md: 1 }} justifyContent="center">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const filled = !!codeValue[i];
              return (
                <Box
                  key={i}
                  sx={{
                    width: { xs: 40, sm: 44, md: 48 },
                    height: { xs: 48, sm: 52, md: 56 },
                    borderRadius: "10px",
                    border: `1.5px solid ${filled ? ACCENT : "#E5E7EB"}`,
                    bgcolor: filled ? `${ACCENT}06` : "#FAFAFA",
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
                    disabled={isOtpLocked}
                    maxLength={1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (isOtpLocked) return;
                      const raw = e.target.value.replace(/\D/g, "");
                      const cur = getValues("code");
                      if (!raw) { const arr = cur.split(""); arr[i] = ""; setValue("code", arr.join("")); return; }
                      const arr = cur.split(""); arr[i] = raw[0]; setValue("code", arr.join(""));
                      if (i < CODE_LENGTH - 1) codeInputsRef.current[i + 1]?.focus();
                    }}
                    onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                      if (isOtpLocked) return;
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
                      if (isOtpLocked) return;
                      if (e.key === "Backspace" && !getValues("code")[i] && i > 0) codeInputsRef.current[i - 1]?.focus();
                    }}
                    sx={{
                      width: "100%", height: "100%", border: "none", outline: "none",
                      background: "transparent", textAlign: "center",
                      fontSize: { xs: "1.2rem", sm: "1.35rem" }, fontWeight: 700, color: "#0F172A",
                      fontFamily: "Poppins",
                      cursor: isOtpLocked ? "not-allowed" : "text",
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
        <Box sx={{ textAlign: "center", mt: 1.25 }}>
          <Typography sx={{
            fontSize: { xs: "0.72rem", sm: "0.75rem" }, fontFamily: "Poppins", fontWeight: 500,
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
        endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 15 }} />}
        startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
        sx={{
          mt: { xs: 1.5, sm: 1.75, md: 1.75 },
          height: { xs: 44, sm: 46 },
          borderRadius: "10px",
          textTransform: "none",
          fontFamily: "Poppins",
          fontWeight: 600,
          fontSize: { xs: "0.88rem", sm: "0.92rem" },
          bgcolor: ACCENT,
          color: "#fff",
          boxShadow: "none",
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "#0F766E", boxShadow: "none" },
          "&:active": { bgcolor: "#0B6563" },
          "&.Mui-disabled": { bgcolor: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
        }}
      >
        {loading
          ? (step === 1 ? t("signin.btn_sending") : isExpired ? t("signin.btn_resending") : t("signin.btn_verifying"))
          : (step === 1 ? t("signin.btn_send") : isExpired ? t("signin.btn_resend") : t("signin.btn_verify"))}
      </Button>

      {/* ── Security note ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mt: 1 }}>
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
            mt: 1,
            height: { xs: 36, sm: 38 },
            borderRadius: "10px",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "0.8rem", sm: "0.83rem" },
            textTransform: "none",
            color: "#6B7280",
            border: "1px solid #E5E7EB",
            "&:hover": { bgcolor: "#F9FAFB", color: "#374151", borderColor: "#D1D5DB", boxShadow: "none" },
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
