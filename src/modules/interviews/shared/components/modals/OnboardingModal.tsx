import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  X,
  CloudUpload,
  CheckCircle2,
  Mail,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Phone,
  Link as LinkIcon,
  User,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { AppDispatch } from "@/store/store";
import { setConnectedUser } from "@/store/slices/userSlice";
import { authApi } from "@/modules/auth/shared/api";
import { useAuthContext } from "@/modules/auth/shared/context/AuthContext";
import { saveToken } from "@/modules/auth/shared/utils/token";
import { checkEligibility } from "../../../post-interview/api/eligibility.api";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from '@/utils/geoLocation';
import { formatTimeLeft } from "@/utils/functions";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Progress } from "@/modules/shared/ui/shadcn/progress";
import { Dialog, DialogContent, DialogTitle } from "@/modules/shared/ui/shadcn/dialog";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import { validateEmail } from "@/lib/validation/email";

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = "job_apply_code_expires_at";

// email   = sign-in step (existing candidate)
// register = new user registration form (with email field)
// otp      = OTP verification (used by both paths)
type Step = "email" | "register" | "otp";

function isValidEmail(v: string) {
  return validateEmail(v) === true;
}

export interface OnboardingModalProps {
  open: boolean;
  jobTitle: string;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  open,
  jobTitle,
  onClose,
}) => {
  const { t } = useTranslation("modules/interview/apply");
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { login } = useAuthContext();
  const router = useRouter();
  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  // ─── shared state ─────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [roleError, setRoleError] = useState("");

  // ─── sign-in step ─────────────────────────────────────────────────────────
  const [signinEmail, setSigninEmail] = useState("");
  const [signinEmailError, setSigninEmailError] = useState("");

  // ─── register step ────────────────────────────────────────────────────────
  const [reg, setReg] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    linkedin: "",
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── CV analysis ──────────────────────────────────────────────────────────
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);

  useEffect(() => {
    if (!analyzingCv) {
      setCvProgress(0);
      return;
    }
    setCvProgress(0);
    const id = setInterval(() => {
      setCvProgress((p) => (p >= 90 ? 90 : p + (p < 60 ? 4 : 1)));
    }, 300);
    return () => clearInterval(id);
  }, [analyzingCv]);

  // ─── OTP step ─────────────────────────────────────────────────────────────
  // email used during OTP verification (set by whichever path reached the OTP step)
  const [otpEmail, setOtpEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill(""),
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    secondsLeft,
    isExpired,
    start: startTimer,
    clear: clearTimer,
  } = usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

  const otpCode = otpDigits.join("");

  // ─── helpers ──────────────────────────────────────────────────────────────

  const goToOtp = (email: string) => {
    setOtpEmail(email);
    setOtpDigits(Array(CODE_LENGTH).fill(""));
    setApiError("");
    startTimer();
    setStep("otp");
  };

  const resetAll = () => {
    setStep("email");
    setLoading(false);
    setApiError("");
    setRoleError("");
    setSigninEmail("");
    setSigninEmailError("");
    setReg({ email: "", firstName: "", lastName: "", phone: "", linkedin: "" });
    setRegErrors({});
    setCvFile(null);
    setOtpDigits(Array(CODE_LENGTH).fill(""));
    setOtpEmail("");
    clearTimer();
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose();
  };

  // ─── STEP: email (sign in) ────────────────────────────────────────────────

  const handleSignIn = async () => {
    const trimmed = signinEmail.trim().toLowerCase();
    if (!trimmed) {
      setSigninEmailError(t("onboarding.error_required"));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setSigninEmailError(t("onboarding.error_email"));
      return;
    }
    setSigninEmailError("");
    setRoleError("");
    setApiError("");
    setLoading(true);
    try {
      const role = await authApi.checkRole(trimmed);

      if (role === "Company" || role === "Employee" || role === "Member") {
        setRoleError(t("onboarding.company_email_error"));
        setLoading(false);
        return;
      }

      if (role === "Candidate") {
        await authApi.signin(trimmed);
        goToOtp(trimmed);
      } else {
        // not found → nudge them to register
        setApiError(t("onboarding.not_found_hint"));
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : t("onboarding.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP: register ───────────────────────────────────────────────────────

  const updateReg =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setReg((prev) => ({ ...prev, [field]: e.target.value }));
      if (regErrors[field]) setRegErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validateReg = () => {
    const e: Record<string, string> = {};
    if (!reg.email.trim()) e.email = t("onboarding.error_required");
    else if (!isValidEmail(reg.email.trim()))
      e.email = t("onboarding.error_email");
    if (!reg.firstName.trim())
      e.firstName = t("onboarding.error_first_name_required");
    if (!reg.lastName.trim())
      e.lastName = t("onboarding.error_last_name_required");
    if (!reg.phone.trim()) {
      e.phone = t("onboarding.error_phone_required");
    } else if (
      !/^\+?[1-9]\d{6,14}$/.test(reg.phone.trim().replace(/[\s\-().]/g, ""))
    ) {
      e.phone = t("onboarding.error_phone_invalid");
    }
    if (!cvFile) e.cv = t("onboarding.error_cv_required");
    setRegErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setRegErrors((p) => ({ ...p, cv: t("onboarding.error_pdf") }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setRegErrors((p) => ({ ...p, cv: t("onboarding.error_size") }));
      return;
    }
    setCvFile(file);
    setRegErrors((p) => ({ ...p, cv: "" }));
  };

  const handleRegister = async () => {
    if (!validateReg()) return;
    setLoading(true);
    setApiError("");
    const email = reg.email.trim().toLowerCase();
    if (cvFile) setAnalyzingCv(true);
    try {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("firstName", reg.firstName.trim());
      fd.append("lastName", reg.lastName.trim());
      fd.append("phone", reg.phone.trim());
      fd.append("roleType", "Candidate");
      if (cvFile) fd.append("resume", cvFile);
      await authApi.register(fd);
      setAnalyzingCv(false);
      goToOtp(email);
    } catch (e) {
      setAnalyzingCv(false);
      const msg = (e instanceof Error ? e.message : "").toLowerCase();
      if (msg.includes("already exists") || msg.includes("sign in")) {
        // Already verified → sign them in instead
        try {
          await authApi.signin(email);
          goToOtp(email);
        } catch (e2) {
          setApiError(e2 instanceof Error ? e2.message : t("onboarding.error_generic"));
        }
      } else {
        setApiError(e instanceof Error ? e.message : t("onboarding.error_registration"));
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP: OTP ────────────────────────────────────────────────────────────

  const handleOtpChange = (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value.replace(/\D/g, "");
    const next = [...otpDigits];
    next[i] = val[0] ?? "";
    setOtpDigits(next);
    if (val && i < CODE_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    const next = [...otpDigits];
    for (let i = 0; i < CODE_LENGTH; i++) next[i] = paste[i] ?? next[i] ?? "";
    setOtpDigits(next);
    otpRefs.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    if (otpCode.length < CODE_LENGTH) return;
    setLoading(true);
    setApiError("");
    try {
      const location = await getUserLocation();
      const data = await authApi.verifyOtp({
        email: otpEmail,
        otp: otpCode,
        location,
      });
      saveToken(data.user.role);
      dispatch(
        setConnectedUser({
          user: data.user,
          profile: data.profile ?? null,
          planLimits: data.planLimits ?? null,
          companyMembership: data.companyMembership ?? null,
        }),
      );
      login();
      const postId =
        typeof router.query.jobId === "string" ? router.query.jobId : null;
      if (postId) {
        await queryClient.prefetchQuery({
          queryKey: ["eligibility", postId],
          queryFn: () => checkEligibility(postId),
          staleTime: 0,
        });
      }
      if (isMountedRef.current) {
        clearTimer();
        onClose();
      }
    } catch {
      if (isMountedRef.current) {
        setApiError(t("onboarding.error_code"));
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setApiError("");
    setOtpDigits(Array(CODE_LENGTH).fill(""));
    try {
      await authApi.signin(otpEmail);
      startTimer();
    } catch (e) {
      setApiError(e instanceof Error ? e.message : t("onboarding.error_resend"));
    } finally {
      setLoading(false);
    }
  };

  // auto-submit when all digits filled
  useEffect(() => {
    if (
      step === "otp" &&
      otpCode.length === CODE_LENGTH &&
      !loading &&
      !isExpired
    )
      handleVerify();
  }, [otpCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render ───────────────────────────────────────────────────────────────

  const GREEN = "#22c55e";

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-105 rounded-2xl bg-background border border-border shadow-2xl overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Apply for this role</DialogTitle>
          {/* top accent strip */}
          <div className="h-1 w-full bg-linear-to-r from-primary to-primary/60" />

          <div className="px-6 py-4 overflow-y-auto max-h-[90vh]">
            {/* header row */}
            <div className="flex items-center justify-between mb-3">
              {(step === "register" || step === "otp") && !loading ? (
                <button
                  onClick={() => {
                    setStep("email");
                    setApiError("");
                    clearTimer();
                  }}
                  className="flex items-center gap-1.5 text-[0.8rem] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  {t("onboarding.back")}
                </button>
              ) : (
                <span />
              )}
              {!loading && (
                <button
                  onClick={handleClose}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* logo */}
            <div className="flex justify-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic-height-only sizing; avoiding next/image to not change layout behavior */}
              <img
                src="/logo.svg"
                alt="TalentAI"
                style={{ height: 26, objectFit: "contain", cursor: "pointer" }}
                onClick={() => router.push("/")}
              />
            </div>

            {/* job badge — email step only */}
            {step === "email" && (
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/8 text-[0.75rem] font-semibold text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {jobTitle}
                </span>
              </div>
            )}

            {/* title + description — hidden on OTP step (OTP step has its own header) */}
            {step !== "otp" && (
              <div className="text-center mb-4">
                <h2 className="font-sans font-bold text-[1.1rem] text-foreground tracking-tight mb-1">
                  {step === "email"
                    ? t("onboarding.title_email")
                    : t("onboarding.title_form")}
                </h2>
                <p className="font-sans text-[0.8rem] text-muted-foreground leading-relaxed">
                  {step === "email"
                    ? t("onboarding.desc_email")
                    : t("onboarding.desc_form")}
                </p>
              </div>
            )}

            {/* ── STEP: email (sign in) ─────────────────────────────── */}
            {step === "email" && (
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignIn();
                  }}
                  className="space-y-4"
                >
                  {/* email field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                      {t("onboarding.email_label")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        autoFocus
                        placeholder="you@example.com"
                        value={signinEmail}
                        disabled={loading}
                        onChange={(e) => {
                          setSigninEmail(e.target.value);
                          setSigninEmailError("");
                          setRoleError("");
                          setApiError("");
                        }}
                        aria-invalid={!!signinEmailError}
                        className={cn(
                          "pl-9 h-10 text-sm font-sans",
                          signinEmailError &&
                            "border-destructive focus-visible:ring-destructive/30",
                        )}
                      />
                    </div>
                    {signinEmailError && (
                      <p className="text-xs text-destructive font-sans">
                        {signinEmailError}
                      </p>
                    )}
                  </div>

                  {/* company/role error */}
                  {roleError && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 space-y-1.5">
                      <p className="font-sans text-[0.8125rem] text-destructive">
                        {roleError}
                      </p>
                      <p className="font-sans text-[0.75rem] text-destructive/70">
                        {t("onboarding.no_candidate_account")}{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setRoleError("");
                            setApiError("");
                            setRegErrors({});
                            setStep("register");
                          }}
                          className="font-semibold underline underline-offset-2 cursor-pointer"
                        >
                          {t("onboarding.create_one_now")}
                        </button>
                      </p>
                    </div>
                  )}

                  {/* generic api error */}
                  {apiError && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                      <p className="font-sans text-[0.8125rem] text-destructive">
                        {apiError}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full font-sans font-semibold"
                    loading={loading}
                    disabled={loading}
                  >
                    {!loading && (
                      <>
                        {t("onboarding.continue")}{" "}
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* divider + create account — same style as signin page AuthNavLink */}
                <div className="pt-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-sans text-xs text-muted-foreground whitespace-nowrap">
                      {t("onboarding.new_here")}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setApiError("");
                      setRoleError("");
                      setRegErrors({});
                      setStep("register");
                    }}
                    className="flex items-center justify-center w-full h-10 sm:h-11 rounded-lg border font-sans font-semibold text-sm transition-all duration-150 border-border text-foreground hover:bg-muted hover:border-border/80 cursor-pointer"
                  >
                    {t("onboarding.create_account_link")}
                  </button>
                </div>

                {/* security note */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="size-3.5 text-muted-foreground/40" />
                  <p className="font-sans text-[0.7rem] text-muted-foreground/50">
                    {t("onboarding.security_note")}
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP: register ────────────────────────────────────── */}
            {step === "register" && (
              <div className="space-y-2.5">
                {/* email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                    {t("onboarding.email_label")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      autoFocus
                      placeholder="you@example.com"
                      value={reg.email}
                      disabled={loading}
                      onChange={updateReg("email")}
                      aria-invalid={!!regErrors.email}
                      className={cn(
                        "pl-9 h-10 text-sm font-sans",
                        regErrors.email &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    />
                  </div>
                  {regErrors.email && (
                    <p className="text-xs text-destructive font-sans">
                      {regErrors.email}
                    </p>
                  )}
                </div>

                {/* first + last name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                      {t("onboarding.first_name")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="John"
                        value={reg.firstName}
                        disabled={loading}
                        onChange={updateReg("firstName")}
                        aria-invalid={!!regErrors.firstName}
                        className={cn(
                          "pl-9 h-10 text-sm font-sans",
                          regErrors.firstName &&
                            "border-destructive focus-visible:ring-destructive/30",
                        )}
                      />
                    </div>
                    {regErrors.firstName && (
                      <p className="text-xs text-destructive font-sans">
                        {regErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                      {t("onboarding.last_name")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Doe"
                      value={reg.lastName}
                      disabled={loading}
                      onChange={updateReg("lastName")}
                      aria-invalid={!!regErrors.lastName}
                      className={cn(
                        "h-10 text-sm font-sans",
                        regErrors.lastName &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    />
                    {regErrors.lastName && (
                      <p className="text-xs text-destructive font-sans">
                        {regErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                    {t("onboarding.phone")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="+1 234 567 8900"
                      value={reg.phone}
                      disabled={loading}
                      onChange={updateReg("phone")}
                      aria-invalid={!!regErrors.phone}
                      className={cn(
                        "pl-9 h-10 text-sm font-sans",
                        regErrors.phone &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    />
                  </div>
                  {regErrors.phone && (
                    <p className="text-xs text-destructive font-sans">
                      {regErrors.phone}
                    </p>
                  )}
                </div>

                {/* LinkedIn (optional) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                    {t("onboarding.linkedin")}
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="https://linkedin.com/in/yourname"
                      value={reg.linkedin}
                      disabled={loading}
                      onChange={updateReg("linkedin")}
                      className="pl-9 h-10 text-sm font-sans"
                    />
                  </div>
                </div>

                {/* CV upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
                    {t("onboarding.cv_label")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={cn(
                      "rounded-xl border-2 border-dashed p-2.5 text-center transition-all duration-200",
                      loading
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:border-primary/40 hover:bg-primary/5",
                      regErrors.cv
                        ? "border-destructive bg-destructive/5"
                        : cvFile
                          ? "border-primary/40 bg-primary/5"
                          : "border-border",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      hidden
                      onChange={handleFileChange}
                    />
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="size-5 text-primary shrink-0" />
                        <span className="font-sans text-sm font-medium text-primary truncate max-w-55">
                          {cvFile.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <CloudUpload className="mx-auto mb-1.5 size-6 text-muted-foreground/50" />
                        <p className="font-sans text-[0.8rem] text-muted-foreground">
                          {t("onboarding.cv_upload")}
                        </p>
                      </>
                    )}
                  </div>
                  {regErrors.cv && (
                    <p className="text-xs text-destructive font-sans">
                      {regErrors.cv}
                    </p>
                  )}
                </div>

                {apiError && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                    <p className="font-sans text-[0.8125rem] text-destructive">
                      {apiError}
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="gradient"
                  size="lg"
                  className="w-full font-sans font-semibold"
                  loading={loading}
                  disabled={loading}
                  onClick={handleRegister}
                >
                  {loading
                    ? (cvFile ? t("onboarding.cv_analyzing") : t("onboarding.cv_creating"))
                    : <><UserPlus className="size-4" /> {t("onboarding.cv_create_btn")}</>}
                </Button>

                <p className="text-center font-sans text-[0.78rem] text-muted-foreground">
                  {t("onboarding.have_account")}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setApiError("");
                    }}
                    className="font-semibold text-primary underline-offset-2 hover:underline cursor-pointer"
                  >
                    {t("onboarding.sign_in_link")}
                  </button>
                </p>
              </div>
            )}

            {/* ── STEP: OTP — mirrors AppOtpVerifyStep + OtpPage exactly ── */}
            {step === "otp" && (
              <div className="mb-3">
                {/* Mail icon + title + email — same structure as AppOtpVerifyStep */}
                <div className="text-center mb-5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Mail className="size-5 sm:size-6 text-primary" />
                  </div>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-foreground mb-2">
                    {t("onboarding.title_otp")}
                  </h3>
                  <p className="font-sans text-sm text-foreground/80 leading-relaxed px-2 sm:px-4">
                    {t("onboarding.desc_otp")}
                  </p>
                  <p className="font-sans font-bold text-sm text-foreground break-all mt-1 px-2">
                    {otpEmail}
                  </p>
                </div>

                {/* OTP digit boxes — wrapper div + transparent input (same as AppOtpVerifyStep) */}
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative flex items-center justify-center rounded-xl shrink-0",
                        "w-9 h-11 sm:w-10 sm:h-12",
                        "border-[1.5px] transition-all duration-150",
                        "focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2",
                        otpDigits[i]
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-muted/40",
                        loading && "opacity-50 pointer-events-none",
                      )}
                    >
                      <input
                        ref={(el) => { otpRefs.current[i] = el; }}
                        value={otpDigits[i] ?? ""}
                        maxLength={1}
                        disabled={loading}
                        onChange={(e) => handleOtpChange(i, e)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="w-full h-full border-0 outline-none bg-transparent text-center text-sm sm:text-lg font-bold text-foreground font-sans disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center mt-3 sm:mt-4 min-h-5">
                  {secondsLeft > 0 && (
                    <p className={cn(
                      "text-xs sm:text-sm font-semibold font-sans transition-colors duration-300",
                      secondsLeft <= 60 ? "text-amber-500" : "text-muted-foreground",
                    )}>
                      {t("onboarding.code_expires", { time: formatTimeLeft(secondsLeft) })}
                    </p>
                  )}
                  {isExpired && (
                    <p className="text-xs sm:text-sm font-semibold font-sans text-destructive">
                      {t("onboarding.code_expired")}
                    </p>
                  )}
                </div>

                {apiError && (
                  <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                    <p className="font-sans text-[0.8125rem] text-destructive">{apiError}</p>
                  </div>
                )}

                {/* Verify / Resend button — gradient, same as AppOtpVerifyStep */}
                {isExpired ? (
                  <Button
                    type="button"
                    variant="gradient"
                    size="lg"
                    className="w-full mt-4 sm:mt-5 font-sans font-semibold text-sm sm:text-base"
                    loading={loading}
                    disabled={loading}
                    onClick={handleResend}
                  >
                    {!loading && (
                      <>
                        <RefreshCw className="size-3.5 sm:size-4" />
                        {t("onboarding.resend_btn")}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gradient"
                    size="lg"
                    className="w-full mt-4 sm:mt-5 font-sans font-semibold text-sm sm:text-base"
                    loading={loading}
                    disabled={loading || otpCode.length < CODE_LENGTH}
                    onClick={!loading ? handleVerify : undefined}
                  >
                    {!loading && (
                      <>
                        {t("onboarding.verify_btn")}
                        <ArrowRight className="size-3.5 sm:size-4" />
                      </>
                    )}
                  </Button>
                )}

                {/* Change email — ghost + border, same as OtpPage */}
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  className="w-full mt-2 sm:mt-2.5 font-sans font-medium text-xs sm:text-sm text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                  disabled={loading}
                  onClick={() => { setStep("email"); setApiError(""); clearTimer(); }}
                >
                  {t("onboarding.change_email")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Analysis Dialog */}
      <Dialog open={analyzingCv} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="max-w-90 rounded-2xl p-0 overflow-hidden border border-border shadow-2xl"
        >
          <DialogTitle className="sr-only">Analyzing your CV</DialogTitle>
          <div
            className="h-1 transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, ${GREEN} ${cvProgress}%, rgba(34,197,94,0.1) ${cvProgress}%)`,
            }}
          />
          <div className="px-7 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
              <div>
                <p className="font-sans font-bold text-[0.95rem] text-foreground">
                  {t("onboarding.cv_analysis_title")}
                </p>
                <p className="font-sans text-[0.77rem] text-muted-foreground">
                  {t("onboarding.cv_analysis_subtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { label: t("onboarding.cv_step1"), threshold: 0 },
                { label: t("onboarding.cv_step2"), threshold: 30 },
                { label: t("onboarding.cv_step3"), threshold: 65 },
              ].map(({ label, threshold }) => {
                const done = cvProgress > threshold;
                return (
                  <div key={label} className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-all duration-300",
                        done ? "bg-primary/10" : "bg-muted",
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="size-3 text-primary" />
                      ) : (
                        <div className="w-2 h-2 rounded-full border border-t-primary border-border animate-spin" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-sans text-[0.78rem] transition-all duration-300",
                        done
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-sans text-[0.7rem] text-muted-foreground">
                  {t("onboarding.cv_processing")}
                </span>
                <span className="font-sans font-bold text-[0.7rem] text-primary">
                  {cvProgress}%
                </span>
              </div>
              <Progress
                value={cvProgress}
                className="h-1.5 rounded-full bg-primary/10"
              />
            </div>

            <p className="font-sans text-[0.72rem] text-muted-foreground/50 text-center -mt-1">
              {t("onboarding.cv_dont_close")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingModal;
