import { z } from "zod";
import dayjs from "dayjs";

export const createCampaignFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be less than 120 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters"),

  anonymityMode: z.enum(["ANONYMOUS", "NOMINATIVE"], {
    errorMap: () => ({ message: "Please select an anonymity mode" }),
  }),

  module: z.enum(["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"], {
    errorMap: () => ({ message: "Select a module" }),
  }),

  accessMethod: z.enum(["LINK", "ACCOUNTS"], {
    errorMap: () => ({ message: "Please select an access method" }),
  }),

  deadline: z
    .string()
    .optional()
    .refine(
      (v) => !v || !dayjs(v).isBefore(dayjs(), "day"),
      "Deadline cannot be in the past",
    ),
});

export type CreateCampaignFormValues = z.infer<typeof createCampaignFormSchema>;
