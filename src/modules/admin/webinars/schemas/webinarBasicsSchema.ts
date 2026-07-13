import { z } from "zod";

export const webinarBasicsSchema = z
  .object({
    title_fr:     z.string().trim().max(160, "Title is too long"),
    title_en:     z.string().trim().max(160, "Title is too long"),
    date:         z.string().min(1, "Date is required"),
    start_time:   z.string().min(1, "Start time is required"),
    end_time:     z.string().min(1, "End time is required"),
    lang:         z.enum(["fr", "en", "both"]),
    webinar_link: z.string().trim().min(1, "Join link is required").url("Enter a valid URL"),
  })
  .superRefine((values, ctx) => {
    const needsFr = values.lang === "fr" || values.lang === "both";
    const needsEn = values.lang === "en" || values.lang === "both";
    if (needsFr && !values.title_fr.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title_fr"], message: "French title is required" });
    }
    if (needsEn && !values.title_en.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title_en"], message: "English title is required" });
    }
  });

export type WebinarBasicsForm = z.infer<typeof webinarBasicsSchema>;
