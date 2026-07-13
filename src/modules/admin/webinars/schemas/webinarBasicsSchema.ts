import { z } from "zod";

export const webinarBasicsSchema = z.object({
  title:        z.string().trim().min(1, "Title is required").max(160, "Title is too long"),
  date:         z.string().min(1, "Date & time is required"),
  lang:         z.enum(["fr", "en", "both"]),
  webinar_link: z.string().trim().min(1, "Join link is required").url("Enter a valid URL"),
});

export type WebinarBasicsForm = z.infer<typeof webinarBasicsSchema>;
