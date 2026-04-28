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
import { useTranslation } from "react-i18next";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "company_reg_code_expires_at";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const fieldSx = {
  "& .MuiInputLabel-root": { color: "#6B7280", fontFamily: "Poppins", fontSize: "0.95rem", fontWeight: 500 },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
  "& .MuiInputBase-input": { fontSize: "1rem", fontFamily: "Poppins" },
  "& .MuiInputBase-input::placeholder": { fontSize: "0.82rem", opacity: 1, color: "#C4CAD4" },
  "& .MuiFormHelperText-root": { fontSize: "0.75rem" },
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    fontSize: "1rem",
    fontFamily: "Poppins",
    bgcolor: "#F9FAFB",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&:hover": { bgcolor: "#F3F4F6" },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
  },
};

const half = { flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" }, minWidth: 0 };
const full = { flex: "1 1 100%" };

const selectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.5, borderRadius: 2, boxShadow: "0px 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
      "& .MuiList-root": { py: 0.5 },
      "& .MuiMenuItem-root": {
        fontSize: "0.9rem", py: 0.75, px: 1.5, borderRadius: 1, mx: 0.5, color: "#444", fontFamily: "Poppins", transition: "background 0.15s",
        "&:hover": { background: `rgba(13,148,136,0.08)`, color: "#222" },
        "&.Mui-selected": { background: `rgba(13,148,136,0.12)`, color: ACCENT, fontWeight: 600, "&:hover": { background: `rgba(13,148,136,0.18)` } },
      },
    },
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
  textTransform: "none", fontFamily: "Poppins", fontWeight: 700, borderRadius: "14px", height: 56,
  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`, color: "#fff",
  boxShadow: `0 4px 20px ${ACCENT}50`, letterSpacing: "0.01em", fontSize: "1rem", transition: "all 0.2s",
  "&:hover": { background: `linear-gradient(135deg, #0caa9d 0%, ${ACCENT2} 100%)`, boxShadow: `0 8px 28px ${ACCENT}60`, transform: "translateY(-1px)" },
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
        <Box component="form" onSubmit={handleSubmit(handleSendCode)} sx={{ mb: 2, textAlign: "left", display: "flex", flexWrap: "wrap", gap: 3 }}>

          <Box sx={half}>
            <TextField
              label={t("company_form.company_name")} placeholder="Acme Corp" fullWidth disabled={loading}
              error={!!errors.name} helperText={errors.name?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("name", { required: t("company_form.validation.company_name_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label={t("company_form.work_email")} placeholder="contact@company.com" fullWidth type="email" disabled={loading}
              error={!!errors.email} helperText={errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
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
                <TextField
                  {...field} label={t("company_form.industry")} fullWidth select disabled={loading}
                  error={!!errors.industry} helperText={errors.industry?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
                  SelectProps={{
                    MenuProps: selectMenuProps, displayEmpty: true,
                    renderValue: (value: any) =>
                      value ? value : <span style={{ color: "#C4CAD4", fontSize: "0.82rem", fontFamily: "Poppins" }}>{t("company_form.select_industry")}</span>,
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
                <TextField
                  {...field} label={t("company_form.company_size")} fullWidth select disabled={loading}
                  error={!!errors.size} helperText={errors.size?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PeopleIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
                  SelectProps={{
                    MenuProps: selectMenuProps, displayEmpty: true,
                    renderValue: (value: any) =>
                      value ? value : <span style={{ color: "#C4CAD4", fontSize: "0.82rem", fontFamily: "Poppins" }}>{t("company_form.select_size")}</span>,
                  }}
                  sx={fieldSx}
                >
                  {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )}
            />
          </Box>

          <Box sx={half}>
            <TextField
              label={t("company_form.location")} placeholder="e.g. Paris, France" fullWidth disabled={loading}
              error={!!errors.location} helperText={errors.location?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
              sx={fieldSx}
              {...register("location", { required: t("company_form.validation.location_required") })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label={t("company_form.website")} placeholder="https://yourcompany.com" fullWidth disabled={loading}
              error={!!errors.website} helperText={errors.website?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
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
              label={t("company_form.linkedin")} placeholder="https://linkedin.com/company/..." fullWidth disabled={loading}
              error={!!errors.linkedin} helperText={errors.linkedin?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ fontSize: 20, color: "#9CA3AF" }} /></InputAdornment> }}
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
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: `${ACCENT}0A`, border: `1px solid ${ACCENT}22`, borderRadius: "12px", px: 2, py: 1.5, mb: 3 }}>
            <EmailIcon sx={{ fontSize: 18, color: ACCENT, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", fontFamily: "Poppins" }}>
                {t("company_form.code_sent_to")}
              </Typography>
              <Typography sx={{ fontSize: "0.88rem", color: "#0F172A", fontFamily: "Poppins", fontWeight: 700 }}>
                {savedEmail}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="center">
            {otpCode.map((digit, index) => (
              <Box
                key={index}
                sx={{ width: 58, height: 68, borderRadius: "14px", border: `1.5px solid ${digit ? ACCENT : "#D1FAF5"}`, bgcolor: digit ? `${ACCENT}0C` : "#F8FFFE", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", "&:focus-within": { borderColor: ACCENT, bgcolor: "#fff", boxShadow: `0 0 0 4px ${ACCENT}18` } }}
              >
                <Box
                  component="input"
                  ref={(el: unknown) => { codeInputsRef.current[index] = el as HTMLInputElement | null; }}
                  value={digit} maxLength={1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? (handleOtpPaste as any) : undefined}
                  sx={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: "1.6rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins", cursor: "text" }}
                />
              </Box>
            ))}
          </Stack>

          {(isExpired || isRunning) && (
            <Box sx={{ textAlign: "center", mt: 1.5 }}>
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
            sx={{ ...submitBtnSx, mt: 3 }}
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
