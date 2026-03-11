import React, { useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registerUser, verifyOTP } from "@/store/slices/authSlice";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { formatTimeLeft } from "@/utils/functions";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "company_reg_code_expires_at";

const themeColors = {
  primary: "rgba(41, 210, 145, 0.83)",
  primaryHover: "rgba(41, 210, 145, 0.73)",
  primaryLight: "rgba(41, 210, 145, 0.93)",
};

const fieldSx = {
  "& .MuiInputLabel-root": { color: "#666", fontSize: "0.8rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#666" },
  "& .MuiInputBase-input": { fontSize: "0.8rem" },
  "& .MuiFormHelperText-root": { fontSize: "0.7rem" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgb(203 203 203)" },
    "&:hover fieldset": { borderColor: "rgb(203 203 203)" },
    "&.Mui-focused fieldset": { borderColor: "rgb(203 203 203)" },
  },
};

const half = { flex: "1 1 calc(50% - 8px)", minWidth: 0 };
const full = { flex: "1 1 100%" };

const selectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.5,
      borderRadius: 2,
      boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      "& .MuiList-root": { py: 0.5 },
      "& .MuiMenuItem-root": {
        fontSize: "0.78rem",
        py: 0.75,
        px: 1.5,
        borderRadius: 1,
        mx: 0.5,
        color: "#444",
        transition: "background 0.15s",
        "&:hover": { background: "rgba(41,210,145,0.08)", color: "#222" },
        "&.Mui-selected": {
          background: "rgba(41,210,145,0.12)",
          color: "rgba(41,210,145,0.9)",
          fontWeight: 600,
          "&:hover": { background: "rgba(41,210,145,0.18)" },
        },
      },
    },
  },
};

const COMPANY_SIZES = [
  "1–10 employees",
  "10–50 employees",
  "50–200 employees",
  "200–500 employees",
  "500+ employees",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Other",
];

type FormValues = {
  name: string;
  email: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  linkedin: string;
};

interface Props {
  onStepChange?: (step: 1 | 2) => void;
}

