import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { isInvitationUrl } from "@/utils/memberInvitation";
import { useCvProgress } from "@/modules/auth/shared/hooks";
import { extractInvitationEmail, refreshAbort } from "@/modules/auth/shared/utils";
import { OTP_TTL } from "@/modules/auth/shared/types";
import { useRegisterMutation } from "../queries";
import { CANDIDATE_EXPIRY_KEY } from "../utils";
import type { CandidateFormValues, RegisterFormProps } from "../types";
import { useLanguage } from "@/hooks/useLanguage";

export function useCandidateRegister({ onOtpReady }: RegisterFormProps) {
  const router          = useRouter();
  const { showToast }   = useToast();
  const { currentLang } = useLanguage();
  const returnUrl       = router.query.returnUrl as string | undefined;
  const isJoinTeam      = isInvitationUrl(returnUrl);
  const invitationEmail = extractInvitationEmail(returnUrl);

  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvFile,      setCvFile]      = useState<File | null>(null);
  const [cvError,     setCvError]     = useState(false);
  const [isDragging,  setIsDragging]  = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);

  const form = useForm<CandidateFormValues>({ mode: "onTouched" });
  useEffect(() => { if (invitationEmail) form.setValue("email", invitationEmail); }, [invitationEmail]);

  const cvProgress       = useCvProgress(analyzingCv);
  const registerMutation = useRegisterMutation();

  const loading = registerMutation.isPending;

  useEffect(() => () => { abortRef.current?.abort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      localStorage.setItem(CANDIDATE_EXPIRY_KEY, (Date.now() + OTP_TTL * 1000).toString());
      // Close the dialog before transitioning — onOtpReady unmounts this component
      // so any state update after it would be a no-op or cause a React warning.
      setAnalyzingCv(false);
      onOtpReady?.(email);
    } catch (err: any) {
      setAnalyzingCv(false);
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Failed to send verification code.", severity: "error" });
    }
  };

  return {
    form,
    loading,
    analyzingCv, cvProgress,
    cvFile, setCvFile, cvError, setCvError,
    isDragging, setIsDragging, fileInputRef,
    isJoinTeam, returnUrl, invitationEmail,
    sendCode,
  };
}
