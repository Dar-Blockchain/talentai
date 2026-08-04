import { z } from "zod";
import { ModuleType } from "@/modules/company/campaigns/types/campaign";

export const questionnaireConfigSchema = z.object({
  questions: z.array(z.unknown()).min(1),
  aiScoringEnabled: z.boolean().optional(),
  showResultsToParticipants: z.boolean().optional(),
});

export const aiInterviewConfigSchema = z.object({
  agentPrompt: z.string().trim().min(1),
  showResultsToParticipants: z.boolean().optional(),
});

export const skillTestConfigSchema = z.object({
  skill: z.string().trim().min(1),
  showResultsToParticipants: z.boolean().optional(),
});

export const trainingPathConfigSchema = z.object({
  resources: z.array(z.unknown()).min(1),
});

export const MODULE_CONFIG_SCHEMAS: Record<ModuleType, z.ZodTypeAny> = {
  QUESTIONNAIRE: questionnaireConfigSchema,
  AI_INTERVIEW: aiInterviewConfigSchema,
  SKILL_TEST: skillTestConfigSchema,
  TRAINING_PATH: trainingPathConfigSchema,
};