const CompanyRegisterForm: React.FC<Props> = ({ onStepChange }) => {
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

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
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
        companyDetails: {
          industry: values.industry,
          size: values.size,
          location: values.location,
          website: values.website,
          linkedin: values.linkedin,
        },
      };
      await dispatch(registerUser(payload)).unwrap();
      setSavedEmail(values.email.toLowerCase().trim());
      startTimer();
      setStep(2);
      onStepChange?.(2);
    } catch (err: any) {
      showToast({
        message: err || "Failed to send verification code. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    const code = otpCode.join("");
    if (code.length < CODE_LENGTH) return;
    setLoading(true);
    try {
      clearTimer();
      const location = await getUserLocation();
      const response = await dispatch(
        verifyOTP({ email: savedEmail, otp: code, location })
      ).unwrap();

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
    if (digit && index < CODE_LENGTH - 1) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
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
          sx={{ mb: 2, textAlign: "left", display: "flex", flexWrap: "wrap", gap: 2 }}
        >
          {/* Row 1: Company Name | Work Email */}
          <Box sx={half}>
            <TextField
              label="Company Name"
              placeholder="Acme Corp"
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <BusinessIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("name", { required: "Company name is required" })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label="Work Email"
              placeholder="contact@company.com"
              fullWidth
              size="small"
              type="email"
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
            />
          </Box>

          {/* Row 2: Industry | Size */}
          <Box sx={half}>
            <Controller
              name="industry"
              control={control}
              rules={{ required: "Industry is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Industry"
                  fullWidth
                  size="small"
                  select
                  disabled={loading}
                  error={!!errors.industry}
                  helperText={errors.industry?.message}
                  InputProps={{
                    startAdornment: (
                      <CategoryIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                    ),
                  }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                    renderValue: (value: any) =>
                      value ? value : <span style={{ color: "#aaa", fontSize: "0.8rem" }}>Select industry</span>,
                  }}
                  sx={fieldSx}
                >
                  {INDUSTRIES.map((ind) => (
                    <MenuItem key={ind} value={ind}>
                      {ind}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
          <Box sx={half}>
            <Controller
              name="size"
              control={control}
              rules={{ required: "Company size is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Size"
                  fullWidth
                  size="small"
                  select
                  disabled={loading}
                  error={!!errors.size}
                  helperText={errors.size?.message}
                  InputProps={{
                    startAdornment: (
                      <PeopleIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                    ),
                  }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                    renderValue: (value: any) =>
                      value ? value : <span style={{ color: "#aaa", fontSize: "0.8rem" }}>Select company size</span>,
                  }}
                  sx={fieldSx}
                >
                  {COMPANY_SIZES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>

          {/* Row 3: Location | Website */}
          <Box sx={half}>
            <TextField
              label="Location"
              placeholder="e.g. Paris, France"
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.location}
              helperText={errors.location?.message}
              InputProps={{
                startAdornment: (
                  <LocationOnIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("location", { required: "Location is required" })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label="Company Website"
              placeholder="https://yourcompany.com"
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.website}
              helperText={errors.website?.message}
              InputProps={{
                startAdornment: (
                  <LanguageIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("website", {
                validate: (value) => {
                  if (!value) return true;
                  try {
                    const url = new URL(value);
                    if (!["http:", "https:"].includes(url.protocol)) return "URL must start with http:// or https://";
                    if (!url.hostname.includes(".")) return "Enter a valid domain (e.g. https://yourcompany.com)";
                    return true;
                  } catch {
                    return "Enter a valid URL (e.g. https://yourcompany.com)";
                  }
                },
              })}
            />
          </Box>

          {/* Row 4: LinkedIn (full width) */}
          <Box sx={full}>
            <TextField
              label="LinkedIn Page"
              placeholder="https://linkedin.com/company/..."
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.linkedin}
              helperText={errors.linkedin?.message}
              InputProps={{
                startAdornment: (
                  <LinkedInIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("linkedin", {
                validate: (value) => {
                  if (!value) return true;
                  try {
                    const url = new URL(value);
                    if (!["http:", "https:"].includes(url.protocol)) return "URL must start with https://";
                    if (!url.hostname.replace("www.", "").startsWith("linkedin.com")) return "Must be a LinkedIn URL (linkedin.com)";
                    if (!url.pathname.startsWith("/company/")) return "Must be a company page (linkedin.com/company/...)";
                    return true;
                  } catch {
                    return "Enter a valid LinkedIn URL (e.g. https://linkedin.com/company/...)";
                  }
                },
              })}
            />
          </Box>

          {/* Submit */}
          <Box sx={full}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : undefined
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "38px",
                height: 44,
                background: themeColors.primary,
                color: "#fff",
                letterSpacing: 0.3,
                "&:hover": { background: themeColors.primaryLight },
                "&.Mui-disabled": {
                  background: "rgba(0,0,0,0.12)",
                  color: "rgba(0,0,0,0.26)",
                },
              }}
            >
              {loading ? "Sending code..." : "Continue"}
            </Button>
          </Box>
        </Box>
      )}

      {/* STEP 2 – OTP */}
      {step === 2 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: "#555", mb: 2.5, textAlign: "center", lineHeight: 1.6 }}
          >
            Enter the 6-digit code sent to{" "}
            <Typography component="span" fontWeight={600} variant="body2">
              {savedEmail}
            </Typography>
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center">
            {otpCode.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (codeInputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: "center", fontSize: "1.25rem" },
                }}
                sx={{ width: 48, ...fieldSx }}
              />
            ))}
          </Stack>

          {(isExpired || isRunning) && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                mt: 1.5,
                fontWeight: 500,
                color:
                  secondsLeft > 10
                    ? "text.secondary"
                    : secondsLeft > 0
                    ? "warning.main"
                    : "error.main",
                transition: "color 0.3s ease",
              }}
            >
              {secondsLeft > 0
                ? `Code expires in ${formatTimeLeft(secondsLeft)}`
                : "Verification code has expired"}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={
              isExpired
                ? () => handleSendCode(getValues())
                : handleVerifyAndRegister
            }
            disabled={loading || (!isExpired && otpCode.join("").length < CODE_LENGTH)}
            startIcon={
              loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : undefined
            }
            sx={{
              mt: 3,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "38px",
              height: 44,
              background: themeColors.primary,
              color: "#fff",
              letterSpacing: 0.3,
              "&:hover": { background: themeColors.primaryLight },
              "&.Mui-disabled": {
                background: "rgba(0,0,0,0.12)",
                color: "rgba(0,0,0,0.26)",
              },
            }}
          >
            {loading
              ? isExpired
                ? "Resending..."
                : "Creating account..."
              : isExpired
              ? "Resend Code"
              : "Verify & Create Account"}
          </Button>

          {/* <Button
            variant="text"
            fullWidth
            onClick={() => {
              clearTimer();
              setStep(1);
              setOtpCode(Array(CODE_LENGTH).fill(""));
              onStepChange?.(1);
            }}
            sx={{
              mt: 1.5,
              color: themeColors.primary,
              textTransform: "none",
              borderRadius: "38px",
              fontWeight: 500,
              background: "rgba(0,0,0,0.05)",
              ":hover": { transform: "scale(1.02)" },
              ":active": { transform: "scale(0.98)" },
            }}
          >
            Back & Edit Details
          </Button> */}
        </Box>
      )}
    </Box>
  );
};

export default CompanyRegisterForm;
