"use client";

import React from "react";
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
  Select,
  MenuItem,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Title as TitleIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Checklist as ChecklistIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import RoleGuard from "@/components/guards/RoleGuard";
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

const NewCampaignPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const theme = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateCampaignForm>({
    mode: "onChange",
    defaultValues: {
      title: "",
      type: "" as CampaignType,
      description: "",
      anonymityMode: "ANONYMOUS",
      accessMethod: "LINK",
      targetDepartment: "",
      module: "" as ModuleType,
      deadline: "",
    },
  });

  const onSubmit = async (data: CreateCampaignForm) => {
    try {
      const formattedPayload: CreateCampaignPayload = {
        ...data,
        module: { type: data.module, config: null },
      };
      await dispatch(createCampaign(formattedPayload)).unwrap();

      showToast({
        message: "Campaign created successfully",
        severity: "success",
      });

      router.push("/company/campaigns");
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
    <RoleGuard allowedRoles={["Company"]}>
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

        <Box mt={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
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
                          rows={4}
                          {...field}
                        />
                      )}
                    />
                  </Stack>
                </FormCard>

                {/* Timeline & Department Card */}
                <FormCard
                  icon={<ScheduleIcon />}
                  title="Timeline & Department"
                  subtitle="Set the application deadline and target department"
                >
                  <Stack spacing={2}>
                    {/* Deadline */}
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
                          label="Application Deadline"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.deadline?.message}
                          disablePast
                          size="small"
                          fullWidth
                        />
                      )}
                    />

                    {/* Target Department */}
                    <Controller
                      name="targetDepartment"
                      control={control}
                      render={({ field }) => (
                        <AppSelect
                          label="Target Department"
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { label: "HR", value: "HR" },
                            { label: "Engineering", value: "Engineering" },
                            { label: "Sales", value: "Sales" },
                            { label: "Marketing", value: "Marketing" },
                          ]}
                          placeholder="Select department"
                          error={errors.targetDepartment?.message}
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </Stack>
                </FormCard>
              </Box>

              {/* Anonymity Mode & Access Method Card */}
              <FormCard
                icon={<InfoIcon sx={{ fontSize: 20 }} />}
                title="Anonymity & Access"
                subtitle="Configure participant visibility and access method"
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  {/* Anonymity Mode */}
                  <Controller
                    name="anonymityMode"
                    control={control}
                    rules={{ required: "Please select an anonymity mode" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!errors.anonymityMode}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                            borderColor: "#2563EB",
                          },
                          "& label.Mui-focused": { color: "#2563EB" },
                        }}
                      >
                        <Select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <MenuItem value="NOMINATIVE">
                            <Box>
                              <Typography
                                sx={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                Nominative
                              </Typography>
                              <Typography
                                sx={{ fontSize: "11px", color: "#9CA3AF" }}
                              >
                                Participant names are visible to organizers
                              </Typography>
                            </Box>
                          </MenuItem>

                          <MenuItem value="ANONYMOUS">
                            <Box>
                              <Typography
                                sx={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                Anonymous
                              </Typography>
                              <Typography
                                sx={{ fontSize: "11px", color: "#9CA3AF" }}
                              >
                                Responses are fully anonymized
                              </Typography>
                            </Box>
                          </MenuItem>
                        </Select>

                        {errors.anonymityMode && (
                          <FormHelperText sx={{ ml: 0 }}>
                            {errors.anonymityMode.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />

                  {/* Access Method */}
                  <Controller
                    name="accessMethod"
                    control={control}
                    rules={{ required: "Please select an access method" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!errors.accessMethod}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                            borderColor: "#2563EB",
                          },
                          "& label.Mui-focused": { color: "#2563EB" },
                        }}
                      >
                        <Select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <MenuItem value="LINK">
                            <Box>
                              <Typography
                                sx={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                Link
                              </Typography>
                              <Typography
                                sx={{ fontSize: "11px", color: "#9CA3AF" }}
                              >
                                Anyone with the link can participate
                              </Typography>
                            </Box>
                          </MenuItem>

                          <MenuItem value="ACCOUNTS">
                            <Box>
                              <Typography
                                sx={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                Accounts
                              </Typography>
                              <Typography
                                sx={{ fontSize: "11px", color: "#9CA3AF" }}
                              >
                                Participants must sign in with their account
                              </Typography>
                            </Box>
                          </MenuItem>

                          <MenuItem value="BOTH">
                            <Box>
                              <Typography
                                sx={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                Both
                              </Typography>
                              <Typography
                                sx={{ fontSize: "11px", color: "#9CA3AF" }}
                              >
                                Supports both link access and account login
                              </Typography>
                            </Box>
                          </MenuItem>
                        </Select>

                        {errors.accessMethod && (
                          <FormHelperText sx={{ ml: 0 }}>
                            {errors.accessMethod.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
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
                                bgcolor: isSelected ? alpha(module.color, 0.03) : "transparent",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: module.color,
                                  bgcolor: alpha(module.color, 0.05),
                                },
                              }}
                            >
                              {/* ICON */}
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

                              {/* CONTENT */}
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
                                <CheckCircleIcon sx={{ fontSize: 16, color: module.color, mt: 0.5 }} />
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
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <AppButton
                  label={isSubmitting ? "Creating..." : "Create Campaign"}
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  sx={{
                    px: 4,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                  }}
                />
              </Stack>
            </Box>
          </Paper>
        </Box>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default NewCampaignPage;