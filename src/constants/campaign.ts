import { CampaignType, ModuleType } from "@/store/slices/campaignSlice";

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  DRAFT: { bg: "#F9FAFB", fg: "#6B7280" },
  ACTIVE: { bg: "#F0FDF4", fg: "#16A34A" },
  PAUSED: { bg: "#FFFBEB", fg: "#D97706" },
  CLOSED: { bg: "#EFF6FF", fg: "#2563EB" },
  EXPIRED: { bg: "#FEF2F2", fg: "#DC2626" },
};

export const TYPE_COLORS: Record<
  CampaignType,
  { bg: string; fg: string; border: string }
> = {
  PRODUCTIVITY_DIAGNOSTIC: { bg: "#EFF6FF", fg: "#2563EB", border: "#BFDBFE" },
  SKILLS_MAPPING: { bg: "#F0FDFA", fg: "#0D9488", border: "#99F6E4" },
  ENABLEMENT: { bg: "#F5F3FF", fg: "#7C3AED", border: "#DDD6FE" },
  CUSTOM: { bg: "#FFF7ED", fg: "#C2410C", border: "#FED7AA" },
};

export const TYPE_LABELS: Record<CampaignType, string> = {
  PRODUCTIVITY_DIAGNOSTIC: "Productivity Diagnostic",
  SKILLS_MAPPING: "Skills Mapping",
  ENABLEMENT: "Enablement",
  CUSTOM: "Custom",
};

export const MODULE_LABELS: Record<ModuleType, string> = {
  QUESTIONNAIRE: "Questionnaire",
  AI_INTERVIEW: "AI Interview",
  SKILL_TEST: "Skill Test",
  TRAINING_PATH: "Training Path",
};
