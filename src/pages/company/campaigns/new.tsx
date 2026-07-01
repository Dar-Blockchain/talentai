"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Check, CheckCircle2, Clock, Users, Settings,
  Eye, EyeOff, Link2, Lock, ArrowRight, ArrowLeft,
  Sparkles, Type, ClipboardList, CalendarIcon,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { Calendar } from "@/modules/shared/ui/shadcn/calendar";
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
  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground mb-3">
    {children}
  </p>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-xs text-destructive mt-1.5">{message}</p> : null;

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
    className="relative flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border-[1.5px] transition-all duration-150 hover:-translate-y-px select-none"
    style={{
      borderColor:     isSelected ? color : undefined,
      backgroundColor: isSelected ? `${color}08` : undefined,
    }}
  >
    <div
      className="size-9 rounded-[10px] flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}${isSelected ? "18" : "10"}` }}
    >
      <Icon className="size-[18px]" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-card-foreground leading-snug">{label}</p>
      <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
    </div>
    {isSelected && <CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color }} />}
  </div>
);

const CardSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBg: string;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, iconBg, children }) => (
  <Card className="gap-0 py-0 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
      <div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-card-foreground">{title}</p>
        <p className="text-[11.5px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

const DatePickerField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 h-10 text-sm font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            {value ? dayjs(value).format("MMM D, YYYY") : "Pick a deadline date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => { onChange(date ? date.toISOString() : ""); setOpen(false); }}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear date
        </button>
      )}
      <FieldError message={error} />
    </div>
  );
};

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

      {/* ── Stepper (only when ACCOUNTS access method chosen) ── */}
      {isAccounts && (
        <div className="flex items-center mb-6 gap-0">
          {[
            { label: "Campaign Details", icon: Settings },
            { label: "Participants",     icon: Users },
          ].map((step, i) => {
            const isComplete = activeStep > i;
            const isActive   = activeStep === i;
            return (
              <React.Fragment key={step.label}>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
                  isActive ? "bg-primary/10" : "",
                )}>
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-colors shrink-0",
                    isComplete || isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                  )}>
                    {isComplete ? <Check className="size-3" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[13px] whitespace-nowrap transition-colors",
                    isActive || isComplete ? "font-bold text-primary" : "text-muted-foreground",
                  )}>
                    {step.label}
                  </span>
                </div>
                {i === 0 && (
                  <div className="flex-1 mx-2 h-0.5 rounded-full bg-border overflow-hidden relative">
                    <div className={cn(
                      "absolute inset-0 rounded-full bg-primary transition-transform duration-500 origin-left",
                      isComplete ? "scale-x-100" : "scale-x-0",
                    )} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-4">

        {/* ── STEP 1: Campaign Details ── */}
        {activeStep === 0 && (
          <>
            {/* Basic Information */}
            <CardSection
              icon={<Type className="size-4 text-white" />}
              title="Basic Information"
              subtitle="Name and description of your campaign"
              iconBg="linear-gradient(135deg, #6366F1, #8B5CF6)"
            >
              <div className="flex flex-col gap-4">
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
                        rows={3}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                      <FieldError message={fieldState.error?.message} />
                    </div>
                  )}
                />
              </div>
            </CardSection>

            {/* Campaign Settings */}
            <CardSection
              icon={<Clock className="size-4 text-white" />}
              title="Campaign Settings"
              subtitle="Deadline, visibility and access configuration"
              iconBg="linear-gradient(135deg, #059669, #0D9488)"
            >
              <div className="flex flex-col gap-5">

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
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(Object.keys(MODULE_CONFIG) as ModuleType[]).map((mod) => {
                        const m           = MODULE_CONFIG[mod];
                        const Icon        = m.icon;
                        const isSelected  = field.value === mod;
                        const isSoon      = mod === "TRAINING_PATH";
                        return (
                          <div
                            key={mod}
                            onClick={() => { if (!isSoon) field.onChange(isSelected ? "" : mod); }}
                            className={cn(
                              "relative flex items-start gap-3 p-3.5 rounded-xl border-[1.5px] transition-all duration-150 select-none",
                              isSoon ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:-translate-y-px",
                            )}
                            style={{
                              borderColor:     isSelected ? m.color : undefined,
                              backgroundColor: isSelected ? `${m.color}08` : undefined,
                            }}
                          >
                            <div
                              className="size-9 rounded-[10px] flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${m.color}${isSelected ? "18" : "10"}` }}
                            >
                              <Icon style={{ fontSize: 18, color: m.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-[13px] font-bold text-card-foreground">{m.label}</p>
                                {isSoon && (
                                  <span className="inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-violet-50 text-violet-600 border border-violet-200">
                                    Soon
                                  </span>
                                )}
                              </div>
                              <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                                {m.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color: m.color }} />
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

            {/* Action */}
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                size="default"
                className="gap-2 px-6"
                loading={!isAccounts && isSubmitting}
                onClick={isAccounts ? handleNext : handleSubmit(onSubmit)}
              >
                {isAccounts ? "Next: Who Can Participate" : isSubmitting ? "Creating…" : "Create Campaign"}
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

            <div className="flex items-center justify-between px-5 py-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setActiveStep(0)}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="button"
                className="gap-2 px-6"
                loading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? "Creating…" : "Create Campaign"}
                <Sparkles className="size-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
NewCampaignPage.getLayout = getDashboardLayout;

export default NewCampaignPage;
