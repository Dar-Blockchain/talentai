import { FileText as FileTextOutlined, Bot as BotOutlined, Award as AwardOutlined, GraduationCap as GraduationCapOutlined } from "lucide-react";

export const MODULE_TYPE_META = {
  QUESTIONNAIRE: { icon: FileTextOutlined,     color: "#64748B", bg: "#F1F5F9" },
  AI_INTERVIEW:  { icon: BotOutlined,           color: "#7C3AED", bg: "#F5F3FF" },
  SKILL_TEST:    { icon: AwardOutlined,         color: "#0D9488", bg: "#F0FDFA" },
  TRAINING_PATH: { icon: GraduationCapOutlined, color: "#F59E0B", bg: "#FFFBEB" },
} as const;

export type ModuleType = keyof typeof MODULE_TYPE_META;
