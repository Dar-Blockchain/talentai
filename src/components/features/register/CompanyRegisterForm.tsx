import React, { useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
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
import { authOutlinedInputAutofillSx } from "./authInputAutofillSx";
import { useTranslation } from "react-i18next";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "company_reg_code_expires_at";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const fieldSx = {
  "& .MuiInputLabel-root": { color: "#6B7280", fontFamily: "Poppins", fontSize: { xs: "0.78rem", sm: "0.95rem" }, fontWeight: 500 },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
  "& .MuiInputBase-input": { fontSize: { xs: "0.8125rem", sm: "calc(1rem - 2px)" }, fontFamily: "Poppins", py: { xs: 0.5, sm: 0.625 } },
  "& .MuiInputBase-input::placeholder": { fontSize: { xs: "0.75rem", sm: "calc(0.82rem - 2px)" }, opacity: 1, color: "#C4CAD4" },
  "& .MuiFormHelperText-root": { fontSize: { xs: "0.68rem", sm: "0.75rem" }, mt: { xs: 0.35, sm: 0.125 } },
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: "11px", sm: "14px" },
    fontSize: { xs: "0.8125rem", sm: "calc(1rem - 2px)" },
    fontFamily: "Poppins",
    bgcolor: "#F9FAFB",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&:hover": { bgcolor: "#F3F4F6" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
    ...authOutlinedInputAutofillSx,
  },
};

/** عمودان من sm؛ يتماشى مع columnGap المرشح (sm/md) */
const half = {
  flex: {
    xs: "1 1 100%",
    sm: "1 1 calc(50% - 8px)",
    md: "1 1 calc(50% - 10.5px)",
  },
  minWidth: 0,
};
const full = { flex: "1 1 100%" };

