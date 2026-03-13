"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  FormControl,
  FormHelperText,
  Paper,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  Title as TitleIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Checklist as ChecklistIcon,
  PeopleAlt as PeopleAltIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  InsertLink as InsertLinkIcon,
  Lock as LockIcon,
  AllInclusive as AllInclusiveIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";
import AppSelect from "@/components/ui/AppSelect";
import { AppDatePicker } from "@/components/ui/DatePicker";
import {
  CampaignType,
  ModuleType,
  CreateCampaignPayload,
  CreateCampaignForm,
} from "@/types/campaign";
import { CAMPAIGN_TYPES, MODULE_CONFIG } from "@/constants/campaign";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createCampaign } from "@/store/slices/campaignSlice";
import { useToast } from "@/hooks/useToast";
import FormCard from "@/components/ui/FormCard";
import ParticipantsStep from "@/components/features/company/campaigns/new/ParticipantsStep";

const ANONYMITY_OPTIONS = [
  {
    value: "NOMINATIVE",
    label: "Nominative",
    desc: "Participant names are visible to organizers",
    Icon: VisibilityIcon,
    color: "#2563EB",
  },
  {
    value: "ANONYMOUS",
    label: "Anonymous",
    desc: "Responses are fully anonymized",
    Icon: VisibilityOffIcon,
    color: "#7C3AED",
  },
];

const ACCESS_OPTIONS = [
  {
    value: "LINK",
    label: "Link",
    desc: "Anyone with the link can participate",
    Icon: InsertLinkIcon,
    color: "#059669",
  },
  {
    value: "ACCOUNTS",
    label: "Accounts",
    desc: "Participants must sign in",
    Icon: LockIcon,
    color: "#DC2626",
  },
  {
    value: "BOTH",
    label: "Both",
    desc: "Link access or account login",
    Icon: AllInclusiveIcon,
    color: "#D97706",
  },
];

const STEPS = [
  {
    label: "Basic Info",
    description: "Campaign details & settings",
    icon: SettingsIcon,
  },
  {
    label: "Who Can Participate",
    description: "Select target employees",
    icon: PeopleAltIcon,
  },
];

const NewCampaignPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const theme = useTheme();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignForm>({
    mode: "onChange",
    defaultValues: {
      title: "",
      type: "" as CampaignType,
      description: "",
      anonymityMode: "ANONYMOUS",
      accessMethod: "LINK",
      module: "" as ModuleType,
      deadline: "",
    },
  });

  const handleNext = async () => {
    const valid = await trigger([
      "title",
      "type",
      "module",
      "anonymityMode",
      "accessMethod",
    ]);
    if (valid) setActiveStep(1);
  };

  const onSubmit = async (data: CreateCampaignForm) => {
    try {
      const formattedPayload: CreateCampaignPayload = {
        ...data,
        module: { type: data.module, config: null },
        ...(selectedParticipants.length > 0 && {
          participants: selectedParticipants,
        }),
      };
      const campaign = await dispatch(createCampaign(formattedPayload)).unwrap();

      showToast({
        message: "Campaign created successfully",
        severity: "success",
      });

      router.push(`/company/campaigns/${campaign._id}`);
    } catch (error: any) {
      showToast({
        message:
          error?.message ||
          error?.response?.data?.message ||
          "Something went wrong while creating the campaign",
        severity: "error",
      });
    }
  };

  return (
      <DashboardLayout>
        <PageHeader
          title="Create New Campaign"
          subtitle="Design your assessment campaign"
          breadcrumbs={[
            { label: "Dashboard", href: "/company/dashboard" },
            { label: "Campaigns", href: "/company/campaigns" },
            { label: "Create" },
          ]}
        />

        {/* ── Compact Stepper ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            mb: 3,
            px: 0.5,
          }}
        >
          {STEPS.map((step, index) => {
            const isCompleted = activeStep > index;
            const isActive = activeStep === index;

            return (
              <React.Fragment key={step.label}>
                {/* Step pill */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 99,
                    transition: "all 0.25s ease",
                    ...(isActive && {
                      bgcolor: alpha("#0D9488", 0.08),
                    }),
                  }}
                >
                  {/* Dot / check */}
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.25s ease",
                      ...(isCompleted && {
                        bgcolor: "#0D9488",
                      }),
                      ...(isActive && {
                        bgcolor: "#0D9488",
                      }),
                      ...(!isActive && !isCompleted && {
                        bgcolor: "#E5E7EB",
                      }),
                    }}
                  >
                    {isCompleted ? (
                      <CheckIcon sx={{ fontSize: 13, color: "#fff" }} />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: isActive ? "#fff" : "#9CA3AF",
                          lineHeight: 1,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    )}
                  </Box>

                  {/* Label */}
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "#0D9488"
                        : isCompleted
                        ? "#0D9488"
                        : "#9CA3AF",
                      transition: "color 0.25s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>

                {/* Connector */}
                {index < STEPS.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      mx: 1,
                      height: 2,
                      borderRadius: 99,
                      bgcolor: "#E5E7EB",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 99,
                        bgcolor: "#0D9488",
                        transform: isCompleted ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      }}
                    />
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>

        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            {/* ── STEP 1: Basic Info ── */}
            {activeStep === 0 && (
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Basic Information Card */}
                <FormCard
                  icon={<TitleIcon sx={{ fontSize: 20 }} />}
                  title="Basic Information"
                  subtitle="Campaign name and description"
                >
                  <Stack spacing={2}>
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: "Title is required" }}
                      render={({ field, fieldState }) => (
                        <AppInput
                          label="Campaign Title"
                          placeholder="e.g., Q4 Software Engineering Assessment"
                          required
                          {...field}
                          error={fieldState.error?.message}
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <AppInput
                          label="Description"
                          placeholder="Describe the purpose and goals..."
                          multiline
                          rows={3}
                          {...field}
                        />
                      )}
                    />
                  </Stack>
                </FormCard>

                {/* Campaign Settings Card — Deadline + Anonymity + Access */}
                <FormCard
                  icon={<ScheduleIcon sx={{ fontSize: 20 }} />}
                  title="Campaign Settings"
                  subtitle="Configure deadline, visibility and access"
                >
                  <Stack spacing={3}>
                    {/* ── Deadline ── */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          mb: 1,
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        Application Deadline
                      </Typography>
                      <Controller
                        name="deadline"
                        control={control}
                        rules={{
                          validate: (value) =>
                            value && dayjs(value).isBefore(dayjs(), "day")
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

                    {/* ── Anonymity Mode ── */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          mb: 1.5,
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        Anonymity Mode
                      </Typography>
                      <Controller
                        name="anonymityMode"
                        control={control}
                        rules={{ required: "Please select an anonymity mode" }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.anonymityMode}>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                gap: 1.5,
                              }}
                            >
                              {ANONYMITY_OPTIONS.map(({ value, label, desc, Icon, color }) => {
                                const isSelected = field.value === value;
                                return (
                                  <Box
                                    key={value}
                                    onClick={() => field.onChange(value)}
                                    sx={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 1,
                                      p: 1.5,
                                      borderRadius: 1.5,
                                      cursor: "pointer",
                                      border: `1px solid ${isSelected ? color : theme.palette.divider}`,
                                      bgcolor: isSelected ? alpha(color, 0.06) : "transparent",
                                      transition: "all 0.2s",
                                      "&:hover": { borderColor: color, bgcolor: alpha(color, 0.04) },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1.5,
                                        bgcolor: isSelected ? alpha(color, 0.12) : alpha(theme.palette.grey[500], 0.08),
                                        color: isSelected ? color : theme.palette.text.secondary,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Icon sx={{ fontSize: 17 }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                                        {label}
                                      </Typography>
                                      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
                                        {desc}
                                      </Typography>
                                    </Box>
                                    {isSelected && (
                                      <CheckCircleIcon sx={{ fontSize: 16, color, mt: 0.5, flexShrink: 0 }} />
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                            {errors.anonymityMode && (
                              <FormHelperText sx={{ ml: 0, mt: 0.5 }}>
                                {errors.anonymityMode.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Box>

                    {/* ── Access Method ── */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          mb: 1.5,
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        Access Method
                      </Typography>
                      <Controller
                        name="accessMethod"
                        control={control}
                        rules={{ required: "Please select an access method" }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.accessMethod}>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                                gap: 1.5,
                              }}
                            >
                              {ACCESS_OPTIONS.map(({ value, label, desc, Icon, color }) => {
                                const isSelected = field.value === value;
                                return (
                                  <Box
                                    key={value}
                                    onClick={() => field.onChange(value)}
                                    sx={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 1,
                                      p: 1.5,
                                      borderRadius: 1.5,
                                      cursor: "pointer",
                                      border: `1px solid ${isSelected ? color : theme.palette.divider}`,
                                      bgcolor: isSelected ? alpha(color, 0.06) : "transparent",
                                      transition: "all 0.2s",
                                      "&:hover": { borderColor: color, bgcolor: alpha(color, 0.04) },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1.5,
                                        bgcolor: isSelected ? alpha(color, 0.12) : alpha(theme.palette.grey[500], 0.08),
                                        color: isSelected ? color : theme.palette.text.secondary,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Icon sx={{ fontSize: 17 }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                                        {label}
                                      </Typography>
                                      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
                                        {desc}
                                      </Typography>
                                    </Box>
                                    {isSelected && (
                                      <CheckCircleIcon sx={{ fontSize: 16, color, mt: 0.5, flexShrink: 0 }} />
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                            {errors.accessMethod && (
                              <FormHelperText sx={{ ml: 0, mt: 0.5 }}>
                                {errors.accessMethod.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Stack>
                </FormCard>

                <FormCard
                  icon={<CategoryIcon sx={{ fontSize: 20 }} />}
                  title="Campaign Type"
                  subtitle="Select the type of campaign"
                >
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Campaign type is required" }}
                    render={({ field }) => (
                      <FormControl error={!!errors.type} fullWidth>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 1.5,
                          }}
                        >
                          {CAMPAIGN_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = field.value === type.value;

                            return (
                              <Box
                                key={type.value}
                                onClick={() => field.onChange(type.value)}
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 1,
                                  p: 1,
                                  borderRadius: 1.5,
                                  cursor: "pointer",
                                  border: `1px solid ${
                                    isSelected
                                      ? type.color
                                      : theme.palette.divider
                                  }`,
                                  bgcolor: isSelected
                                    ? alpha(type.color, 0.08)
                                    : "transparent",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    borderColor: type.color,
                                    bgcolor: alpha(type.color, 0.04),
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 1.5,
                                    bgcolor: isSelected
                                      ? alpha(type.color, 0.1)
                                      : alpha(theme.palette.grey[500], 0.08),
                                    color: isSelected
                                      ? type.color
                                      : theme.palette.text.secondary,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Icon sx={{ fontSize: 16 }} />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500, fontSize: 13 }}
                                  >
                                    {type.label}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "block",
                                      lineHeight: 1.3,
                                      mt: 0.25,
                                      fontSize: 11,
                                    }}
                                  >
                                    {type.description}
                                  </Typography>
                                </Box>

                                {isSelected && (
                                  <CheckCircleIcon
                                    sx={{
                                      fontSize: 16,
                                      color: type.color,
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </Box>

                        {errors.type && (
                          <FormHelperText error sx={{ mt: 1 }}>
                            {errors.type.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </FormCard>

                {/* Assessment Modules Card */}
                <FormCard
                  icon={<ChecklistIcon sx={{ fontSize: 20 }} />}
                  title="Assessment Modules"
                  subtitle="Select one module"
                >
                  <Controller
                    name="module"
                    control={control}
                    rules={{
                      validate: (value) => !!value || "Select a module",
                    }}
                    render={({ field }) => (
                      <FormControl error={!!errors.module} fullWidth>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 1.5,
                          }}
                        >
                          {Object.keys(MODULE_CONFIG).map((mod) => {
                            const module = MODULE_CONFIG[mod as ModuleType];
                            const Icon = module.icon;
                            const isSelected = field.value === (mod as ModuleType);

                            return (
                              <Box
                                key={mod}
                                onClick={() =>
                                  field.onChange(isSelected ? "" : mod)
                                }
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 1,
                                  p: 1,
                                  borderRadius: 1.5,
                                  cursor: "pointer",
                                  border: `1px solid ${isSelected ? module.color : theme.palette.divider}`,
                                  bgcolor: isSelected
                                    ? alpha(module.color, 0.03)
                                    : "transparent",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    borderColor: module.color,
                                    bgcolor: alpha(module.color, 0.05),
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 1.5,
                                    bgcolor: isSelected
                                      ? alpha(module.color, 0.12)
                                      : alpha(theme.palette.grey[500], 0.08),
                                    color: isSelected
                                      ? module.color
                                      : theme.palette.text.secondary,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Icon sx={{ fontSize: 16 }} />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, fontSize: 13 }}
                                  >
                                    {module.label}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "block",
                                      lineHeight: 1.3,
                                      mt: 0.25,
                                      fontSize: 11,
                                    }}
                                  >
                                    {module.description}
                                  </Typography>
                                </Box>

                                {isSelected && (
                                  <CheckCircleIcon
                                    sx={{
                                      fontSize: 16,
                                      color: module.color,
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </Box>

                        {errors.module && (
                          <FormHelperText error sx={{ mt: 1 }}>
                            {errors.module.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </FormCard>

                {/* Step 1 actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                  <AppButton
                    label="Next: Who Can Participate"
                    variant="contained"
                    size="large"
                    onClick={handleNext}
                    sx={{
                      px: 4,
                      background: "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
                    }}
                  />
                </Stack>
              </Box>
            )}

            {/* ── STEP 2: Participants ── */}
            {activeStep === 1 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: alpha("#0D9488", 0.08),
                      color: "#0D9488",
                    }}
                  >
                    <PeopleAltIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} fontSize={16}>
                      Who Can Participate
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      Select specific employees or leave empty to allow all
                    </Typography>
                  </Box>
                </Box>

                <ParticipantsStep
                  selected={selectedParticipants}
                  onChange={setSelectedParticipants}
                />

                {/* Step 2 actions */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ mt: 3 }}
                >
                  <AppButton
                    label="Back"
                    variant="outlined"
                    size="large"
                    onClick={() => setActiveStep(0)}
                    sx={{ px: 3 }}
                  />
                  <AppButton
                    label={isSubmitting ? "Creating..." : "Create Campaign"}
                    variant="contained"
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    sx={{
                      px: 4,
                      background: "linear-gradient(45deg, #0D9488 30%, #14B8A6 90%)",
                    }}
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        </Box>
      </DashboardLayout>
  );
};

export default NewCampaignPage;
