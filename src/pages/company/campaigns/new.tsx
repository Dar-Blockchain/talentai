"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  CheckCircle2, Clock, Users,
  Eye, EyeOff, Link2, Lock, ArrowRight, ArrowLeft,
  Sparkles, Type, ClipboardList,
} from "lucide-react";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import { ModuleType, CreateCampaignPayload, CreateCampaignForm } from "@/modules/company/campaigns/types/campaign";
import { MODULE_CONFIG } from "@/modules/shared/constants/campaign";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { DatePicker } from "@/modules/shared/ui/DatePicker";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCreateCampaignMutation } from "@/modules/company/campaigns/queries";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import ParticipantsStep from "@/modules/company/campaigns/components/new/ParticipantsStep";

// ─── Option data ──────────────────────────────────────────────────────────────

const ACCESS_OPTIONS = [
  {
    value: "LINK",
    label: "Shareable Link",
    desc: "Anyone with the link can participate — no account required",
    Icon: Link2,
    color: "#059669",
  },
  {
    value: "ACCOUNTS",
    label: "Platform Accounts",
    desc: "Employees log in and see campaigns in their dashboard",
    Icon: Lock,
    color: "#4F46E5",
  },
];

const ANONYMITY_OPTIONS = [
  {
    value: "NOMINATIVE",
    label: "Nominative",
    desc: "Names visible to organizers",
    Icon: Eye,
    color: "#0369A1",
  },
  {
    value: "ANONYMOUS",
    label: "Anonymous",
    desc: "Responses fully anonymized",
    Icon: EyeOff,
    color: "#7C3AED",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground mb-2">
    {children}
  </p>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-xs text-destructive mt-1">{message}</p> : null;

const OptionCard: React.FC<{
  isSelected: boolean;
  onClick: () => void;
  color: string;
  Icon: React.ElementType;
  label: string;
  desc: string;
}> = ({ isSelected, onClick, color, Icon, label, desc }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border-[1.5px] transition-all duration-150 select-none"
    style={{
      borderColor:     isSelected ? color : undefined,
      backgroundColor: isSelected ? `${color}08` : undefined,
    }}
  >
    <div
      className="size-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}${isSelected ? "18" : "12"}` }}
    >
      <Icon className="size-3.5" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-bold text-card-foreground leading-snug">{label}</p>
      <p className="text-[10.5px] text-muted-foreground leading-snug">{desc}</p>
    </div>
    {isSelected && <CheckCircle2 className="size-3.5 shrink-0" style={{ color }} />}
  </div>
);

const CardSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBg: string;
  children: React.ReactNode;
  className?: string;
}> = ({ icon, title, subtitle, iconBg, children, className }) => (
  <Card className={cn("gap-0 py-0 overflow-hidden", className)}>
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60">
      <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-bold text-card-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </Card>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const NewCampaignPage: NextPageWithLayout = () => {
  useCompanyAccess("canCreateCampaign");
  const createMutation = useCreateCampaignMutation();
  const { showToast } = useToast();
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  const [activeStep, setActiveStep] = useState(0);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignForm>({
    mode: "onChange",
    defaultValues: {
      title:         "",
      description:   "",
      anonymityMode: "" as "NOMINATIVE" | "ANONYMOUS",
      accessMethod:  "" as "LINK" | "ACCOUNTS",
      module:        "" as ModuleType,
      deadline:      "",
    },
  });

  const accessMethod = watch("accessMethod");
  const isAccounts   = accessMethod === "ACCOUNTS";

  const handleNext = async () => {
    const valid = await trigger(["title", "description", "module", "anonymityMode", "accessMethod"]);
    if (valid) setActiveStep(1);
  };

  const onSubmit = async (data: CreateCampaignForm) => {
    try {
      const payload: CreateCampaignPayload = {
        ...data,
        module: { type: data.module, config: null },
        ...(selectedParticipants.length > 0 && { participants: selectedParticipants }),
      };
      const campaign = await createMutation.mutateAsync(payload);
      showToast({ message: "Campaign created successfully", severity: "success" });
      router.push(`/company/campaigns/${campaign._id}`);
    } catch (error: any) {
      showToast({
        message: error?.message || error?.response?.data?.message || "Something went wrong",
        severity: "error",
      });
    }
  };

  return (
    <>
      <PageHeader
        title={t("pages.campaigns.wizard_new.title")}
        subtitle={t("pages.campaigns.wizard_new.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.campaigns.title"), href: "/company/campaigns" },
          { label: t("pages.campaigns.wizard_new.breadcrumb_create") },
        ]}
      />


      <div className="flex flex-col gap-4">

        {/* ── STEP 1: Campaign Details ── */}
        {activeStep === 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

              {/* ── Left column: Basic Info + Module ── */}
              <div className="lg:col-span-3 flex flex-col gap-4">

                {/* Basic Information */}
                <CardSection
                  icon={<Type className="size-4 text-white" />}
                  title="Basic Information"
                  subtitle="Name and description of your campaign"
                  iconBg="linear-gradient(135deg, #6366F1, #8B5CF6)"
                >
                  <div className="flex flex-col gap-3">
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: "Title is required" }}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
                            Campaign Title <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., Q4 Engineering Skills Assessment"
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError message={fieldState.error?.message} />
                        </div>
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      rules={{ required: "Description is required" }}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
                            Description <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the purpose, goals and expected outcomes…"
                            rows={2}
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                          <FieldError message={fieldState.error?.message} />
                        </div>
                      )}
                    />
                  </div>
                </CardSection>

                {/* Assessment Module */}
                <CardSection
                  icon={<ClipboardList className="size-4 text-white" />}
                  title="Assessment Module"
                  subtitle="Choose one module for this campaign"
                  iconBg="linear-gradient(135deg, #8B5CF6, #EC4899)"
                >
                  <Controller
                    name="module"
                    control={control}
                    rules={{ validate: (v) => !!v || "Select a module" }}
                    render={({ field }) => (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(Object.keys(MODULE_CONFIG) as ModuleType[]).map((mod) => {
                            const m          = MODULE_CONFIG[mod];
                            const Icon       = m.icon;
                            const isSelected = field.value === mod;
                            const isSoon     = mod === "TRAINING_PATH";
                            return (
                              <div
                                key={mod}
                                onClick={() => { if (!isSoon) field.onChange(isSelected ? "" : mod); }}
                                className={cn(
                                  "flex items-center gap-2.5 p-2.5 rounded-xl border-[1.5px] transition-all duration-150 select-none",
                                  isSoon ? "cursor-not-allowed opacity-55" : "cursor-pointer",
                                )}
                                style={{
                                  borderColor:     isSelected ? m.color : undefined,
                                  backgroundColor: isSelected ? `${m.color}08` : undefined,
                                }}
                              >
                                <div
                                  className="size-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${m.color}${isSelected ? "18" : "12"}` }}
                                >
                                  <Icon size={14} color={m.color} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <p className="text-[12px] font-bold text-card-foreground truncate">{m.label}</p>
                                  {isSoon && (
                                    <span className="inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-violet-50 text-violet-600 border border-violet-200 shrink-0">
                                      Soon
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="size-3.5 shrink-0" style={{ color: m.color }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <FieldError message={errors.module?.message} />
                      </div>
                    )}
                  />
                </CardSection>
              </div>

              {/* ── Right column: Campaign Settings ── */}
              <div className="lg:col-span-2">
                <CardSection
                  icon={<Clock className="size-4 text-white" />}
                  title="Campaign Settings"
                  subtitle="Deadline, visibility and access"
                  iconBg="linear-gradient(135deg, #059669, #0D9488)"
                >
                  <div className="flex flex-col gap-4">

                    {/* Deadline */}
                    <div>
                      <SectionLabel>Application Deadline</SectionLabel>
                      <Controller
                        name="deadline"
                        control={control}
                        rules={{
                          validate: (v) =>
                            v && dayjs(v).isBefore(dayjs(), "day")
                              ? "Deadline cannot be in the past"
                              : true,
                        }}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Pick a deadline date"
                            minDate={new Date()}
                            clearable
                            error={errors.deadline?.message}
                          />
                        )}
                      />
                    </div>

                    <hr className="border-border/60" />

                    {/* Anonymity */}
                    <div>
                      <SectionLabel>Anonymity Mode</SectionLabel>
                      <Controller
                        name="anonymityMode"
                        control={control}
                        rules={{ required: "Please select an anonymity mode" }}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-col gap-2">
                              {ANONYMITY_OPTIONS.map((opt) => (
                                <OptionCard
                                  key={opt.value}
                                  isSelected={field.value === opt.value}
                                  onClick={() => field.onChange(opt.value)}
                                  {...opt}
                                />
                              ))}
                            </div>
                            <FieldError message={errors.anonymityMode?.message} />
                          </div>
                        )}
                      />
                    </div>

                    <hr className="border-border/60" />

                    {/* Access Method */}
                    <div>
                      <SectionLabel>Access Method</SectionLabel>
                      <Controller
                        name="accessMethod"
                        control={control}
                        rules={{ required: "Please select an access method" }}
                        render={({ field }) => (
                          <div>
                            <div className="flex flex-col gap-2">
                              {ACCESS_OPTIONS.map((opt) => (
                                <OptionCard
                                  key={opt.value}
                                  isSelected={field.value === opt.value}
                                  onClick={() => field.onChange(opt.value)}
                                  {...opt}
                                />
                              ))}
                            </div>
                            <FieldError message={errors.accessMethod?.message} />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </CardSection>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    {isAccounts ? "Almost there!" : "Ready to launch?"}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {isAccounts
                      ? "Next you'll select who can participate."
                      : "Review your settings above before creating."}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="gap-2 px-6 w-full sm:w-auto"
                loading={!isAccounts && isSubmitting}
                onClick={isAccounts ? handleNext : handleSubmit(onSubmit)}
              >
                {isAccounts ? "Next: Participants" : isSubmitting ? "Creating…" : "Create Campaign"}
                {isAccounts ? <ArrowRight className="size-4" /> : <Sparkles className="size-4" />}
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 2: Participants ── */}
        {activeStep === 1 && (
          <Card className="gap-0 py-0 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
              <div
                className="size-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #10B981, #0D9488)" }}
              >
                <Users className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-card-foreground">Who Can Participate</p>
                <p className="text-[11.5px] text-muted-foreground">Leave empty to allow all employees</p>
              </div>
            </div>

            <div className="p-5">
              <ParticipantsStep selected={selectedParticipants} onChange={setSelectedParticipants} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-border/60 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 w-full sm:w-auto"
                onClick={() => setActiveStep(0)}
              >
                <ArrowLeft className="size-4" />
                Back to Details
              </Button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {selectedParticipants.length > 0 && (
                  <span className="text-[12px] text-muted-foreground text-center sm:text-left">
                    <span className="font-semibold text-foreground">{selectedParticipants.length}</span> participant{selectedParticipants.length !== 1 ? "s" : ""} selected
                  </span>
                )}
                <Button
                  type="button"
                  className="gap-2 px-6 w-full sm:w-auto"
                  loading={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                >
                  {isSubmitting ? "Creating…" : "Create Campaign"}
                  <Sparkles className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
NewCampaignPage.getLayout = getDashboardLayout;

export default NewCampaignPage;
