import { CampaignType, ModuleType } from "@/types/campaign";
import {
  InsightsOutlined,
  AccountTreeOutlined,
  SchoolOutlined,
  TuneOutlined,
  DescriptionOutlined,
  PsychologyOutlined,
  AssignmentTurnedInOutlined,
  PeopleOutlined,
} from "@mui/icons-material";

export const CAMPAIGN_TYPES = [
  {
    value: "PRODUCTIVITY_DIAGNOSTIC",
    label: "Productivity Diagnostic",
    description: "Measure team productivity & output",
    icon: InsightsOutlined,
    color: "#3B82F6",
  },
  {
    value: "SKILLS_MAPPING",
    label: "Skills Mapping",
    description: "Map existing skill sets across teams",
    icon: AccountTreeOutlined,
    color: "#10B981",
  },
  {
    value: "ENABLEMENT",
    label: "Enablement",
    description: "Enable & upskill your teams",
    icon: SchoolOutlined,
    color: "#F59E0B",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description: "Build your own assessment flow",
    icon: TuneOutlined,
    color: "#8B5CF6",
  },
] as const;

export const MODULE_CONFIG: Record<
  ModuleType,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }
> = {
  QUESTIONNAIRE: {
    label: "Questionnaire",
    description: "Structured questionnaire with custom questions",
    icon: DescriptionOutlined,
    color: "#3B82F6",
  },
  AI_INTERVIEW: {
    label: "AI Interview",
    description: "Conversational AI-powered interview session",
    icon: PsychologyOutlined,
    color: "#8B5CF6",
  },
  SKILL_TEST: {
    label: "Skill Test",
    description: "Technical skill assessment with scoring",
    icon: AssignmentTurnedInOutlined,
    color: "#10B981",
  },
  TRAINING_PATH: {
    label: "Training Path",
    description: "Guided learning & development path",
    icon: PeopleOutlined,
    color: "#F59E0B",
  },
};
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