const selectMenuProps = {
  PaperProps: {
    sx: {
      mt: { xs: 0.25, sm: 0.5 },
      borderRadius: { xs: 1.25, sm: 2 },
      boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      maxWidth: "min(100vw - 24px, 400px)",
      "& .MuiList-root": { py: { xs: 0.35, sm: 0.5 } },
      "& .MuiMenuItem-root": {
        fontSize: { xs: "0.8125rem", sm: "calc(0.9rem - 2px)" },
        py: { xs: 0.45, sm: 0.75 },
        px: { xs: 1.1, sm: 1.5 },
        borderRadius: 1,
        mx: { xs: 0.35, sm: 0.5 },
        minHeight: { xs: 40, sm: 48 },
        fontFamily: "Poppins",
        color: "#444",
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
};

/** حجم السهم والنص داخل حقل الـ Select يتماشى مع breakpoints مثل باقي الحقول */
const selectTriggerSx = {
  fontFamily: "Poppins",
  "& .MuiSelect-select": {
    fontSize: { xs: "0.8125rem", sm: "calc(1rem - 2px)" },
    py: { xs: 0.5, sm: 0.625 },
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-icon": {
    fontSize: { xs: "1.2rem", sm: "1.35rem" },
    color: "#9CA3AF",
    right: { xs: 4, sm: 8 },
  },
};
const COMPANY_SIZES = ["1–10 employees", "10–50 employees", "50–200 employees", "200–500 employees", "500+ employees"];
const INDUSTRIES    = ["Technology", "Finance", "Healthcare", "Education", "Other"];

type FormValues = {
  name: string; email: string; industry: string; size: string;
  location: string; website: string; linkedin: string;
};

interface Props { onStepChange?: (step: 1 | 2) => void; onEmailChange?: (email: string) => void; }

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
    } catch (err: any) {
      showToast({ message: err || "Failed to send verification code. Please try again.", severity: "error" });
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
      {/* STEP 1 – Info Form */}
      {step === 1 && (
        <Box
          component="form"
          onSubmit={handleSubmit(handleSendCode)}
          sx={{
            mb: { xs: 0.25, sm: 1.625 },
            textAlign: "left",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            rowGap: { xs: 2.25, sm: 2.125, md: 2.625 },
            columnGap: { xs: 1.5, sm: 2, md: 2.625 },
          }}
        >

          <Box sx={half}>
            <TextField margin="none"
              label={t("company_form.company_name")} placeholder="Acme Corp" fullWidth disabled={loading}
              error={!!errors.name} helperText={errors.name?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("name", { required: t("company_form.validation.company_name_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField margin="none"
              label={t("company_form.work_email")} placeholder="contact@company.com" fullWidth type="email" disabled={loading}
              error={!!errors.email} helperText={errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("email", {
                required: t("company_form.validation.email_required"),
                pattern: { value: /^\S+@\S+\.\S+$/, message: t("company_form.validation.email_invalid") },
              })}
            />
          </Box>

          <Box sx={half}>
            <Controller
              name="industry" control={control}
              rules={{ required: t("company_form.validation.industry_required") }}
              render={({ field }) => (
                <TextField margin="none"
                  {...field} label={t("company_form.industry")} fullWidth select disabled={loading}
                  error={!!errors.industry} helperText={errors.industry?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
                  SelectProps={{
                    sx: selectTriggerSx,
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                    renderValue: (value: unknown) =>
                      value ? (value as React.ReactNode) : (
                        <span style={{ color: "#C4CAD4", fontFamily: "Poppins", fontSize: "clamp(0.72rem, 3vw, 0.82rem)" }}>
                          {t("company_form.select_industry")}
                        </span>
                      ),
                  }}
                  sx={fieldSx}
                >
                  {INDUSTRIES.map((ind) => <MenuItem key={ind} value={ind}>{ind}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>
          <Box sx={half}>
            <Controller
              name="size" control={control}
              rules={{ required: t("company_form.validation.size_required") }}
              render={({ field }) => (
                <TextField margin="none"
                  {...field} label={t("company_form.company_size")} fullWidth select disabled={loading}
                  error={!!errors.size} helperText={errors.size?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PeopleIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
                  SelectProps={{
                    sx: selectTriggerSx,
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                    renderValue: (value: unknown) =>
                      value ? (value as React.ReactNode) : (
                        <span style={{ color: "#C4CAD4", fontFamily: "Poppins", fontSize: "clamp(0.72rem, 3vw, 0.82rem)" }}>
                          {t("company_form.select_size")}
                        </span>
                      ),
                  }}
                  sx={fieldSx}
                >
                  {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>

          <Box sx={half}>
            <TextField margin="none"
              label={t("company_form.location")} placeholder="e.g. Paris, France" fullWidth disabled={loading}
              error={!!errors.location} helperText={errors.location?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("location", { required: t("company_form.validation.location_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField margin="none"
              label={t("company_form.website")} placeholder="https://yourcompany.com" fullWidth disabled={loading}
              error={!!errors.website} helperText={errors.website?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
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
            <TextField margin="none"
              label={t("company_form.linkedin")} placeholder="https://linkedin.com/company/..." fullWidth disabled={loading}
              error={!!errors.linkedin} helperText={errors.linkedin?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: "#9CA3AF" }} /></InputAdornment> }}
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
              type="submit" fullWidth variant="contained" disabled={loading}
              endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
              startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
              sx={submitBtnSx}
            >
              {loading ? t("company_form.btn_sending") : t("company_form.btn_continue")}
            </Button>
          </Box>
        </Box>
      )}

      {/* STEP 2 – OTP */}
      {step === 2 && (
        <Box sx={{ mb: { xs: 0.5, sm: 1.625 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.125 }, bgcolor: `${ACCENT}0A`, border: `1px solid ${ACCENT}22`, borderRadius: { xs: "10px", sm: "12px" }, px: { xs: 1.25, sm: 1.625 }, py: { xs: 1, sm: 1.125 }, mb: { xs: 1.25, sm: 2.625 } }}>
            <EmailIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: ACCENT, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.78rem" }, color: "#6B7280", fontFamily: "Poppins" }}>
                {t("company_form.code_sent_to")}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.78rem", sm: "0.88rem" }, color: "#0F172A", fontFamily: "Poppins", fontWeight: 700 }}>
                {savedEmail}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={{ xs: 1, sm: 1.125 }} justifyContent="center" flexWrap="nowrap">
            {otpCode.map((digit, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: 38, sm: 55 },
                  height: { xs: 46, sm: 65 },
                  borderRadius: { xs: "11px", sm: "13px" },
                  border: `1.5px solid ${digit ? ACCENT : "#D1FAF5"}`,
                  bgcolor: digit ? `${ACCENT}0C` : "#F8FFFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  "&:focus-within": { borderColor: ACCENT, bgcolor: "#fff", boxShadow: `0 0 0 3px ${ACCENT}18` },
                }}
              >
                <Box
                  component="input"
                  ref={(el: unknown) => { codeInputsRef.current[index] = el as HTMLInputElement | null; }}
                  value={digit} maxLength={1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? (handleOtpPaste as any) : undefined}
                  sx={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: { xs: "1.2rem", sm: "calc(1.6rem - 2px)" }, fontWeight: 700, color: "#0F172A", fontFamily: "Poppins", cursor: "text" }}
                />
              </Box>
            ))}
          </Stack>

          {(isExpired || isRunning) && (
            <Box sx={{ textAlign: "center", mt: { xs: 1, sm: 1.125 } }}>
              <Typography sx={{ fontSize: "0.8rem", fontFamily: "Poppins", fontWeight: 500, color: secondsLeft > 60 ? "#9CA3AF" : secondsLeft > 0 ? "#F59E0B" : "#EF4444", transition: "color 0.3s" }}>
                {secondsLeft > 0
                  ? t("company_form.code_expires", { time: formatTimeLeft(secondsLeft) })
                  : t("company_form.code_expired")}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth variant="contained"
            onClick={isExpired ? () => handleSendCode(getValues()) : handleVerifyAndRegister}
            disabled={loading || (!isExpired && otpCode.join("").length < CODE_LENGTH)}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
            sx={{ ...submitBtnSx, mt: { xs: 1.75, sm: 2.625 } }}
          >
            {loading
              ? isExpired ? t("company_form.btn_resending") : t("company_form.btn_creating")
              : isExpired ? t("company_form.btn_resend")    : t("company_form.btn_verify")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CompanyRegisterForm;
