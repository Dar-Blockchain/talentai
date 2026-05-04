"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  FormControl,
  FormHelperText,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Checklist as ChecklistIcon,
  PeopleAlt as PeopleAltIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  InsertLink as InsertLinkIcon,
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  TitleOutlined as TitleIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppInput from "@/components/ui/AppInput";
import { AppDatePicker } from "@/components/ui/DatePicker";
import {
  ModuleType,
  CreateCampaignPayload,
  CreateCampaignForm,
} from "@/types/campaign";
import { MODULE_CONFIG } from "@/constants/campaign";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { AppDispatch } from "@/store/store";
import { createCampaign } from "@/store/slices/campaignSlice";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import ParticipantsStep from "@/components/features/company/campaigns/new/ParticipantsStep";

// ─── Palette ─────────────────────────────────────────────────────────────────

const P = {
  indigo:      "#6366F1",
  indigoDark:  "#4F46E5",
  indigoLight: "#EEF2FF",
  violet:      "#8B5CF6",
  violetLight: "#F5F3FF",
  emerald:     "#10B981",
  emeraldLight:"#ECFDF5",
  slate50:     "#F8FAFC",
  slate100:    "#F1F5F9",
  slate200:    "#E2E8F0",
  slate400:    "#94A3B8",
  slate600:    "#475569",
  slate700:    "#334155",
  slate800:    "#1E293B",
  white:       "#FFFFFF",
};

// ─── Options ─────────────────────────────────────────────────────────────────

const ACCESS_OPTIONS = [
  {
    value: "LINK",
    label: "Shareable Link",
    desc: "Anyone with the link can participate — no account required",
    Icon: InsertLinkIcon,
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    value: "ACCOUNTS",
    label: "Platform Accounts",
    desc: "Employees log in and see campaigns in their dashboard",
    Icon: LockIcon,
    color: "#4F46E5",
    bg: "#EEF2FF",
  },
];

const ANONYMITY_OPTIONS = [
  {
    value: "NOMINATIVE",
    label: "Nominative",
    desc: "Names visible to organizers",
    Icon: VisibilityIcon,
    color: "#0369A1",
    bg: "#F0F9FF",
  },
  {
    value: "ANONYMOUS",
    label: "Anonymous",
    desc: "Responses fully anonymized",
    Icon: VisibilityOffIcon,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
];

const STEPS = [
  { label: "Campaign Details", icon: SettingsIcon },
  { label: "Participants",     icon: PeopleAltIcon },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{
    fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
    textTransform: "uppercase", color: P.slate400, mb: 1.5,
  }}>
    {children}
  </Typography>
);

