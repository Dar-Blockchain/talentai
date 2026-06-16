import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppDispatch } from '@/store/store';
import { setConnectedUser } from '@/store/slices/userSlice';
import { authApi } from '@/modules/auth/shared/api';
import {
  useAuthContext,
  FormField,
  AuthSubmitButton,
  AuthPageHeader,
} from '@/modules/auth/shared';
import { validators } from '@/modules/auth/shared/utils/validators';
import { checkEligibility } from '../../api/eligibility.api';
import { usePersistentCountdown } from '@/hooks/usePersistentCountdown';
import { useToast } from '@/hooks/useToast';
import { getUserLocation } from '@/utils/api';
import { formatTimeLeft } from '@/utils/functions';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/modules/shared/ui/shadcn/dialog';
import { Button } from '@/modules/shared/ui/shadcn/button';

const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = 'job_apply_code_expires_at';

// step 'email'  → just email input (detect new vs existing)
// step 'form'   → full form for new users (name, phone, linkedin, CV)
// step 'otp'    → 6-digit code

type Step = 'email' | 'form' | 'otp';

interface EmailFormValues {
  email: string;
}

interface DetailsFormValues {
  firstName: string;
  lastName:  string;
  phone:     string;
  linkedin:  string;
}

export interface OnboardingModalProps {
  open: boolean;
  jobTitle: string;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, jobTitle, onClose }) => {
  const { t } = useTranslation('modules/interview/apply');
  const dispatch    = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { login } = useAuthContext();
  const { showToast } = useToast();
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');

  const emailForm = useForm<EmailFormValues>({ mode: 'onTouched', defaultValues: { email: '' } });
  const detailsForm = useForm<DetailsFormValues>({
    mode: 'onTouched',
    defaultValues: { firstName: '', lastName: '', phone: '', linkedin: '' },
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);

  const [code, setCode] = useState('');
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [loading, setLoading] = useState(false);

  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

  // CV analysis progress animation
  useEffect(() => {
    if (!analyzingCv) { setCvProgress(0); return; }
    setCvProgress(0);
    const timer = setInterval(() => {
      setCvProgress(prev => {
        if (prev >= 90) { clearInterval(timer); return 90; }
        return prev + (prev < 60 ? 4 : 1);
      });
    }, 300);
    return () => clearInterval(timer);
  }, [analyzingCv]);

  // ── Step: email ────────────────────────────────────────────────────────────

  const handleEmailContinue = async ({ email: rawEmail }: EmailFormValues) => {
    const trimmed = rawEmail.trim().toLowerCase();
    setLoading(true);
    try {
      // Try signin — if it works, user exists → go straight to OTP
      await authApi.signin(trimmed);
      setEmail(trimmed);
      startTimer();
      setStep('otp');
    } catch (err: any) {
      const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
      if (msg.includes('not found') || msg.includes('register')) {
        // New user → show full form
        setEmail(trimmed);
        setStep('form');
      } else {
        showToast({ message: err?.message || t('onboarding.error_generic'), severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step: form (new users) ─────────────────────────────────────────────────

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { showToast({ message: t('onboarding.error_pdf'), severity: 'error' }); return; }
    if (file.size > 10 * 1024 * 1024) { showToast({ message: t('onboarding.error_size'), severity: 'error' }); return; }
    setCvFile(file);
    setCvError(false);
  };

  const handleFormContinue = async (values: DetailsFormValues) => {
    if (!cvFile) { setCvError(true); return; }
    setLoading(true);
    setAnalyzingCv(true);
    try {
      const fd = new FormData();
      fd.append('email', email);
      fd.append('firstName', values.firstName.trim());
      fd.append('lastName', values.lastName.trim());
      fd.append('phone', values.phone.trim());
      fd.append('roleType', 'Candidate');
      fd.append('resume', cvFile);
      await authApi.register(fd);
      startTimer();
      setStep('otp');
    } catch (err: any) {
      showToast({ message: err?.message || t('onboarding.error_registration'), severity: 'error' });
    } finally {
      setLoading(false);
      setAnalyzingCv(false);
    }
  };

  // ── Step: OTP ──────────────────────────────────────────────────────────────

  const handleCodeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      const arr = code.split(''); arr[index] = ''; setCode(arr.join('')); return;
    }
    const arr = code.split(''); arr[index] = raw[0]; setCode(arr.join(''));
    if (index < CODE_LENGTH - 1) codeInputsRef.current[index + 1]?.focus();
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!paste) return;
    const arr = code.split('');
    for (let i = 0; i < CODE_LENGTH; i++) arr[i] = paste[i] || arr[i] || '';
    setCode(arr.join(''));
    codeInputsRef.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) codeInputsRef.current[index - 1]?.focus();
  };

  const handleResend = async () => {
    setLoading(true); setCode('');
    try {
      await authApi.signin(email);
      startTimer();
    } catch (err: any) {
      showToast({ message: err?.message || t('onboarding.error_resend'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) return;
    setLoading(true);
    try {
      const userLocation = await getUserLocation();
      const data = await authApi.verifyOtp({
        email,
        otp: code,
        location: userLocation,
      });
      dispatch(setConnectedUser({
        user:              data.user,
        profile:           data.profile           ?? null,
        planLimits:        data.planLimits         ?? null,
        companyMembership: data.companyMembership  ?? null,
      }));
      login();

      // Pre-populate the eligibility cache so index.tsx gets the result immediately after auth.
      // The component may unmount during this await, but prefetchQuery continues regardless.
      const postId = typeof router.query.jobId === 'string' ? router.query.jobId : null;
      if (postId) {
        await queryClient.prefetchQuery({
          queryKey: ['eligibility', postId],
          queryFn:  () => checkEligibility(postId),
          staleTime: 0,
        });
      }

      if (isMountedRef.current) {
        clearTimer();
        onClose();
      }
    } catch {
      if (isMountedRef.current) {
        showToast({ message: t('onboarding.error_code'), severity: 'error' });
        setLoading(false);
      }
    }
  };

  // ── Reset / close ──────────────────────────────────────────────────────────

  const handleClose = () => {
    if (loading) return;
    setStep('email'); setEmail('');
    emailForm.reset(); detailsForm.reset();
    setCvFile(null); setCvError(false); setCode('');
    clearTimer(); onClose();
  };

  const router = useRouter();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent
          showCloseButton={!loading}
          className="sm:max-w-md rounded-2xl p-0 overflow-hidden"
        >
          <div className="px-6 sm:px-7 py-7 text-center">

            {/* Back button row */}
            {(step === 'form' || step === 'otp') && !loading && (
              <div className="flex justify-start mb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto text-muted-foreground hover:bg-transparent hover:text-primary font-sans font-medium"
                  onClick={() => { setStep('email'); setCode(''); clearTimer(); }}
                >
                  <ArrowLeft className="size-4" />
                  {t('onboarding.back')}
                </Button>
              </div>
            )}

            {/* Logo */}
            <div className="mb-5 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/home/logo.svg"
                alt="TalentAI Logo"
                className="h-8 object-contain cursor-pointer"
                onClick={() => router.push('/')}
              />
            </div>

            {/* Title + descriptor — same header used across auth pages */}
            <AuthPageHeader
              size="sm"
              mb={step === 'email' ? 2 : 3}
              title={step === 'email' ? t('onboarding.title_email') : step === 'form' ? t('onboarding.title_form') : t('onboarding.title_otp')}
              subtitle={step === 'email' ? t('onboarding.desc_email') : step === 'form' ? t('onboarding.desc_form') : t('onboarding.desc_otp')}
            />

            {/* Job title badge — email step only */}
            {step === 'email' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/8 border border-primary/25 rounded-lg mb-6">
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                <span className="font-sans text-sm font-semibold text-[#10453F]">
                  {jobTitle}
                </span>
              </div>
            )}

            {/* Subtitle for form/otp steps */}
            {step !== 'email' && (
              <p className="font-sans text-xs text-muted-foreground/80 leading-relaxed mb-6">
                {step === 'form' ? t('onboarding.subtitle_form', { email }) : t('onboarding.subtitle_otp', { email })}
              </p>
            )}

            {/* ── STEP: email ── */}
            {step === 'email' && (
              <form onSubmit={emailForm.handleSubmit(handleEmailContinue)} className="text-left">
                <FormField
                  name="email"
                  control={emailForm.control}
                  label={t('onboarding.email_label')}
                  type="email"
                  placeholder="you@company.com"
                  disabled={loading}
                  error={emailForm.formState.errors.email?.message}
                  rules={{ required: t('onboarding.error_required'), validate: validators.email }}
                  width="full"
                />

                <AuthSubmitButton
                  type="submit"
                  loading={loading}
                  label={t('onboarding.continue')}
                  loadingLabel={t('onboarding.checking')}
                />
              </form>
            )}

            {/* ── STEP: form (new user) ── */}
            {step === 'form' && (
              <form onSubmit={detailsForm.handleSubmit(handleFormContinue)} className="text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    name="firstName"
                    control={detailsForm.control}
                    label={t('onboarding.first_name')}
                    disabled={loading}
                    error={detailsForm.formState.errors.firstName?.message}
                    rules={{ required: t('onboarding.error_first_name_required') }}
                  />
                  <FormField
                    name="lastName"
                    control={detailsForm.control}
                    label={t('onboarding.last_name')}
                    disabled={loading}
                    error={detailsForm.formState.errors.lastName?.message}
                    rules={{ required: t('onboarding.error_last_name_required') }}
                  />
                  <FormField
                    name="phone"
                    control={detailsForm.control}
                    label={t('onboarding.phone')}
                    placeholder="+1 234 567 890"
                    disabled={loading}
                    error={detailsForm.formState.errors.phone?.message}
                    rules={{ required: t('onboarding.error_phone_required'), validate: validators.phone }}
                    width="full"
                  />
                  <FormField
                    name="linkedin"
                    control={detailsForm.control}
                    label={t('onboarding.linkedin')}
                    placeholder="https://linkedin.com/in/yourname"
                    disabled={loading}
                    error={detailsForm.formState.errors.linkedin?.message}
                    rules={{ validate: validators.linkedinUrl }}
                    width="full"
                  />

                  {/* CV upload — same styling/behavior as the candidate register form */}
                  <div className="col-span-full">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider font-sans mb-1.5">
                      {t('onboarding.cv_label')}
                      <span className="text-destructive ml-0.5">*</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault(); setIsDragging(false);
                        const f = e.dataTransfer.files?.[0] ?? null;
                        if (f && /\.pdf$/i.test(f.name)) handleFileChange(f);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-[1.5px] border-dashed cursor-pointer",
                        "transition-all duration-200 select-none",
                        cvError    && "border-destructive bg-destructive/5",
                        isDragging && "border-primary/60 bg-primary/5 scale-[1.015] shadow-lg shadow-primary/10",
                        cvFile && !isDragging && !cvError && "border-primary/50 bg-primary/5",
                        !cvFile && !isDragging && !cvError && "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50",
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200",
                        cvFile || isDragging ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border",
                      )}>
                        {cvFile
                          ? <CheckCircle2 className="size-4 text-primary" />
                          : <UploadCloud className={cn("size-4", isDragging ? "text-primary" : "text-muted-foreground")} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-sans font-semibold text-xs sm:text-[0.8125rem] truncate leading-snug",
                          cvFile ? "text-foreground" : isDragging ? "text-primary" : "text-foreground/80",
                        )}>
                          {cvFile ? cvFile.name : isDragging ? t('onboarding.cv_drop') : t('onboarding.cv_upload')}
                        </p>
                        <p className="font-sans text-[0.65rem] sm:text-xs text-muted-foreground leading-snug mt-0.5">
                          {cvFile ? (
                            <>{(cvFile.size / 1024).toFixed(0)} KB · <span className="text-primary font-semibold">{t('onboarding.cv_replace')}</span></>
                          ) : cvError ? (
                            <span className="text-destructive">{t('onboarding.error_cv_required')}</span>
                          ) : (
                            t('onboarding.cv_formats')
                          )}
                        </p>
                      </div>

                      {!cvFile && !isDragging && (
                        <span className="px-1.5 py-0.5 rounded text-[0.55rem] sm:text-[0.6rem] font-bold tracking-wide text-muted-foreground bg-muted border border-border uppercase shrink-0">
                          PDF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <AuthSubmitButton
                  type="submit"
                  loading={loading}
                  label={t('onboarding.cv_create_btn')}
                  loadingLabel={cvFile ? t('onboarding.cv_analyzing') : t('onboarding.cv_creating')}
                />
              </form>
            )}

            {/* ── STEP: OTP ── */}
            {step === 'otp' && (
              <div>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative flex items-center justify-center rounded-xl shrink-0",
                        "w-10 h-12 sm:w-11 sm:h-13",
                        "border-[1.5px] transition-all duration-150",
                        "focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2",
                        code[i] ? "border-primary/50 bg-primary/5" : "border-border bg-muted/40",
                        loading && "opacity-50 pointer-events-none",
                      )}
                    >
                      <input
                        ref={el => { codeInputsRef.current[i] = el; }}
                        value={code[i] || ''}
                        maxLength={1}
                        disabled={loading}
                        onChange={e => handleCodeChange(i, e)}
                        onPaste={i === 0 ? handleCodePaste : undefined}
                        onKeyDown={e => handleCodeKeyDown(i, e)}
                        className="w-full h-full border-0 outline-none bg-transparent text-center text-lg font-bold text-foreground font-sans disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>

                {(isRunning || isExpired) && (
                  <p className={cn(
                    "text-xs font-medium font-sans mt-3 transition-colors duration-300",
                    secondsLeft > 10 ? "text-muted-foreground" : secondsLeft > 0 ? "text-amber-500" : "text-destructive",
                  )}>
                    {secondsLeft > 0 ? t('onboarding.code_expires', { time: formatTimeLeft(secondsLeft) }) : t('onboarding.code_expired')}
                  </p>
                )}

                <AuthSubmitButton
                  type="button"
                  loading={loading}
                  disabled={!isExpired && code.length < CODE_LENGTH}
                  label={isExpired ? t('onboarding.resend_btn') : t('onboarding.verify_btn')}
                  loadingLabel={isExpired ? t('onboarding.resending') : t('onboarding.verifying')}
                  onClick={isExpired ? handleResend : handleVerify}
                />

                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => { setStep('email'); setCode(''); clearTimer(); }}
                  className="w-full mt-2 font-sans font-medium text-primary bg-muted/60 hover:bg-muted"
                >
                  {t('onboarding.change_email')}
                </Button>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* ── CV Analysis Modal (same as register page) ── */}
      <Dialog open={analyzingCv}>
        <DialogContent showCloseButton={false} className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden gap-0">
          <div
            className="h-1 transition-[background] duration-400"
            style={{ background: `linear-gradient(90deg, hsl(var(--primary)) ${cvProgress}%, rgba(106,211,156,0.15) ${cvProgress}%)` }}
          />
          <div className="px-6 py-5 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <Loader2 className="size-5 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-sans font-bold text-[15px] text-foreground leading-tight">
                  {t('onboarding.cv_analysis_title')}
                </p>
                <p className="font-sans text-xs text-muted-foreground">
                  {t('onboarding.cv_analysis_subtitle')}
                </p>
              </div>
            </div>

            {[
              { label: t('onboarding.cv_step1'), threshold: 0 },
              { label: t('onboarding.cv_step2'), threshold: 30 },
              { label: t('onboarding.cv_step3'), threshold: 65 },
            ].map(({ label, threshold }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={cn(
                  "size-[18px] rounded-full flex items-center justify-center shrink-0 transition-colors duration-400",
                  cvProgress > threshold ? "bg-primary/10" : "bg-muted",
                )}>
                  {cvProgress > threshold
                    ? <CheckCircle2 className="size-3.5 text-primary" />
                    : <Loader2 className={cn("size-2.5 animate-spin", cvProgress >= threshold ? "text-primary" : "text-muted-foreground/50")} />
                  }
                </div>
                <span className={cn(
                  "text-xs font-sans transition-colors duration-400",
                  cvProgress > threshold ? "text-foreground font-semibold" : "text-muted-foreground",
                )}>
                  {label}
                </span>
              </div>
            ))}

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-muted-foreground font-sans">{t('onboarding.cv_processing')}</span>
                <span className="text-[11px] text-primary font-bold font-sans">{cvProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-[width] duration-400"
                  style={{ width: `${cvProgress}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/60 text-center -mt-1 font-sans">
              {t('onboarding.cv_dont_close')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingModal;
