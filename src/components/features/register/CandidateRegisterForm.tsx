import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Dialog,
  DialogContent,
  LinearProgress,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registerUser, verifyOTP, resendOTP } from "@/store/slices/authSlice";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { formatTimeLeft } from "@/utils/functions";
import { isInvitationUrl } from "@/utils/memberInvitation";
import { useTranslation } from "react-i18next";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "candidate_reg_code_expires_at";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const fieldSx = {
  "& .MuiInputLabel-root": { color: "#6B7280", fontFamily: "Poppins", fontWeight: 500, fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "0.95rem" } },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
    fontFamily: "Poppins",
  },
  "& .MuiInputBase-input::placeholder": { fontSize: { xs: "0.73rem", sm: "0.78rem", md: "0.82rem" }, opacity: 1, color: "#C4CAD4" },
  "& .MuiFormHelperText-root": { fontSize: { xs: "0.6875rem", sm: "0.72rem", md: "0.75rem" } },
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    fontFamily: "Poppins",
    fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
    bgcolor: "#F9FAFB",
    minHeight: { xs: "48px", sm: "52px", md: "56px" },
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&:hover": { bgcolor: "#F3F4F6" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
  },
};

const half = {
  flex: "1 1 100%",
  minWidth: 0,
  "@media (min-width:1025px)": { flex: "1 1 calc(50% - 12px)" },
};
const full = { flex: "1 1 100%" };

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

interface Props {
  onStepChange?: (step: 1 | 2) => void;
  onEmailChange?: (email: string) => void;
}

