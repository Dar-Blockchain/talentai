import React, { useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registerUser, verifyOTP } from "@/store/slices/authSlice";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { formatTimeLeft } from "@/utils/functions";
import { useTranslation } from "react-i18next";
import { registerMq } from "@/components/features/register/registerLayout";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "company_reg_code_expires_at";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const adornIconSx = { fontSize: { xs: 18, sm: 19, md: 19.5, [registerMq.desktopUp]: 20 }, color: "#9CA3AF" };

const fieldSx = {
  "& .MuiInputLabel-root": {
    color: "#6B7280",
    fontFamily: "Poppins",
    fontSize: { xs: "0.8rem", sm: "0.84rem", md: "0.9rem", [registerMq.desktopUp]: "0.95rem" },
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.84rem", sm: "0.9rem", md: "0.95rem", [registerMq.desktopUp]: "1rem" },
    fontFamily: "Poppins",
  },
  "& .MuiInputBase-input::placeholder": {
    fontSize: { xs: "0.74rem", sm: "0.78rem", md: "0.8rem", [registerMq.desktopUp]: "0.82rem" },
    opacity: 1,
    color: "#C4CAD4",
  },
  "& .MuiFormHelperText-root": {
    fontSize: { xs: "0.68rem", sm: "0.72rem", md: "0.74rem", [registerMq.desktopUp]: "0.75rem" },
    mx: 0,
    mt: { xs: 0.35, sm: 0.35, [registerMq.desktopUp]: 0.5 },
    lineHeight: 1.35,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: "11px", sm: "11px", [registerMq.desktopUp]: "14px" },
    fontFamily: "Poppins",
    bgcolor: "#F9FAFB",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&:hover": { bgcolor: "#F3F4F6" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
    "& .MuiOutlinedInput-input": {
      py: { xs: 0.85, sm: 0.95, md: 1.1, [registerMq.desktopUp]: 1.35 },
      px: { xs: 0.35, sm: 0.35, [registerMq.desktopUp]: 0.5 },
    },
  },
  [registerMq.tabletOnly]: {
    "& .MuiInputLabel-root": { fontSize: "0.8rem" },
    "& .MuiInputBase-input": { fontSize: "0.84rem" },
    "& .MuiInputBase-input::placeholder": { fontSize: "0.74rem" },
    "& .MuiFormHelperText-root": { fontSize: "0.68rem" },
    "& .MuiOutlinedInput-root": { borderRadius: "14px" },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-input": { py: 1.05, px: 0.4 },
  },
};

const half = {
  flex: { xs: "1 1 100%", [registerMq.desktopUp]: "1 1 calc(50% - 10px)", lg: "1 1 calc(50% - 14px)" },
  minWidth: 0,
  maxWidth: { xs: "100%", [registerMq.desktopUp]: "none" },
  [registerMq.tabletOnly]: {
    flex: "1 1 100%",
  },
};
const full = { flex: "1 1 100%", minWidth: 0 };

const selectMenuProps = {
  PaperProps: {
    sx: {
      mt: { xs: 0.25, sm: 0.25, [registerMq.desktopUp]: 0.5 },
      maxHeight: { xs: "min(34vh, 220px)", sm: "min(36vh, 240px)", md: "min(40vh, 255px)", [registerMq.desktopUp]: "min(42vh, 260px)", lg: 280 },
      borderRadius: { xs: "10px", sm: "10px", [registerMq.desktopUp]: "12px" },
      boxShadow: "0px 6px 24px rgba(0,0,0,0.1)",
      border: "1px solid rgba(0,0,0,0.06)",
      "& .MuiList-root": { py: { xs: 0.35, sm: 0.35, [registerMq.desktopUp]: 0.5 } },
      "& .MuiMenuItem-root": {
        fontSize: { xs: "0.76rem", sm: "0.82rem", md: "0.86rem", [registerMq.desktopUp]: "0.9rem" },
        py: { xs: 0.45, sm: 0.45, [registerMq.desktopUp]: 0.75 },
        px: { xs: 1.2, sm: 1.2, [registerMq.desktopUp]: 1.5 },
        minHeight: { xs: 36, sm: 36, [registerMq.desktopUp]: "auto" },
        borderRadius: { xs: 1, sm: 1 },
        mx: { xs: 0.5, sm: 0.5 },
        color: "#444",
        fontFamily: "Poppins",
        transition: "background 0.15s",
        "&:hover": { background: `rgba(13,148,136,0.08)`, color: "#222" },
        "&.Mui-selected": {
          background: `rgba(13,148,136,0.12)`,
          color: ACCENT,
          fontWeight: 600,
          "&:hover": { background: `rgba(13,148,136,0.18)` },
        },
      },
    },
  },
  anchorOrigin: { vertical: "bottom" as const, horizontal: "left" as const },
  transformOrigin: { vertical: "top" as const, horizontal: "left" as const },
};

