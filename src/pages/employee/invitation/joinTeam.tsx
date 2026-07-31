"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2, Mail, Building2, BadgeCheck,
  Clock, AlertCircle, User,
} from "lucide-react";
import {
  useInvitationDetailsQuery,
  useRespondToInvitationMutation,
} from "@/modules/company/employees/queries";
import Shell from "@/modules/employee/invitation/components/Shell";
import InfoRow from "@/modules/employee/invitation/components/InfoRow";
import LoadingScreen from "@/modules/shared/ui/LoadingScreen";
import AppOtpVerifyStep from "@/modules/shared/ui/AppOtpVerifyStep";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { ROLES } from "@/modules/shared/constants/employee";
import { useVerifyOtp, useOtpFlow } from "@/modules/auth/shared/hooks";
import { authApi } from "@/modules/auth/shared/api";

interface InvitationDetails {
  email?: string;
  role?: string;
  company?: { name?: string; email?: string };
  invitedBy?: { name?: string };
  expiresAt?: string;
}

// Map legacy backend role strings → ROLES array value
const ROLE_VALUE_MAP: Record<string, string> = {
  RH:         "hr",
  Manager:    "manager",
  TechLead:   "technical_leader",
  Supervisor: "supervisor",
  Owner:      "owner",
};

function resolveRole(roleStr: string | undefined) {
  if (!roleStr) return { label: "Member", color: "#6B7280", Icon: null };
  const normalized = roleStr.toLowerCase().replace(/\s+/g, "_");
  const key   = ROLE_VALUE_MAP[roleStr] ?? normalized;
  const entry = ROLES.find((r) => r.value === key);
  return {
    label: entry?.label ?? roleStr,
    color: entry?.color ?? "#6B7280",
    Icon:  entry?.icon  ?? null,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
const JoinTeamPage: React.FC = () => {
  const router = useRouter();
  const { invitationId, token } = router.query;

  const invId = router.isReady && typeof invitationId === "string" ? invitationId : undefined;

  const { data: inv, isLoading, error: fetchError } = useInvitationDetailsQuery(invId);
  const respondMutation = useRespondToInvitationMutation();

  const [step,        setStep]        = useState<"form" | "otp">("form");
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // ── OTP flow ────────────────────────────────────────────────────────────────
  const verifyMutation = useVerifyOtp(() => {
    router.push("/employee/dashboard");
  });

  const resendMutation = useMutation({
    mutationFn: ({ email, signal }: { email: string; signal?: AbortSignal }) =>
      authApi.resendOtp(email, undefined, signal),
  });

  const otpFlow = useOtpFlow({
    storageKey:     "jointeam_otp",
    verifyMutation,
    resendMutation,
  });

  // ── Accept handler ─────────────────────────────────────────────────────────
  const handleAccept = async () => {
    const errs: typeof fieldErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim())  errs.lastName  = "Last name is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setAcceptError(null);

    try {
      await respondMutation.mutateAsync({
        invitationId: invitationId as string,
        action:    "accept",
        token:     token as string,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
      });
      localStorage.setItem("userType", "Employee");
      otpFlow.timer.start();
      setStep("otp");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? "Failed to accept invitation. Please try again.";
      setAcceptError(msg);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!router.isReady || isLoading) {
    return <LoadingScreen title="Loading invitation…" />;
  }

  // ── Error / not found ─────────────────────────────────────────────────────
  if (fetchError || !inv) {
    return (
      <Shell>
        <Card className="gap-0 py-0 overflow-hidden text-center">
          <CardContent className="py-10 flex flex-col items-center gap-3">
            <div className="size-14 rounded-2xl bg-destructive/8 flex items-center justify-center">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <p className="font-bold text-base text-card-foreground">Invalid Invitation</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {(fetchError as Error)?.message || "This invitation is no longer valid or has expired."}
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  // ── OTP step ──────────────────────────────────────────────────────────────
  if (step === "otp") {
    const email = inv.email as string;
    return (
      <Shell>
        <Card className="gap-0 py-0 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/40 rounded-t-xl" />
          <CardContent className="py-7 px-6">
            <AppOtpVerifyStep
              savedEmail={email}
              otp={otpFlow.otp}
              tPrefix="signin"
              loading={otpFlow.verifyLoading}
              timer={otpFlow.timer}
              resendLoading={otpFlow.resendLoading}
              onVerify={() => otpFlow.verifyCode(email)}
              onResend={() => otpFlow.resendCode(email)}
            />
          </CardContent>
        </Card>
      </Shell>
    );
  }

  // ── Resolve role + company ────────────────────────────────────────────────
  const invDetails  = inv as InvitationDetails;
  const roleStr     = invDetails.role;
  const role        = resolveRole(roleStr);
  const companyName = invDetails.company?.name || invDetails.invitedBy?.name || invDetails.company?.email || "Your Company";
  const RoleIcon    = role.Icon;

  return (
    <Shell>
      <Card className="gap-0 py-0 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/40 rounded-t-xl" />

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-5 border-b border-border">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-card-foreground leading-tight">Team Invitation</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              <span className="font-semibold text-foreground">{companyName}</span>
              {" "}has invited you to join their team
            </p>
          </div>
        </div>

        {/* Info rows */}
        <div className="border-b border-border">
          <InfoRow icon={<Building2 />} label="Organization" value={companyName} iconColor="#0D9488" />
          <InfoRow
            icon={<BadgeCheck />}
            label="Role"
            value={
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold"
                style={{
                  color:           role.color,
                  backgroundColor: `${role.color}12`,
                  borderColor:     `${role.color}28`,
                }}
              >
                {RoleIcon && <RoleIcon size={11} />}
                {role.label}
              </span>
            }
            iconColor={role.color}
          />
          {inv.email && (
            <InfoRow icon={<Mail />} label="Email" value={inv.email} iconColor="#0891B2" />
          )}
          {invDetails.expiresAt && (
            <InfoRow
              icon={<Clock />}
              label="Expires"
              value={new Date(invDetails.expiresAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
              iconColor="var(--color-muted-foreground, #94a3b8)"
              last
            />
          )}
        </div>

        {/* Registration form */}
        <CardContent className="py-5 space-y-4">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <User className="size-3.5" />
            Your Details
          </p>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-invalid={!!fieldErrors.firstName}
              />
              {fieldErrors.firstName && (
                <p className="text-[11px] text-destructive">{fieldErrors.firstName}</p>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-invalid={!!fieldErrors.lastName}
              />
              {fieldErrors.lastName && (
                <p className="text-[11px] text-destructive">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {acceptError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-px shrink-0" />
              <span>{acceptError}</span>
            </div>
          )}

          <Button
            className="w-full gap-2 h-10 rounded-xl text-sm font-semibold"
            onClick={handleAccept}
            loading={respondMutation.isPending}
          >
            <CheckCircle2 className="size-4" />
            {respondMutation.isPending ? "Joining…" : "Accept & Create Account"}
          </Button>
        </CardContent>
      </Card>
    </Shell>
  );
};

export default JoinTeamPage;