const submitBtnSx = {
  textTransform: "none",
  fontFamily: "Poppins",
  fontWeight: 700,
  borderRadius: "14px",
  height: { xs: 48, sm: 52, md: 56 },
  px: { xs: 1.5, sm: 2, md: 2.25 },
  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
  color: "#fff",
  boxShadow: `0 4px 20px ${ACCENT}50`,
  letterSpacing: "0.01em",
  fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
  transition: "all 0.2s",
  "&:hover": {
    background: `linear-gradient(135deg, #0caa9d 0%, ${ACCENT2} 100%)`,
    boxShadow: `0 8px 28px ${ACCENT}60`,
    transform: "translateY(-1px)",
  },
  "&:active": { transform: "translateY(0)" },
  "&.Mui-disabled": { background: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
};

const CandidateRegisterForm: React.FC<Props> = ({ onStepChange, onEmailChange }) => {
  const { t } = useTranslation("auth");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const { showToast } = useToast();

  const isJoinTeam = isInvitationUrl(returnUrl);

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
    } catch {
      return "";
    }
  }, [returnUrl]);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [otpCode, setOtpCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" });

  useEffect(() => {
    if (invitationEmail) setValue("email", invitationEmail);
  }, [invitationEmail]);

  useEffect(() => {
    if (!analyzingCv) { setCvProgress(0); return; }
    setCvProgress(0);
    const timer = setInterval(() => {
      setCvProgress((prev) => {
        if (prev >= 90) { clearInterval(timer); return 90; }
        return prev + (prev < 60 ? 4 : 1);
      });
    }, 300);
    return () => clearInterval(timer);
  }, [analyzingCv]);

  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

  const handleSendCode = async (values: FormValues) => {
    if (!isJoinTeam && !cvFile) { setCvError(true); return; }
    setLoading(true);
    if (!isJoinTeam && cvFile) setAnalyzingCv(true);
    try {
      const payload = new FormData();
      payload.append("roleType", "Candidate");
      payload.append("firstName", values.firstName);
      payload.append("lastName", values.lastName);
      payload.append("email", values.email.toLowerCase().trim());
      if (!isJoinTeam) {
        payload.append("phone", values.phone);
        if (cvFile) payload.append("resume", cvFile);
      }
      await dispatch(registerUser(payload)).unwrap();
      const email = values.email.toLowerCase().trim();
      setSavedEmail(email);
      onEmailChange?.(email);
      startTimer();
      setStep(2);
      onStepChange?.(2);
    } catch (err: any) {
      showToast({ message: err || "Failed to send verification code. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
      setAnalyzingCv(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    const code = otpCode.join("");
    if (code.length < CODE_LENGTH) return;
    setLoading(true);
    try {
      clearTimer();
      const location = await getUserLocation();
      const response = await dispatch(verifyOTP({ email: savedEmail, otp: code, location })).unwrap();
      if (!response.token) {
        showToast({ message: "Verification failed. Please try again.", severity: "error" });
        setLoading(false);
        return;
      }
      router.replace(returnUrl ? decodeURIComponent(returnUrl) : "/candidate/dashboard");
    } catch {
      showToast({ message: "Invalid code. Please try again.", severity: "error" });
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await dispatch(resendOTP(savedEmail)).unwrap();
      clearTimer();
      startTimer();
      setOtpCode(Array(CODE_LENGTH).fill(""));
      showToast({ message: "A new verification code has been sent to your email.", severity: "success" });
    } catch (err: any) {
      showToast({ message: err || "Failed to resend code. Please try again.", severity: "error" });
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "")[0] ?? "";
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);
    if (digit && index < CODE_LENGTH - 1) codeInputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) codeInputsRef.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    const newCode = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < CODE_LENGTH; i++) newCode[i] = paste[i] ?? "";
    setOtpCode(newCode);
    codeInputsRef.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <Box>
      {/* STEP 1 – Info Form */}
      {step === 1 && (
        <Box
          component="form"
          onSubmit={handleSubmit(handleSendCode)}
          sx={{ mb: 2, textAlign: "left", display: "flex", flexWrap: "wrap", gap: { xs: 2.25, sm: 2.75, md: 3 } }}
        >
          <Box sx={half}>
            <TextField
              label={t("candidate_form.first_name")}
              placeholder="John"
              fullWidth
              disabled={loading}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("firstName", { required: t("candidate_form.validation.first_name_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label={t("candidate_form.last_name")}
              placeholder="Doe"
              fullWidth
              disabled={loading}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("lastName", { required: t("candidate_form.validation.last_name_required") })}
            />
          </Box>

          <Box sx={half}>
            <TextField
              label={t("candidate_form.email")}
              placeholder="john@example.com"
              fullWidth
              type="email"
              disabled={loading || !!invitationEmail}
              error={!!errors.email}
              helperText={invitationEmail ? t("candidate_form.email_prefilled") : errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("email", {
                required: t("candidate_form.validation.email_required"),
                pattern: { value: /^\S+@\S+\.\S+$/, message: t("candidate_form.validation.email_invalid") },
              })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label={t("candidate_form.phone")}
              placeholder="+1 234 567 890"
              fullWidth
              disabled={loading}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: { xs: 18, md: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("phone", {
                required: t("candidate_form.validation.phone_required"),
                validate: (v) =>
                  /^\+?[1-9]\d{6,14}$/.test(v.replace(/[\s\-().]/g, "")) ||
                  t("candidate_form.validation.phone_invalid"),
              })}
            />
          </Box>

          {/* CV Upload */}
          {!isJoinTeam && (
            <Box sx={full}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setCvFile(file);
                  if (file) setCvError(false);
                }}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0] ?? null;
                  if (file && /\.(pdf|doc|docx)$/i.test(file.name)) { setCvFile(file); setCvError(false); }
                }}
                sx={{
                  border: "1.5px dashed",
                  borderColor: cvError ? "#EF4444" : isDragging ? ACCENT : cvFile ? ACCENT : "#E5E7EB",
                  borderRadius: "12px", py: { xs: 1.25, md: 1.5 }, px: { xs: 1.5, md: 2 }, cursor: "pointer",
                  display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 1.5,
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  background: isDragging ? `${ACCENT}0C` : cvFile ? `${ACCENT}06` : "#FAFAFA",
                  transform: isDragging ? "scale(1.015)" : "scale(1)",
                  boxShadow: isDragging ? `0 8px 32px ${ACCENT}22` : "none",
                  "&:hover": { borderColor: cvFile ? ACCENT : "#9CA3AF", background: cvFile ? `${ACCENT}08` : "#F5F5F5" },
                }}
              >
                <Box sx={{
                  width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
                  bgcolor: cvFile ? `${ACCENT}12` : isDragging ? `${ACCENT}18` : "#F0F0F0",
                  border: cvFile ? `1px solid ${ACCENT}30` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                }}>
                  {cvFile
                    ? <CheckCircleOutlineIcon sx={{ fontSize: { xs: 16, md: 18 }, color: ACCENT }} />
                    : <UploadFileIcon sx={{ fontSize: { xs: 16, md: 18 }, color: isDragging ? ACCENT : "#9CA3AF" }} />
                  }
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.78rem", md: "0.82rem" }, color: cvFile ? "#0F172A" : isDragging ? ACCENT : "#374151", fontFamily: "Poppins", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cvFile ? cvFile.name : isDragging ? t("candidate_form.cv_drop") : t("candidate_form.cv_browse")}
                  </Typography>
                  <Typography sx={{ fontSize: { xs: "0.6625rem", sm: "0.695rem", md: "0.72rem" }, color: "#9CA3AF", fontFamily: "Poppins", lineHeight: 1.45 }}>
                    {cvFile
                      ? <>{(cvFile.size / 1024).toFixed(0)} KB · <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{t("candidate_form.cv_replace")}</Box></>
                      : cvError ? <Box component="span" sx={{ color: "#EF4444" }}>{t("candidate_form.cv_required")}</Box>
                      : t("candidate_form.cv_formats")
                    }
                  </Typography>
                </Box>
                {!cvFile && !isDragging && (
                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                    {["PDF", "DOC"].map((fmt) => (
                      <Box key={fmt} component="span" sx={{ px: { xs: 0.55, md: 0.75 }, py: 0.2, borderRadius: "5px", bgcolor: "#F3F4F6", border: "1px solid #E5E7EB", fontSize: { xs: "0.55rem", md: "0.6rem" }, fontWeight: 700, color: "#6B7280", letterSpacing: "0.04em" }}>
                        {fmt}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box sx={full}>
            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              onClick={() => { if (!isJoinTeam && !cvFile) setCvError(true); }}
              endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
              startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
              sx={submitBtnSx}
            >
              {loading ? t("candidate_form.btn_sending") : t("candidate_form.btn_continue")}
            </Button>
          </Box>
        </Box>
      )}

      {/* AI CV Analysis Modal */}
      <Dialog open={analyzingCv} disableEscapeKeyDown PaperProps={{ sx: { borderRadius: "20px", p: 0, minWidth: { xs: 300, sm: 340 }, maxWidth: { xs: "calc(100% - 32px)", sm: 380 }, overflow: "hidden", boxShadow: `0 24px 60px ${ACCENT}25` } }}>
        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${ACCENT} ${cvProgress}%, ${ACCENT}22 ${cvProgress}%)`, transition: "background 0.4s ease" }} />
        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5, md: 4 }, py: { xs: 2.75, md: 3.5 }, display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 }, borderRadius: "12px", background: `${ACCENT}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CircularProgress size={22} thickness={5} sx={{ color: ACCENT }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: "#111", lineHeight: 1.3, fontFamily: "Poppins", fontSize: { xs: "0.9375rem", sm: "1rem", md: "1.0625rem" } }}>
                {t("candidate_form.analyzing_title")}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.75rem", md: "0.78rem" }, color: "#888", fontFamily: "Poppins" }}>
                {t("candidate_form.analyzing_sub")}
              </Typography>
            </Box>
          </Box>

          {[
            { label: t("candidate_form.analyzing_reading"),  threshold: 0  },
            { label: t("candidate_form.analyzing_skills"),   threshold: 30 },
            { label: t("candidate_form.analyzing_profile"),  threshold: 65 },
          ].map(({ label, threshold }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: cvProgress > threshold ? `${ACCENT}15` : "rgba(0,0,0,0.04)", transition: "background 0.4s" }}>
                {cvProgress > threshold
                  ? <CheckCircleOutlineIcon sx={{ fontSize: 13, color: ACCENT }} />
                  : <CircularProgress size={10} thickness={5} sx={{ color: cvProgress >= threshold ? ACCENT : "#ccc" }} />
                }
              </Box>
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.79rem", md: "0.82rem" }, color: cvProgress > threshold ? "#333" : "#aaa", fontWeight: cvProgress > threshold ? 600 : 400, fontFamily: "Poppins", transition: "color 0.4s" }}>
                {label}
              </Typography>
            </Box>
          ))}

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.625rem", md: "0.65rem" }, color: "#999", fontFamily: "Poppins" }}>
                {t("candidate_form.analyzing_processing")}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.625rem", md: "0.65rem" }, color: ACCENT, fontWeight: 700, fontFamily: "Poppins" }}>
                {cvProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={cvProgress} sx={{ height: 6, borderRadius: 3, backgroundColor: `${ACCENT}15`, "& .MuiLinearProgress-bar": { borderRadius: 3, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` } }} />
          </Box>

          <Typography sx={{ fontSize: { xs: "0.6625rem", sm: "0.69rem", md: "0.72rem" }, color: "#bbb", textAlign: "center", mt: -1, fontFamily: "Poppins" }}>
            {t("candidate_form.analyzing_warning")}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* STEP 2 – OTP */}
      {step === 2 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: `${ACCENT}0A`, border: `1px solid ${ACCENT}22`, borderRadius: "12px", px: { xs: 1.5, md: 2 }, py: { xs: 1.25, md: 1.5 }, mb: 3 }}>
            <EmailIcon sx={{ fontSize: { xs: 16, md: 18 }, color: ACCENT, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: "0.73rem", sm: "0.76rem", md: "0.78rem" }, color: "#6B7280", fontFamily: "Poppins", lineHeight: 1.35 }}>
                {t("candidate_form.code_sent_to")}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.84rem", md: "0.88rem" }, color: "#0F172A", fontFamily: "Poppins", fontWeight: 700, overflowWrap: "break-word", wordBreak: "break-all" }}>
                {savedEmail}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={{ xs: 1, sm: 1.25, md: 1.5 }} justifyContent="center" sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            {otpCode.map((digit, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: 48, sm: 52, md: 58 },
                  height: { xs: 56, sm: 62, md: 68 },
                  borderRadius: "14px",
                  border: `1.5px solid ${digit ? ACCENT : "#D1FAF5"}`,
                  bgcolor: digit ? `${ACCENT}0C` : "#F8FFFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  flexShrink: 0,
                  "&:focus-within": { borderColor: ACCENT, bgcolor: "#fff", boxShadow: `0 0 0 4px ${ACCENT}18` },
                }}
              >
                <Box
                  component="input"
                  ref={(el: unknown) => { codeInputsRef.current[index] = el as HTMLInputElement | null; }}
                  value={digit}
                  maxLength={1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? (handleOtpPaste as any) : undefined}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    textAlign: "center",
                    fontSize: { xs: "1.25rem", sm: "1.42rem", md: "1.6rem" },
                    fontWeight: 700,
                    color: "#0F172A",
                    fontFamily: "Poppins",
                    cursor: "text",
                  }}
                />
              </Box>
            ))}
          </Stack>

          {(isExpired || isRunning) && (
            <Box sx={{ textAlign: "center", mt: 1.5 }}>
              <Typography sx={{ fontSize: { xs: "0.7375rem", sm: "0.77rem", md: "0.8rem" }, fontFamily: "Poppins", fontWeight: 500, color: secondsLeft > 60 ? "#9CA3AF" : secondsLeft > 0 ? "#F59E0B" : "#EF4444", transition: "color 0.3s", px: { xs: 0.25, md: 0 } }}>
                {secondsLeft > 0
                  ? t("candidate_form.code_expires", { time: formatTimeLeft(secondsLeft) })
                  : t("candidate_form.code_expired")}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth variant="contained"
            onClick={handleVerifyAndRegister}
            disabled={loading || isExpired || otpCode.join("").length < CODE_LENGTH}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
            sx={{ ...submitBtnSx, mt: 3 }}
          >
            {loading ? t("candidate_form.btn_creating") : t("candidate_form.btn_verify")}
          </Button>

          <Button
            fullWidth variant="text"
            onClick={handleResendCode}
            disabled={resendLoading || (!isExpired && isRunning)}
            startIcon={resendLoading ? <CircularProgress size={14} sx={{ color: ACCENT }} /> : undefined}
            sx={{ mt: 1.5, textTransform: "none", fontWeight: 500, fontSize: { xs: "0.78rem", sm: "0.82rem", md: "0.85rem" }, fontFamily: "Poppins", borderRadius: "10px", height: { xs: 40, sm: 42 }, py: { xs: 0.75, md: 1 }, px: { xs: 1, md: "auto" }, border: "1px solid #E5E7EB", color: isExpired ? ACCENT : "#9CA3AF", "&:hover": { bgcolor: `${ACCENT}08`, color: ACCENT, borderColor: `${ACCENT}44` }, "&.Mui-disabled": { color: "#C4C4C4", borderColor: "#E5E7EB" } }}
          >
            {resendLoading
              ? t("candidate_form.btn_resending")
              : isRunning && !isExpired
              ? t("candidate_form.btn_resend_timer", { time: formatTimeLeft(secondsLeft) })
              : t("candidate_form.btn_resend")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CandidateRegisterForm;