const OptionCard: React.FC<{
  isSelected: boolean;
  onClick: () => void;
  color: string;
  bg: string;
  Icon: React.ElementType;
  label: string;
  desc: string;
}> = ({ isSelected, onClick, color, bg, Icon, label, desc }) => (
  <Box
    onClick={onClick}
    sx={{
      position: "relative",
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      p: 2,
      borderRadius: "14px",
      cursor: "pointer",
      border: `1.5px solid ${isSelected ? color : P.slate200}`,
      bgcolor: isSelected ? alpha(color, 0.05) : P.white,
      transition: "all 0.18s ease",
      "&:hover": {
        borderColor: color,
        bgcolor: alpha(color, 0.03),
        transform: "translateY(-1px)",
        boxShadow: `0 4px 16px ${alpha(color, 0.12)}`,
      },
    }}
  >
    <Box sx={{
      width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
      bgcolor: isSelected ? alpha(color, 0.15) : bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon sx={{ fontSize: 19, color }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: P.slate800, lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: P.slate400, mt: 0.25, lineHeight: 1.4 }}>
        {desc}
      </Typography>
    </Box>
    {isSelected && (
      <CheckCircleIcon sx={{ fontSize: 17, color, flexShrink: 0, mt: 0.25 }} />
    )}
  </Box>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const NewCampaignPage: React.FC = () => {
  useCompanyAccess("canCreateCampaign");
  const dispatch = useDispatch<AppDispatch>();
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
      title: "",
      // type: "" as CampaignType, // TODO: re-enable
      description: "",
      anonymityMode: "" as "NOMINATIVE" | "ANONYMOUS",
      accessMethod: "" as "LINK" | "ACCOUNTS",
      module: "" as ModuleType,
      deadline: "",
    },
  });

  const accessMethod = watch("accessMethod");
  const isAccounts   = accessMethod === "ACCOUNTS";
  // const selectedType = watch("type"); // TODO: re-enable

  const handleNext = async () => {
    const fields: (keyof CreateCampaignForm)[] = [
      "title",
      "description",
      // "type", // TODO: re-enable
      "module",
      "anonymityMode",
      "accessMethod",
    ];
    const valid = await trigger(fields);
    if (valid) setActiveStep(1);
  };

  const onSubmit = async (data: CreateCampaignForm) => {
    try {
      const formattedPayload: CreateCampaignPayload = {
        ...data,
        module: { type: data.module, config: null },
        // type and customType omitted until re-enabled
        ...(selectedParticipants.length > 0 && { participants: selectedParticipants }),
      };
      const campaign = await dispatch(createCampaign(formattedPayload)).unwrap();
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
    <DashboardLayout>
      <PageHeader
        title={t("pages.campaigns.wizard_new.title")}
        subtitle={t("pages.campaigns.wizard_new.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.campaigns.title"), href: "/company/campaigns" },
          { label: t("pages.campaigns.wizard_new.breadcrumb_create") },
        ]}
      />

      {/* ── Stepper ── */}
      {isAccounts && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 0 }}>
          {STEPS.map((step, i) => {
            const isComplete = activeStep > i;
            const isActive   = activeStep === i;
            return (
              <React.Fragment key={step.label}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75,
                  borderRadius: 99, bgcolor: isActive ? alpha(P.indigo, 0.08) : "transparent",
                  transition: "all 0.2s" }}>
                  <Box sx={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: isComplete || isActive ? P.indigo : P.slate200,
                    transition: "all 0.2s",
                  }}>
                    {isComplete
                      ? <CheckIcon sx={{ fontSize: 13, color: "#fff" }} />
                      : <Typography sx={{ fontSize: 11, fontWeight: 800, color: isActive ? "#fff" : P.slate400, lineHeight: 1 }}>{i + 1}</Typography>
                    }
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive || isComplete ? P.indigo : P.slate400, whiteSpace: "nowrap" }}>
                    {step.label}
                  </Typography>
                </Box>
                {i < STEPS.length - 1 && (
                  <Box sx={{ flex: 1, mx: 1, height: 2, borderRadius: 99, bgcolor: P.slate200, overflow: "hidden", position: "relative" }}>
                    <Box sx={{ position: "absolute", inset: 0, borderRadius: 99, bgcolor: P.indigo,
                      transform: isComplete ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left",
                      transition: "transform 0.4s ease" }} />
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      )}

      {/* ── Main layout ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, alignItems: "start" }}>

        {/* ── Left: Form ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* ── STEP 1 ── */}
          {activeStep === 0 && (
            <>
              {/* Basic Info */}
              <Box sx={{ bgcolor: P.white, borderRadius: "18px", border: `1px solid ${P.slate200}`, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${P.slate100}`,
                  background: `linear-gradient(135deg, ${alpha(P.indigo, 0.04)} 0%, ${alpha(P.violet, 0.04)} 100%)`,
                  display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "10px",
                    background: `linear-gradient(135deg, ${P.indigo}, ${P.violet})`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TitleIcon sx={{ fontSize: 17, color: "#fff" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: P.slate800 }}>Basic Information</Typography>
                    <Typography sx={{ fontSize: 11.5, color: P.slate400 }}>Name and description of your campaign</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Controller
                    name="title"
                    control={control}
                    rules={{ required: "Title is required" }}
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Campaign Title"
                        placeholder="e.g., Q4 Engineering Skills Assessment"
                        required
                        {...field}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field, fieldState }) => (
                      <AppInput
                        label="Description"
                        placeholder="Describe the purpose, goals and expected outcomes..."
                        required
                        multiline
                        rows={3}
                        {...field}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Settings */}
              <Box sx={{ bgcolor: P.white, borderRadius: "18px", border: `1px solid ${P.slate200}`, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${P.slate100}`,
                  background: `linear-gradient(135deg, ${alpha("#059669", 0.04)} 0%, ${alpha("#0D9488", 0.04)} 100%)`,
                  display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "10px",
                    background: "linear-gradient(135deg, #059669, #0D9488)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScheduleIcon sx={{ fontSize: 17, color: "#fff" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: P.slate800 }}>Campaign Settings</Typography>
                    <Typography sx={{ fontSize: 11.5, color: P.slate400 }}>Deadline, visibility and access configuration</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>

                  {/* Deadline */}
                  <Box>
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
                        <AppDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.deadline?.message}
                          disablePast
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </Box>

                  <Divider sx={{ borderColor: P.slate100 }} />

                  {/* Anonymity */}
                  <Box>
                    <SectionLabel>Anonymity Mode</SectionLabel>
                    <Controller
                      name="anonymityMode"
                      control={control}
                      rules={{ required: "Please select an anonymity mode" }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.anonymityMode}>
                          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                            {ANONYMITY_OPTIONS.map((opt) => (
                              <OptionCard
                                key={opt.value}
                                isSelected={field.value === opt.value}
                                onClick={() => field.onChange(opt.value)}
                                {...opt}
                              />
                            ))}
                          </Box>
                          {errors.anonymityMode && (
                            <FormHelperText sx={{ ml: 0, mt: 0.75 }}>{errors.anonymityMode.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>

                  <Divider sx={{ borderColor: P.slate100 }} />

                  {/* Access Method */}
                  <Box>
                    <SectionLabel>Access Method</SectionLabel>
                    <Controller
                      name="accessMethod"
                      control={control}
                      rules={{ required: "Please select an access method" }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.accessMethod}>
                          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                            {ACCESS_OPTIONS.map((opt) => (
                              <OptionCard
                                key={opt.value}
                                isSelected={field.value === opt.value}
                                onClick={() => field.onChange(opt.value)}
                                {...opt}
                              />
                            ))}
                          </Box>
                          {errors.accessMethod && (
                            <FormHelperText sx={{ ml: 0, mt: 0.75 }}>{errors.accessMethod.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Modules */}
              <Box sx={{ bgcolor: P.white, borderRadius: "18px", border: `1px solid ${P.slate200}`, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${P.slate100}`,
                  background: `linear-gradient(135deg, ${alpha(P.violet, 0.04)} 0%, ${alpha("#EC4899", 0.04)} 100%)`,
                  display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "10px",
                    background: `linear-gradient(135deg, ${P.violet}, #EC4899)`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChecklistIcon sx={{ fontSize: 17, color: "#fff" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: P.slate800 }}>Assessment Module</Typography>
                    <Typography sx={{ fontSize: 11.5, color: P.slate400 }}>Choose one module for this campaign</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Controller
                    name="module"
                    control={control}
                    rules={{ validate: (v) => !!v || "Select a module" }}
                    render={({ field }) => (
                      <FormControl error={!!errors.module} fullWidth>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                          {Object.keys(MODULE_CONFIG).map((mod) => {
                            const m = MODULE_CONFIG[mod as ModuleType];
                            const Icon = m.icon;
                            const isSelected   = field.value === mod;
                            const isComingSoon = mod === "TRAINING_PATH";
                            return (
                              <Box
                                key={mod}
                                onClick={() => { if (!isComingSoon) field.onChange(isSelected ? "" : mod); }}
                                sx={{
                                  position: "relative",
                                  display: "flex", alignItems: "flex-start", gap: 1.5,
                                  p: 2, borderRadius: "14px", cursor: isComingSoon ? "not-allowed" : "pointer",
                                  border: `1.5px solid ${isSelected ? m.color : P.slate200}`,
                                  bgcolor: isSelected ? alpha(m.color, 0.05) : P.white,
                                  opacity: isComingSoon ? 0.55 : 1,
                                  transition: "all 0.18s ease",
                                  ...(!isComingSoon && {
                                    "&:hover": {
                                      borderColor: m.color,
                                      bgcolor: alpha(m.color, 0.03),
                                      transform: "translateY(-1px)",
                                      boxShadow: `0 4px 16px ${alpha(m.color, 0.12)}`,
                                    },
                                  }),
                                }}
                              >
                                <Box sx={{
                                  width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
                                  bgcolor: isSelected ? alpha(m.color, 0.15) : alpha(m.color, 0.08),
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  <Icon sx={{ fontSize: 19, color: m.color }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: P.slate800 }}>
                                      {m.label}
                                    </Typography>
                                    {isComingSoon && (
                                      <Box sx={{ px: 0.75, py: "1px", borderRadius: 99,
                                        bgcolor: P.violetLight, border: `1px solid #DDD6FE`,
                                        display: "inline-flex" }}>
                                        <Typography sx={{ fontSize: 9, fontWeight: 800, color: P.violet,
                                          letterSpacing: 0.6, textTransform: "uppercase" }}>
                                          Soon
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                  <Typography sx={{ fontSize: 11.5, color: P.slate400, mt: 0.25, lineHeight: 1.4 }}>
                                    {m.description}
                                  </Typography>
                                </Box>
                                {isSelected && (
                                  <CheckCircleIcon sx={{ fontSize: 17, color: m.color, flexShrink: 0, mt: 0.25 }} />
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                        {errors.module && (
                          <FormHelperText error sx={{ mt: 0.75 }}>{errors.module.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>

              {/* Action */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                <Box
                  onClick={isAccounts ? handleNext : handleSubmit(onSubmit)}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 1.5,
                    px: 3.5, py: 1.25, borderRadius: "12px", cursor: "pointer",
                    background: `linear-gradient(135deg, ${P.indigo}, ${P.violet})`,
                    boxShadow: `0 4px 20px ${alpha(P.indigo, 0.35)}`,
                    transition: "all 0.2s",
                    "&:hover": { transform: "translateY(-1px)", boxShadow: `0 6px 24px ${alpha(P.indigo, 0.45)}` },
                    "&:active": { transform: "translateY(0)" },
                    ...((!isAccounts && isSubmitting) && { opacity: 0.6, pointerEvents: "none" }),
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {isAccounts ? "Next: Who Can Participate" : isSubmitting ? "Creating…" : "Create Campaign"}
                  </Typography>
                  {isAccounts
                    ? <ArrowForwardIcon sx={{ fontSize: 16, color: "#fff" }} />
                    : <AutoAwesomeIcon sx={{ fontSize: 16, color: "#fff" }} />
                  }
                </Box>
              </Box>
            </>
          )}

          {/* ── STEP 2 ── */}
          {activeStep === 1 && (
            <Box sx={{ bgcolor: P.white, borderRadius: "18px", border: `1px solid ${P.slate200}`, overflow: "hidden" }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${P.slate100}`,
                background: `linear-gradient(135deg, ${alpha(P.emerald, 0.04)} 0%, ${alpha("#0D9488", 0.04)} 100%)`,
                display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "10px",
                  background: `linear-gradient(135deg, ${P.emerald}, #0D9488)`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PeopleAltIcon sx={{ fontSize: 17, color: "#fff" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: P.slate800 }}>Who Can Participate</Typography>
                  <Typography sx={{ fontSize: 11.5, color: P.slate400 }}>Leave empty to allow all employees</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 3 }}>
                <ParticipantsStep selected={selectedParticipants} onChange={setSelectedParticipants} />
              </Box>
              <Box sx={{ px: 3, py: 2.5, borderTop: `1px solid ${P.slate100}`,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  onClick={() => setActiveStep(0)}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 1,
                    px: 2.5, py: 1, borderRadius: "10px", cursor: "pointer",
                    border: `1.5px solid ${P.slate200}`, bgcolor: P.white,
                    transition: "all 0.18s",
                    "&:hover": { borderColor: P.slate400, bgcolor: P.slate50 },
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 15, color: P.slate600 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: P.slate600 }}>Back</Typography>
                </Box>
                <Box
                  onClick={handleSubmit(onSubmit)}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 1.5,
                    px: 3.5, py: 1.25, borderRadius: "12px", cursor: "pointer",
                    background: `linear-gradient(135deg, ${P.emerald}, #0D9488)`,
                    boxShadow: `0 4px 20px ${alpha(P.emerald, 0.35)}`,
                    transition: "all 0.2s",
                    "&:hover": { transform: "translateY(-1px)", boxShadow: `0 6px 24px ${alpha(P.emerald, 0.45)}` },
                    ...(isSubmitting && { opacity: 0.6, pointerEvents: "none" }),
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {isSubmitting ? "Creating…" : "Create Campaign"}
                  </Typography>
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: "#fff" }} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>

      </Box>
    </DashboardLayout>
  );
};

export default NewCampaignPage;
