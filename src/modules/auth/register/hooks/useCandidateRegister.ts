import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { isInvitationUrl } from "@/utils/memberInvitation";
import { getUserLocation } from "@/utils/api";
import { useOtpTimer, useOtpInput } from "@/modules/auth/shared/hooks";
import { extractInvitationEmail, refreshAbort } from "@/modules/auth/shared/utils";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useRegisterMutation, useVerifyRegisterOtp, useResendRegisterOtp } from "../queries";
import { CANDIDATE_EXPIRY_KEY } from "../utils";
import type { CandidateFormValues, RegisterFormProps, RegisterStep } from "../types";
import { useLanguage } from "@/hooks/useLanguage";

export function useCandidateRegister({ onStepChange, onEmailChange }: RegisterFormProps) {
  const router          = useRouter();
  const { showToast }   = useToast();
  const { currentLang } = useLanguage();
  const returnUrl       = router.query.returnUrl as string | undefined;
  const isJoinTeam      = isInvitationUrl(returnUrl);
  const invitationEmail = extractInvitationEmail(returnUrl);

  const [step,        setStep]        = useState<RegisterStep>(1);
  const [savedEmail,  setSavedEmail]  = useState("");
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvProgress,  setCvProgress]  = useState(0);
  const [cvFile,      setCvFile]      = useState<File | null>(null);
  const [cvError,     setCvError]     = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const timer        = useOtpTimer(CANDIDATE_EXPIRY_KEY);
  const otp          = useOtpInput();

  const registerMutation = useRegisterMutation();
  const verifyMutation   = useVerifyRegisterOtp((_data) => {
    router.replace(returnUrl ? decodeURIComponent(returnUrl) : "/candidate/dashboard");
  });
  const resendMutation = useResendRegisterOtp();

  const loading       = registerMutation.isPending || verifyMutation.isPending;
  const resendLoading = resendMutation.isPending;

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  // CV analysis progress animation — runs while analyzingCv is true, caps at 90%
  useEffect(() => {
    if (!analyzingCv) { setCvProgress(0); return; }
    const id = setInterval(() => {
      setCvProgress((p) => {
        if (p >= 90) { clearInterval(id); return 90; }
        return p + (p < 60 ? 4 : 1);
      });
    }, 300);
    return () => clearInterval(id);
  }, [analyzingCv]);

  const sendCode = async (values: CandidateFormValues) => {
    if (!isJoinTeam && !cvFile) { setCvError(true); return; }
    if (!isJoinTeam && cvFile) setAnalyzingCv(true);

    const signal = refreshAbort(abortRef);
    try {
      const formData = new FormData();
      formData.append("roleType",  "Candidate");
      formData.append("firstName", values.firstName);
      formData.append("lastName",  values.lastName);
      formData.append("email",     values.email.toLowerCase().trim());
      formData.append("language",  currentLang);
      if (!isJoinTeam) {
        formData.append("phone", values.phone);
        if (cvFile) formData.append("resume", cvFile);
      }

      await registerMutation.mutateAsync({ payload: formData, signal });

      const email = values.email.toLowerCase().trim();
      setSavedEmail(email);
      onEmailChange?.(email);
      timer.start();
      setStep(2);
      onStepChange?.(2);
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Failed to send verification code.", severity: "error" });
    } finally {
      setAnalyzingCv(false);
    }
  };

  const verifyCode = async () => {
    const code = otp.otpCode.join("");
    if (code.length < OTP_CODE_LENGTH) return;

    const signal = refreshAbort(abortRef);
    try {
      timer.clear();
      const location = await getUserLocation();
      await verifyMutation.mutateAsync({ email: savedEmail, otp: code, location, signal });
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Invalid code. Please try again.", severity: "error" });
    }
  };

  const resendCode = async () => {
    const signal = refreshAbort(abortRef);
    try {
      await resendMutation.mutateAsync({ email: savedEmail, lang: currentLang, signal });
      timer.clear();
      timer.start();
      otp.reset();
      showToast({ message: "A new verification code has been sent to your email.", severity: "success" });
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Failed to resend code.", severity: "error" });
    }
  };

  return {
    step, loading, resendLoading,
    analyzingCv, cvProgress,
    cvFile, setCvFile, cvError, setCvError,
    isDragging, setIsDragging,
    savedEmail, otp, fileInputRef,
    isJoinTeam, returnUrl, invitationEmail, timer,
    sendCode, verifyCode, resendCode,
  };
}
