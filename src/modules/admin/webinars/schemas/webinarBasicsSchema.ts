import { z } from "zod";

export const webinarBasicsSchema = z
  .object({
    title_fr:        z.string().trim().max(80, "Title must be 80 characters or less"),
    title_en:        z.string().trim().max(80, "Title must be 80 characters or less"),
    description_fr:  z.string().trim().max(200, "Description must be 200 characters or less"),
    description_en:  z.string().trim().max(200, "Description must be 200 characters or less"),
    about_fr:        z.string().trim().max(500, "About must be 500 characters or less"),
    about_en:        z.string().trim().max(500, "About must be 500 characters or less"),
    highlights_fr:   z.array(z.string()),
    highlights_en:   z.array(z.string()),
    highlights_enabled: z.boolean(),
    date:            z.string().min(1, "Date is required"),
    start_time:      z.string().min(1, "Start time is required"),
    end_time:        z.string().min(1, "End time is required"),
    // "" means "not chosen yet" — the Basics step has no preselected
    // language, so the visitor must explicitly pick one before continuing.
    lang:            z.enum(["", "fr", "en", "both"]),
    webinar_link:    z.string().trim().min(1, "Join link is required").url("Enter a valid URL"),
    target_min:      z.coerce.number().min(0, "Must be 0 or more"),
    target_max:      z.coerce.number().min(0, "Must be 0 or more"),
  })
  .superRefine((values, ctx) => {
    if (!values.lang) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lang"], message: "Please choose a language" });
    }
    const needsFr = values.lang === "fr" || values.lang === "both";
    const needsEn = values.lang === "en" || values.lang === "both";

    if (needsFr && !values.title_fr.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title_fr"], message: "French title is required" });
    }
    if (needsEn && !values.title_en.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title_en"], message: "English title is required" });
    }
    if (needsFr && !values.description_fr.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["description_fr"], message: "French short description is required" });
    }
    if (needsEn && !values.description_en.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["description_en"], message: "English short description is required" });
    }
    if (needsFr && !values.about_fr.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["about_fr"], message: "French About text is required" });
    }
    if (needsEn && !values.about_en.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["about_en"], message: "English About text is required" });
    }
    if (values.highlights_enabled && needsFr && !values.highlights_fr.some((h) => h.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["highlights_fr"], message: "At least one French highlight is required" });
    }
    if (values.highlights_enabled && needsEn && !values.highlights_en.some((h) => h.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["highlights_en"], message: "At least one English highlight is required" });
    }
  });

export type WebinarBasicsForm = z.infer<typeof webinarBasicsSchema>;
