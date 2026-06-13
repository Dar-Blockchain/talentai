"use client";

import React from "react";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatTimeLeft } from "@/utils/functions";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import type { useOtpInput, useOtpTimer } from "@/modules/auth/shared/hooks";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";

type OtpInputReturn = ReturnType<typeof useOtpInput>;
type OtpTimerReturn = ReturnType<typeof useOtpTimer>;

interface Props {
  savedEmail:     string;
  otp:            OtpInputReturn;
  tPrefix:        "signin" | "candidate_form" | "company_form";
  loading:        boolean;
  timer?:         OtpTimerReturn;
  resendLoading?: boolean;
  onVerify?:      () => void;
  onResend?:      () => void;
}

const AppOtpVerifyStep: React.FC<Props> = ({
  savedEmail, otp, tPrefix, loading, timer, resendLoading, onVerify, onResend,
}) => {
  const { t } = useTranslation("auth");
  const hasActions = !!onVerify && !!timer;

  return (
    <div className="mb-3 sm:mb-4">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6 lg:mb-8">
        <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <Mail className="size-5 sm:size-6 text-primary" />
        </div>

        <h3 className="font-sans font-bold text-base sm:text-lg lg:text-xl text-foreground mb-2">
          {t(`${tPrefix}.code_sent_title`)}
        </h3>

        {/* "We sent a 6-digit code to [email]" — always visible */}
        <p className="font-sans text-sm sm:text-sm text-foreground/80 leading-relaxed px-2 sm:px-4">
          {t(`${tPrefix}.code_sent_to`)}{" "}
          <span className="font-bold text-foreground break-all">{savedEmail}</span>
        </p>
      </div>

      {/* OTP digit boxes — centered */}
      <div className="flex justify-center gap-1.5 sm:gap-2 lg:gap-3">
        {otp.otpCode.map((digit, i) => (
          <div
            key={i}
            className={cn(
              "relative flex items-center justify-center rounded-xl shrink-0",
              "w-9 h-11 sm:w-10 sm:h-12 lg:w-12 lg:h-14",
              "border-[1.5px] transition-all duration-150",
              "focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2",
              digit
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-muted/40",
              loading && "opacity-50 pointer-events-none",
            )}
          >
            <input
              ref={(el) => { otp.inputsRef.current[i] = el; }}
              value={digit}
              maxLength={1}
              disabled={loading}
              onChange={(e) => { if (!loading) otp.handleChange(i, e.target.value); }}
              onKeyDown={(e) => { if (!loading) otp.handleKeyDown(i, e); }}
              onPaste={i === 0 ? (otp.handlePaste as React.ClipboardEventHandler<HTMLInputElement>) : undefined}
              className="w-full h-full border-0 outline-none bg-transparent text-center text-sm sm:text-lg lg:text-xl font-bold text-foreground font-sans disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      {hasActions && (
        <>
          {/* Timer — always rendered so it appears as soon as the hook restores */}
          <div className="text-center mt-3 sm:mt-4 min-h-5">
            {timer.secondsLeft > 0 && (
              <p className={cn(
                "text-xs sm:text-sm font-semibold font-sans transition-colors duration-300",
                timer.secondsLeft <= 60 ? "text-amber-500" : "text-muted-foreground",
              )}>
                {t(`${tPrefix}.code_expires`, { time: formatTimeLeft(timer.secondsLeft) })}
              </p>
            )}
            {timer.isExpired && (
              <p className="text-xs sm:text-sm font-semibold font-sans text-destructive">
                {t(`${tPrefix}.code_expired`)}
              </p>
            )}
          </div>

          {/* Single action button — toggles between Verify and Resend when expired */}
          {timer.isExpired && onResend ? (
            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="w-full mt-4 sm:mt-5 font-sans font-semibold text-sm sm:text-base"
              disabled={resendLoading}
              loading={resendLoading}
              onClick={onResend}
            >
              {resendLoading ? t(`${tPrefix}.btn_resending`) : (
                <>
                  <RefreshCw className="size-3.5 sm:size-4" />
                  {t(`${tPrefix}.btn_resend`)}
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="w-full mt-4 sm:mt-5 font-sans font-semibold text-sm sm:text-base"
              disabled={timer.isExpired || otp.otpCode.join("").length < OTP_CODE_LENGTH}
              loading={loading}
              onClick={!loading ? onVerify : undefined}
            >
              {loading ? t(tPrefix === "signin" ? `${tPrefix}.btn_verifying` : `${tPrefix}.btn_creating`) : (
                <>
                  {t(`${tPrefix}.btn_verify`)}
                  <ArrowRight className="size-3.5 sm:size-4" />
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default AppOtpVerifyStep;
