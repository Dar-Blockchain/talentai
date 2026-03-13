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
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registerUser, verifyOTP } from "@/store/slices/authSlice";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { formatTimeLeft } from "@/utils/functions";
import { isInvitationUrl } from "@/utils/memberInvitation";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "candidate_reg_code_expires_at";

const themeColors = {
  primary: "rgba(131, 16, 255, 0.83)",
  primaryHover: "rgba(131, 16, 255, 0.73)",
  primaryLight: "rgba(131, 16, 255, 0.93)",
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

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

interface Props {
  onStepChange?: (step: 1 | 2) => void;
}

const CandidateRegisterForm: React.FC<Props> = ({ onStepChange }) => {
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
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState(false);
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
    if (invitationEmail) {
      setValue("email", invitationEmail);
    }
  }, [invitationEmail]);

  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

  const handleSendCode = async (values: FormValues) => {
    if (!isJoinTeam && !cvFile) {
      setCvError(true);
      return;
    }
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
      const response = await dispatch(
        verifyOTP({ email: savedEmail, otp: code, location })
      ).unwrap();

      if (!response.token) {
        showToast({ message: "Verification failed. Please try again.", severity: "error" });
        setLoading(false);
        return;
      }

      router.replace(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard/candidate");
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
          {/* Row 1: First Name | Last Name */}
          <Box sx={half}>
            <TextField
              label="First Name"
              placeholder="John"
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("firstName", { required: "First name is required" })}
            />
          </Box>
          <Box sx={half}>
            <TextField
              label="Last Name"
              placeholder="Doe"
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("lastName", { required: "Last name is required" })}
            />
          </Box>

          {/* Row 2: Email | Phone */}
          <Box sx={half}>
            <TextField
              label="Email Address"
              placeholder="john@example.com"
              fullWidth
              size="small"
              type="email"
              disabled={loading || !!invitationEmail}
              error={!!errors.email}
              helperText={
                invitationEmail
                  ? "Email pre-filled from your invitation"
                  : errors.email?.message
              }
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
          <Box sx={half}>
            <TextField
              label="Phone Number"
              placeholder="+1 234 567 890"
              fullWidth
              size="small"
              disabled={loading}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              InputProps={{
                startAdornment: (
                  <PhoneIcon sx={{ mr: 1, color: "rgba(0,0,0,0.4)", fontSize: 18 }} />
                ),
              }}
              sx={fieldSx}
              {...register("phone", { required: "Phone number is required" })}
            />
          </Box>

          {/* Row 3: CV Upload (full width) */}
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
                sx={{
                  border: "1px dashed",
                  borderColor: cvError
                    ? "error.main"
                    : cvFile
                    ? themeColors.primary
                    : "rgb(203 203 203)",
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  transition: "all 0.2s",
                  background: cvFile ? "rgba(131,16,255,0.04)" : "transparent",
                  "&:hover": {
                    borderColor: themeColors.primary,
                    background: "rgba(131,16,255,0.04)",
                  },
                }}
              >
                {cvFile ? (
                  <CheckCircleOutlineIcon sx={{ color: themeColors.primary, fontSize: 20 }} />
                ) : (
                  <UploadFileIcon
                    sx={{ color: "rgba(0,0,0,0.4)", fontSize: 20 }}
                  />
                )}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: cvFile ? themeColors.primary : "#444",
                      fontWeight: cvFile ? 500 : 400,
                      lineHeight: 1.4,
                    }}
                  >
                    {cvFile ? cvFile.name : "Upload your CV"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: cvError ? "error.main" : "#999" }}>
                    {cvError ? "CV is required" : "PDF, DOC or DOCX"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Submit */}
          <Box sx={full}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={() => { if (!isJoinTeam && !cvFile) setCvError(true); }}
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

      {/* AI CV Analysis Modal */}
      <Dialog
        open={analyzingCv}
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 4,
            py: 3,
            textAlign: "center",
            minWidth: 300,
            background: "#fff",
          },
        }}
      >
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, p: 0 }}>
          <CircularProgress size={48} sx={{ color: themeColors.primary }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#1a1a1a" }}>
            Analyzing your CV
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.7, maxWidth: 260 }}>
            Our AI is extracting your skills and experience. This may take a few seconds — please don&apos;t close this page.
          </Typography>
        </DialogContent>
      </Dialog>

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

export default CandidateRegisterForm;
