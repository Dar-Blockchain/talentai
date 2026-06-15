import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { isInvitationUrl } from "@/utils/memberInvitation";
import { useOtpFlow, useCvProgress, useLoadingWithNavigation } from "@/modules/auth/shared/hooks";
import { extractInvitationEmail, refreshAbort } from "@/modules/auth/shared/utils";
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
  const { loading: navigationLoading, withLoading } = useLoadingWithNavigation();

  const [step,       setStep]       = useState<RegisterStep>(1);
  const [savedEmail, setSavedEmail] = useState("");
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvFile,      setCvFile]      = useState<File | null>(null);
  const [cvError,     setCvError]     = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);

  // Form lives here so the hook owns all candidate register state
  const form = useForm<CandidateFormValues>({ mode: "onTouched" });
  useEffect(() => { if (invitationEmail) form.setValue("email", invitationEmail); }, [invitationEmail]);

  const cvProgress       = useCvProgress(analyzingCv);
  const registerMutation = useRegisterMutation();
  const verifyMutation   = useVerifyRegisterOtp((_data) => {
    router.replace(returnUrl ? decodeURIComponent(returnUrl) : "/candidate/dashboard");
  });
  const resendMutation = useResendRegisterOtp();

  const { timer, otp, verifyCode: originalVerifyCode, resendCode, abort, cleanup, verifyLoading, resendLoading } = useOtpFlow({
    storageKey:    CANDIDATE_EXPIRY_KEY,
    verifyMutation,
    resendMutation,
  });

  // Wrap verifyCode to show loading during navigation
  const verifyCode = async (emailArg: string) => {
    await withLoading(async () => {
      await originalVerifyCode(emailArg);
    });
  };

  const loading = registerMutation.isPending || verifyLoading || navigationLoading;

  useEffect(() => () => { abort(); abortRef.current?.abort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendCode = async (values: CandidateFormValues) => {
    if (!isJoinTeam && !cvFile) { setCvError(true); return; }
    if (!isJoinTeam && cvFile) setAnalyzingCv(true);

    const signal = refreshAbort(abortRef);
    try {
      const fd = new FormData();
      fd.append("roleType",  "Candidate");
      fd.append("firstName", values.firstName);
      fd.append("lastName",  values.lastName);
      fd.append("email",     values.email.toLowerCase().trim());
      fd.append("language",  currentLang);
      if (!isJoinTeam) {
        fd.append("phone", values.phone);
        if (cvFile) fd.append("resume", cvFile);
      }

      await registerMutation.mutateAsync({ payload: fd, signal });

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

  return {
    // form
    form,
    // step
    step, loading, resendLoading,
    // cv
    analyzingCv, cvProgress,
    cvFile, setCvFile, cvError, setCvError,
    isDragging, setIsDragging, fileInputRef,
    // auth
    savedEmail, otp, timer,
    isJoinTeam, returnUrl, invitationEmail,
    // actions
    sendCode,
    verifyCode: () => verifyCode(savedEmail),
    resendCode: () => resendCode(savedEmail),
  };
}
