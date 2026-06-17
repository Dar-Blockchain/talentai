import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, CloudUpload, CheckCircle2, Mail } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { AppDispatch } from '@/store/store';
import { setConnectedUser } from '@/store/slices/userSlice';
import { authApi } from '@/modules/auth/shared/api';
import { useAuthContext } from '@/modules/auth/shared/context/AuthContext';
import { checkEligibility } from '../../../post-interview/api/eligibility.api';
import { usePersistentCountdown } from '@/hooks/usePersistentCountdown';
import { getUserLocation } from '@/utils/api';
import { formatTimeLeft } from '@/utils/functions';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/modules/shared/ui/shadcn/progress';
import { Dialog, DialogContent } from '@/modules/shared/ui/shadcn/dialog';

const GREEN = '#6AD39C';
const GREEN_LIGHT = 'rgba(106,211,156,0.08)';
const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = 'job_apply_code_expires_at';

type Step = 'email' | 'form' | 'otp';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  const { login }   = useAuthContext();
  const router      = useRouter();
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', linkedin: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);

  const [code, setCode] = useState('');
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

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

  const handleEmailContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setEmailError(t('onboarding.error_required')); return; }
    if (!validateEmail(trimmed)) { setEmailError(t('onboarding.error_email')); return; }
    setEmailError('');
    setLoading(true);
    setApiError('');
    try {
      await authApi.signin(trimmed);
      startTimer();
      setStep('otp');
    } catch (err: any) {
      const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
      if (msg.includes('not found') || msg.includes('register')) {
        setStep('form');
      } else {
        setApiError(err || t('onboarding.error_generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = t('onboarding.error_first_name_required');
    if (!form.lastName.trim())  e.lastName  = t('onboarding.error_last_name_required');
    if (!form.phone.trim()) {
      e.phone = t('onboarding.error_phone_required');
    } else if (!/^\+?[1-9]\d{6,14}$/.test(form.phone.trim().replace(/[\s\-().]/g, ''))) {
      e.phone = t('onboarding.error_phone_invalid');
    }
    if (!cvFile) e.cv = t('onboarding.error_cv_required');
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setFormErrors(p => ({ ...p, cv: t('onboarding.error_pdf') })); return; }
    if (file.size > 10 * 1024 * 1024)   { setFormErrors(p => ({ ...p, cv: t('onboarding.error_size') })); return; }
    setCvFile(file);
    setFormErrors(p => ({ ...p, cv: '' }));
  };

  const handleFormContinue = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    if (cvFile) setAnalyzingCv(true);
    try {
      const fd = new FormData();
      fd.append('email', email.trim().toLowerCase());
      fd.append('firstName', form.firstName.trim());
      fd.append('lastName', form.lastName.trim());
      fd.append('phone', form.phone.trim());
      fd.append('roleType', 'Candidate');
      if (cvFile) fd.append('resume', cvFile);
      await authApi.register(fd);
      startTimer();
      setStep('otp');
    } catch (err: any) {
      setApiError(err || t('onboarding.error_registration'));
    } finally {
      setLoading(false);
      setAnalyzingCv(false);
    }
  };

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
    setLoading(true); setApiError(''); setCode('');
    try {
      await authApi.signin(email.trim().toLowerCase());
      startTimer();
    } catch (err: any) {
      setApiError(err || t('onboarding.error_resend'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) return;
    setLoading(true); setApiError('');
    try {
      const userLocation = await getUserLocation();
      const data = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
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
      const postId = typeof router.query.jobId === 'string' ? router.query.jobId : null;
      if (postId) {
        await queryClient.prefetchQuery({
          queryKey:  ['eligibility', postId],
          queryFn:   () => checkEligibility(postId),
          staleTime: 0,
        });
      }
      if (isMountedRef.current) { clearTimer(); onClose(); }
    } catch {
      if (isMountedRef.current) { setApiError(t('onboarding.error_code')); setLoading(false); }
    }
  };

  const handleClose = () => {
    if (loading) return;
    setStep('email'); setEmail(''); setEmailError('');
    setForm({ firstName: '', lastName: '', phone: '', linkedin: '' });
    setFormErrors({}); setCvFile(null); setApiError(''); setCode('');
    clearTimer(); onClose();
  };

  const inputCls = 'w-full border border-[rgb(203,203,203)] rounded-[8px] px-3.5 py-2.5 text-[0.88rem] font-sans outline-none focus:border-[rgb(203,203,203)] transition-colors';
  const labelCls = 'block font-sans text-[0.82rem] font-medium text-[#374151] mb-1.5';
  const errCls   = 'font-sans text-[0.75rem] text-[#DC2626] mt-1';

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-sm rounded-[24px] bg-white shadow-[0px_4px_50px_0px_rgba(0,0,0,0.12)] overflow-hidden p-0"
        >
          {!loading && (
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 text-[#9CA3AF] hover:text-[#374151] transition-colors p-1 rounded-full"
            >
              <X size={18} />
            </button>
          )}

          <div className="px-6 sm:px-7 py-7 text-center">
            {/* Back button */}
            {(step === 'form' || step === 'otp') && !loading && (
              <div className="flex justify-start mb-3">
                <button
                  onClick={() => { setStep('email'); setCode(''); setApiError(''); clearTimer(); }}
                  className="flex items-center gap-1.5 font-sans font-medium text-[0.82rem] text-[#666] hover:text-[#6AD39C] transition-colors p-0"
                >
                  <ArrowLeft size={14} />
                  {t('onboarding.back')}
                </button>
              </div>
            )}

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/images/home/logo.svg"
                alt="TalentAI"
                style={{ height: 32, objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => router.push('/')}
              />
            </div>

            {/* Title */}
            <h2 className="font-sans font-extrabold text-[1.35rem] text-[#0F172A] mb-2 tracking-tight leading-tight">
              {step === 'email' ? t('onboarding.title_email') : step === 'form' ? t('onboarding.title_form') : t('onboarding.title_otp')}
            </h2>

            {/* Descriptor */}
            <p
              className="font-sans text-[0.82rem] text-[#64748B] leading-relaxed"
              style={{ marginBottom: step === 'email' ? '1rem' : '1.5rem' }}
            >
              {step === 'email' ? t('onboarding.desc_email') : step === 'form' ? t('onboarding.desc_form') : t('onboarding.desc_otp')}
            </p>

            {/* Job title badge */}
            {step === 'email' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[rgba(106,211,156,0.25)] mb-6" style={{ background: GREEN_LIGHT }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#6AD39C] shrink-0" />
                <span className="font-sans font-semibold text-[0.78rem] text-[#10453F]">{jobTitle}</span>
              </div>
            )}

            {/* Subtitle for form/otp */}
            {step !== 'email' && (
              <p className="font-sans text-[0.78rem] text-[#94A3B8] leading-relaxed mb-6">
                {step === 'form' ? t('onboarding.subtitle_form', { email }) : t('onboarding.subtitle_otp', { email })}
              </p>
            )}

            {/* STEP: email */}
            {step === 'email' && (
              <form onSubmit={e => { e.preventDefault(); handleEmailContinue(); }} className="text-left">
                <label className={labelCls}>{t('onboarding.email_label')}</label>
                <div className="relative">
                  <Mail size={16} color="rgba(0,0,0,0.6)" className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="email" type="email" value={email} autoFocus
                    onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    className={`${inputCls} pl-9`}
                    style={{ borderColor: emailError ? '#DC2626' : undefined }}
                  />
                </div>
                {emailError && <p className={errCls}>{emailError}</p>}
                {apiError && (
                  <div className="mt-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[0.83rem] text-[#DC2626] font-sans">
                    {apiError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 font-sans font-semibold text-[0.92rem] text-white py-3 rounded-full tracking-[0.3px] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: GREEN }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#10453F')}
                  onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
                >
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  {loading ? t('onboarding.checking') : t('onboarding.continue')}
                </button>
              </form>
            )}

            {/* STEP: form */}
            {step === 'form' && (
              <div className="text-left space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      {t('onboarding.first_name')} <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      value={form.firstName} onChange={handleChange('firstName')}
                      className={inputCls}
                      style={{ borderColor: formErrors.firstName ? '#DC2626' : undefined }}
                    />
                    {formErrors.firstName && <p className={errCls}>{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t('onboarding.last_name')} <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      value={form.lastName} onChange={handleChange('lastName')}
                      className={inputCls}
                      style={{ borderColor: formErrors.lastName ? '#DC2626' : undefined }}
                    />
                    {formErrors.lastName && <p className={errCls}>{formErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    {t('onboarding.phone')} <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    value={form.phone} onChange={handleChange('phone')}
                    className={inputCls}
                    style={{ borderColor: formErrors.phone ? '#DC2626' : undefined }}
                  />
                  {formErrors.phone && <p className={errCls}>{formErrors.phone}</p>}
                </div>

                <div>
                  <label className={labelCls}>{t('onboarding.linkedin')}</label>
                  <input
                    value={form.linkedin} onChange={handleChange('linkedin')}
                    placeholder="https://linkedin.com/in/yourname"
                    className={inputCls}
                  />
                </div>

                {/* CV upload */}
                <div>
                  <p className="font-sans text-[0.82rem] font-semibold text-[#374151] mb-1.5">
                    {t('onboarding.cv_label')} <span className="font-normal text-[#DC2626]">*</span>
                  </p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-[12px] p-5 text-center cursor-pointer transition-colors"
                    style={{
                      borderColor: formErrors.cv ? '#DC2626' : cvFile ? GREEN : '#E5E7EB',
                      background:  cvFile ? GREEN_LIGHT : '#FAFAFA',
                    }}
                    onMouseEnter={e => { if (!cvFile) { (e.currentTarget as HTMLDivElement).style.borderColor = GREEN; (e.currentTarget as HTMLDivElement).style.background = GREEN_LIGHT; } }}
                    onMouseLeave={e => { if (!cvFile) { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; } }}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileChange} />
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 size={20} color={GREEN} />
                        <span className="font-sans text-[0.83rem] font-semibold" style={{ color: GREEN }}>{cvFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <CloudUpload size={28} color="#9CA3AF" className="mx-auto mb-1" />
                        <p className="font-sans text-[0.82rem] text-[#6B7280]">{t('onboarding.cv_upload')}</p>
                      </>
                    )}
                  </div>
                  {formErrors.cv && <p className={errCls}>{formErrors.cv}</p>}
                </div>

                {apiError && (
                  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[0.83rem] text-[#DC2626] font-sans">
                    {apiError}
                  </div>
                )}

                <button
                  onClick={handleFormContinue}
                  disabled={loading}
                  className="w-full mt-2 font-sans font-semibold text-[0.92rem] text-white py-3 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: GREEN }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#10453F')}
                  onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
                >
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  {loading ? (cvFile ? t('onboarding.cv_analyzing') : t('onboarding.cv_creating')) : t('onboarding.cv_create_btn')}
                </button>
              </div>
            )}

            {/* STEP: OTP */}
            {step === 'otp' && (
              <div>
                <div className="flex gap-2 justify-center mb-3">
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <input
                      key={i}
                      ref={el => (codeInputsRef.current[i] = el)}
                      value={code[i] || ''}
                      onChange={e => handleCodeChange(i, e as React.ChangeEvent<HTMLInputElement>)}
                      onPaste={handleCodePaste}
                      onKeyDown={e => handleCodeKeyDown(i, e)}
                      maxLength={1}
                      className="w-11 h-12 border border-[rgb(203,203,203)] rounded-[8px] text-center text-[1.25rem] font-sans font-semibold outline-none focus:border-[#6AD39C] transition-colors"
                    />
                  ))}
                </div>

                {(isRunning || isExpired) && (
                  <p
                    className="font-sans text-[0.82rem] font-medium mb-3 transition-colors"
                    style={{ color: secondsLeft > 10 ? '#64748B' : secondsLeft > 0 ? '#d97706' : '#DC2626' }}
                  >
                    {secondsLeft > 0 ? t('onboarding.code_expires', { time: formatTimeLeft(secondsLeft) }) : t('onboarding.code_expired')}
                  </p>
                )}

                {apiError && (
                  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[0.83rem] text-[#DC2626] font-sans mb-3">
                    {apiError}
                  </div>
                )}

                <button
                  disabled={loading || (!isExpired && code.length < CODE_LENGTH)}
                  onClick={isExpired ? handleResend : handleVerify}
                  className="w-full mt-2 font-sans font-semibold text-[0.92rem] text-white py-3 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: GREEN }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#10453F')}
                  onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
                >
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  {loading
                    ? (isExpired ? t('onboarding.resending') : t('onboarding.verifying'))
                    : (isExpired ? t('onboarding.resend_btn') : t('onboarding.verify_btn'))}
                </button>

                <button
                  onClick={() => { setStep('email'); setCode(''); setApiError(''); clearTimer(); }}
                  disabled={loading}
                  className="w-full mt-4 font-sans font-medium text-[0.88rem] py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ color: GREEN, background: 'rgba(0,0,0,0.05)' }}
                >
                  {t('onboarding.change_email')}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Analysis Modal */}
      <Dialog open={analyzingCv} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[380px] rounded-[16px] p-0 overflow-hidden shadow-[0_24px_60px_rgba(106,211,156,0.15)]"
        >
          <div
            className="h-1 transition-all duration-300"
            style={{ background: `linear-gradient(90deg, ${GREEN} ${cvProgress}%, rgba(106,211,156,0.15) ${cvProgress}%)` }}
          />
          <div className="px-8 py-7 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[12px] bg-[rgba(106,211,156,0.08)] flex items-center justify-center shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-[#6AD39C] border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="font-sans font-bold text-[1rem] text-[#111] leading-snug">{t('onboarding.cv_analysis_title')}</p>
                <p className="font-sans text-[0.78rem] text-[#888]">{t('onboarding.cv_analysis_subtitle')}</p>
              </div>
            </div>

            {[
              { label: t('onboarding.cv_step1'), threshold: 0 },
              { label: t('onboarding.cv_step2'), threshold: 30 },
              { label: t('onboarding.cv_step3'), threshold: 65 },
            ].map(({ label, threshold }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-[background] duration-300"
                  style={{ background: cvProgress > threshold ? 'rgba(106,211,156,0.1)' : 'rgba(0,0,0,0.04)' }}
                >
                  {cvProgress > threshold
                    ? <CheckCircle2 size={13} color={GREEN} />
                    : <div className="w-2 h-2 rounded-full border border-[#ccc] border-t-transparent animate-spin" />}
                </div>
                <span
                  className="font-sans text-[0.78rem] transition-[color,font-weight] duration-300"
                  style={{ color: cvProgress > threshold ? '#333' : '#aaa', fontWeight: cvProgress > threshold ? 600 : 400 }}
                >
                  {label}
                </span>
              </div>
            ))}

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-sans text-[0.65rem] text-[#999]">{t('onboarding.cv_processing')}</span>
                <span className="font-sans font-bold text-[0.65rem]" style={{ color: GREEN }}>{cvProgress}%</span>
              </div>
              <Progress
                value={cvProgress}
                className="h-1.5 rounded-full bg-[rgba(106,211,156,0.1)]"
              />
            </div>

            <p className="font-sans text-[0.75rem] text-[#bbb] text-center -mt-2">
              {t('onboarding.cv_dont_close')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingModal;
