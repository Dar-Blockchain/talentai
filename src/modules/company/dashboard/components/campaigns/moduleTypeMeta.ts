import { FileText as FileTextOutlined, Bot as BotOutlined, Award as AwardOutlined, GraduationCap as GraduationCapOutlined } from "lucide-react";

// One shade softer than before (violet/teal were at Tailwind's more
// saturated -600 tier) — color doubles as small bold text in the activity
// badges, not just donut/dot fill, so kept at -500 rather than pastel -400
// to stay legible.
export const MODULE_TYPE_META = {
  QUESTIONNAIRE: { icon: FileTextOutlined,     color: "#94A3B8", bg: "#F1F5F9" },
  AI_INTERVIEW:  { icon: BotOutlined,           color: "#8B5CF6", bg: "#F5F3FF" },
  SKILL_TEST:    { icon: AwardOutlined,         color: "#14B8A6", bg: "#F0FDFA" },
  TRAINING_PATH: { icon: GraduationCapOutlined, color: "#F59E0B", bg: "#FFFBEB" },
} as const;

export type ModuleType = keyof typeof MODULE_TYPE_META;
