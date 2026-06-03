import { z } from "zod";

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const companyProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(25, "Company name must be less than 25 characters"),
  
  industry: z.string().min(1, "Industry is required"),
  
  size: z.string().min(1, "Company size is required"),
  
  employmentType: z.string().min(1, "Employment type is required"),
  
  location: z
    .string()
    .trim()
    .optional()
    .default(""),
  
  linkedin: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (v) => !v || /^https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[\w-]+\/?$/i.test(v),
      "Must be a valid LinkedIn URL (e.g., https://www.linkedin.com/company/yourcompany)"
    ),
  
  website: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => !v || isValidUrl(v), "Invalid website URL"),
  
  phone: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (v) => !v || /^\+?[1-9]\d{1,14}$/.test(v.replace(/[\s\-()]/g, "")),
      "Invalid phone number format (international format recommended)"
    ),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