const COMPANY_SIZES = ["1–10 employees", "10–50 employees", "50–200 employees", "200–500 employees", "500+ employees"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Other"];

type FormValues = {
  name: string; email: string; industry: string; size: string;
  location: string; website: string; linkedin: string;
};

interface Props { onStepChange?: (step: 1 | 2) => void; onEmailChange?: (email: string) => void; }

const submitBtnSx = {
  textTransform: "none",
  fontFamily: "Poppins",
  fontWeight: 700,
  borderRadius: { xs: "11px", sm: "11px", [registerMq.desktopUp]: "14px" },
  minHeight: { xs: 44, sm: 46, md: 50, [registerMq.desktopUp]: 56 },
  py: { xs: 0.8, sm: 0.9, md: 1.05, [registerMq.desktopUp]: 1.25 },
  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`,
  color: "#fff",
  boxShadow: `0 4px 16px ${ACCENT}45`,
  letterSpacing: "0.01em",
  fontSize: { xs: "0.8rem", sm: "0.86rem", md: "0.92rem", [registerMq.desktopUp]: "1rem" },
  transition: "all 0.2s",
  "&:hover": {
    background: `linear-gradient(135deg, #0caa9d 0%, ${ACCENT2} 100%)`,
    boxShadow: `0 6px 22px ${ACCENT}55`,
    transform: "translateY(-1px)",
  },
  "&:active": { transform: "translateY(0)" },
  "&.Mui-disabled": { background: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
  [registerMq.tabletOnly]: { fontSize: "0.8rem" },
};

const CompanyRegisterForm: React.FC<Props> = ({ onStepChange, onEmailChange }) => {
  const { t } = useTranslation("auth");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [otpCode, setOtpCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

  const { register, handleSubmit, control, getValues, formState: { errors } } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", industry: "", size: "", location: "", website: "", linkedin: "" },
  });

  const placeholderSelectSx = {
    color: "#C4CAD4",
    fontSize: { xs: "0.74rem", sm: "0.78rem", md: "0.8rem", [registerMq.desktopUp]: "0.82rem" },
    fontFamily: "Poppins",
    [registerMq.tabletOnly]: { fontSize: "0.74rem" },
  };

  const handleSendCode = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email.toLowerCase().trim(),
        roleType: "Company",
        name: values.name,
        companyDetails: { industry: values.industry, size: values.size, location: values.location, website: values.website, linkedin: values.linkedin },
      };
      await dispatch(registerUser(payload)).unwrap();
      const email = values.email.toLowerCase().trim();
      setSavedEmail(email);
      onEmailChange?.(email);
      startTimer();
      setStep(2);
      onStepChange?.(2);
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to send verification code. Please try again.";
      showToast({ message: msg, severity: "error" });
    } finally { setLoading(false); }
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
      router.replace("/company/dashboard");
    } catch {
      showToast({ message: "Invalid code. Please try again.", severity: "error" });
      setLoading(false);
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
      {step === 1 && (
        <Box
          component="form"
          onSubmit={handleSubmit(handleSendCode)}
          sx={{
            mb: { xs: 1, sm: 1, [registerMq.desktopUp]: 2 },
            textAlign: "left",
            display: "flex",
            flexWrap: "wrap",
            columnGap: { xs: 1.6, sm: 2, md: 2.25, [registerMq.desktopUp]: 2.5, lg: 3.5 },
            rowGap: { xs: 2, sm: 2.2, md: 2.5, [registerMq.desktopUp]: 2.75, lg: 3.5 },
            [registerMq.tabletOnly]: {
              columnGap: 0,
              rowGap: 1.65,
            },
          }}
        >

          <Box sx={half}>
            <TextField
              label={t("company_form.company_name")}
              placeholder="Acme Corp"
              fullWidth
              disabled={loading}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                    <BusinessIcon sx={adornIconSx} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
              {...register("name", { required: t("company_form.validation.company_name_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label={t("company_form.work_email")}
              placeholder="contact@company.com"
              fullWidth
              type="email"
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                    <EmailIcon sx={adornIconSx} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
              {...register("email", {
                required: t("company_form.validation.email_required"),
                pattern: { value: /^\S+@\S+\.\S+$/, message: t("company_form.validation.email_invalid") },
              })}
            />
          </Box>

          <Box sx={half}>
            <Controller
              name="industry"
              control={control}
              rules={{ required: t("company_form.validation.industry_required") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("company_form.industry")}
                  fullWidth
                  select
                  disabled={loading}
                  error={!!errors.industry}
                  helperText={errors.industry?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                        <CategoryIcon sx={adornIconSx} />
                      </InputAdornment>
                    ),
                  }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                    renderValue: (value: unknown) =>
                      value ? (
                        String(value)
                      ) : (
                        <Typography component="span" sx={placeholderSelectSx}>
                          {t("company_form.select_industry")}
                        </Typography>
                      ),
                  }}
                  sx={fieldSx}
                >
                  {INDUSTRIES.map((ind) => (
                    <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
          <Box sx={half}>
            <Controller
              name="size"
              control={control}
              rules={{ required: t("company_form.validation.size_required") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("company_form.company_size")}
                  fullWidth
                  select
                  disabled={loading}
                  error={!!errors.size}
                  helperText={errors.size?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                        <PeopleIcon sx={adornIconSx} />
                      </InputAdornment>
                    ),
                  }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                    renderValue: (value: unknown) =>
                      value ? (
                        String(value)
                      ) : (
                        <Typography component="span" sx={placeholderSelectSx}>
                          {t("company_form.select_size")}
                        </Typography>
                      ),
                  }}
                  sx={fieldSx}
                >
                  {COMPANY_SIZES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>

          <Box sx={half}>
            <TextField
              label={t("company_form.location")}
              placeholder="e.g. Paris, France"
              fullWidth
              disabled={loading}
              error={!!errors.location}
              helperText={errors.location?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                    <LocationOnIcon sx={adornIconSx} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
              {...register("location", { required: t("company_form.validation.location_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label={t("company_form.website")}
              placeholder="https://yourcompany.com"
              fullWidth
              disabled={loading}
              error={!!errors.website}
              helperText={errors.website?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                    <LanguageIcon sx={adornIconSx} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
              {...register("website", {
                validate: (value) => {
                  if (!value) return true;
                  try {
                    const url = new URL(value);
                    if (!["http:", "https:"].includes(url.protocol)) return t("company_form.validation.url_protocol");
                    if (!url.hostname.includes(".")) return t("company_form.validation.url_domain");
                    return true;
                  } catch { return t("company_form.validation.url_invalid"); }
                },
              })}
            />
          </Box>

          <Box sx={full}>
            <TextField
              label={t("company_form.linkedin")}
              placeholder="https://linkedin.com/company/..."
              fullWidth
              disabled={loading}
              error={!!errors.linkedin}
              helperText={errors.linkedin?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: { xs: -0.25, sm: -0.25, [registerMq.desktopUp]: 0 } }}>
                    <LinkedInIcon sx={adornIconSx} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
              {...register("linkedin", {
                validate: (value) => {
                  if (!value) return true;
                  try {
                    const url = new URL(value);
                    if (!["http:", "https:"].includes(url.protocol)) return t("company_form.validation.linkedin_protocol");
                    if (!url.hostname.replace("www.", "").startsWith("linkedin.com")) return t("company_form.validation.linkedin_domain");
                    if (!url.pathname.startsWith("/company/")) return t("company_form.validation.linkedin_path");
                    return true;
                  } catch { return t("company_form.validation.linkedin_protocol"); }
                },
              })}
            />
          </Box>

          <Box sx={full}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 18, sm: 18, [registerMq.desktopUp]: 18 } }} />}
              startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
              sx={submitBtnSx}
            >
              {loading ? t("company_form.btn_sending") : t("company_form.btn_continue")}
            </Button>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box sx={{ mb: { xs: 1, sm: 1, [registerMq.desktopUp]: 2 } }}>
          <Box sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: 1, sm: 1, [registerMq.desktopUp]: 1.5 },
            bgcolor: `${ACCENT}0A`,
            border: `1px solid ${ACCENT}22`,
            borderRadius: { xs: "11px", sm: "11px", [registerMq.desktopUp]: "12px" },
            px: { xs: 1.35, sm: 1.35, [registerMq.desktopUp]: 2 },
            py: { xs: 1.1, sm: 1.1, [registerMq.desktopUp]: 1.5 },
            mb: { xs: 2, sm: 2, [registerMq.desktopUp]: 3 },
            minWidth: 0,
          }}>
            <EmailIcon sx={{ fontSize: { xs: 18, sm: 18, [registerMq.desktopUp]: 18 }, color: ACCENT, flexShrink: 0, mt: 0.15 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.74rem", md: "0.76rem", [registerMq.desktopUp]: "0.78rem" }, color: "#6B7280", fontFamily: "Poppins" }}>
                {t("company_form.code_sent_to")}
              </Typography>
              <Typography sx={{
                fontSize: { xs: "0.84rem", sm: "0.86rem", md: "0.87rem", [registerMq.desktopUp]: "0.88rem" },
                [registerMq.tabletOnly]: { fontSize: "0.84rem" },
                color: "#0F172A",
                fontFamily: "Poppins",
                fontWeight: 700,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                lineHeight: 1.3,
              }}>
                {savedEmail}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "center",
            gap: { xs: 0.55, sm: 0.55, [registerMq.desktopUp]: 1, lg: 1.5 },
            width: "100%",
            maxWidth: { xs: "100%", sm: "100%", [registerMq.desktopUp]: 380 },
            mx: "auto",
          }}>
            {otpCode.map((digit, index) => (
              <Box
                key={index}
                sx={{
                  flex: "1 1 0",
                  minWidth: { xs: 28, sm: 28, [registerMq.desktopUp]: 36 },
                  maxWidth: { xs: 46, sm: 46, [registerMq.desktopUp]: 54 },
                  height: { xs: 44, sm: 44, [registerMq.desktopUp]: 54, lg: 62 },
                  borderRadius: { xs: "11px", sm: "11px", [registerMq.desktopUp]: "12px", lg: "14px" },
                  border: `1.5px solid ${digit ? ACCENT : "#E2E8F0"}`,
                  bgcolor: digit ? `${ACCENT}10` : "#FAFAFA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.15s, background-color 0.15s",
                  "&:focus-within": {
                    borderColor: ACCENT,
                    bgcolor: "#fff",
                    boxShadow: `0 0 0 3px ${ACCENT}20`,
                  },
                }}
              >
                <Box
                  component="input"
                  ref={(el: unknown) => { codeInputsRef.current[index] = el as HTMLInputElement | null; }}
                  value={digit}
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    textAlign: "center",
                    fontSize: { xs: "1.15rem", sm: "1.22rem", md: "1.28rem", [registerMq.desktopUp]: "1.35rem", lg: "1.55rem" },
                    [registerMq.tabletOnly]: { fontSize: "1.15rem" },
                    fontWeight: 700,
                    color: "#0F172A",
                    fontFamily: "Poppins",
                    minWidth: 0,
                  }}
                />
              </Box>
            ))}
          </Box>

          {(isExpired || isRunning) && (
            <Box sx={{ textAlign: "center", mt: { xs: 1, sm: 1, [registerMq.desktopUp]: 1.5 } }}>
              <Typography sx={{
                fontSize: { xs: "0.74rem", sm: "0.77rem", md: "0.79rem", [registerMq.desktopUp]: "0.8rem" },
                [registerMq.tabletOnly]: { fontSize: "0.74rem" },
                fontFamily: "Poppins",
                fontWeight: 500,
                color: secondsLeft > 60 ? "#9CA3AF" : secondsLeft > 0 ? "#F59E0B" : "#EF4444",
              }}>
                {secondsLeft > 0
                  ? t("company_form.code_expires", { time: formatTimeLeft(secondsLeft) })
                  : t("company_form.code_expired")}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={isExpired ? () => handleSendCode(getValues()) : handleVerifyAndRegister}
            disabled={loading || (!isExpired && otpCode.join("").length < CODE_LENGTH)}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 18, sm: 18, [registerMq.desktopUp]: 18 } }} />}
            startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
            sx={{ ...submitBtnSx, mt: { xs: 2, sm: 2, [registerMq.desktopUp]: 3 } }}
          >
            {loading
              ? isExpired ? t("company_form.btn_resending") : t("company_form.btn_creating")
              : isExpired ? t("company_form.btn_resend") : t("company_form.btn_verify")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CompanyRegisterForm;
