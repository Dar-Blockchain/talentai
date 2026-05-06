import { z } from 'zod';

const personalInformationBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters'),
  gender: z
    .string()
    .trim()
    .min(1, 'Gender is required'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required'),
  timezone: z
    .string()
    .trim()
    .min(1, 'Time zone is required'),
  requiredExperienceLevel: z
    .string()
    .trim()
    .min(1, 'Experience level is required'),
  targetRole: z
    .string()
    .trim()
    .optional(),
});

export const contactInformationSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s+()-]+$/, 'Invalid phone number format'),
  location: z
    .string()
    .trim()
    .min(1, 'Location is required'),
  address: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/i.test(value), {
      message: 'Must be a valid LinkedIn URL (e.g., https://www.linkedin.com/in/username)',
    }),
  githubUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^(https?:\/\/)?(www\.)?github\.com\/.+$/i.test(value), {
      message: 'Must be a valid GitHub URL (e.g., https://github.com/username)',
    }),
  personalWebsite: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(value), {
      message: 'Invalid website URL',
    }),
});

export const personalInformationSchema = personalInformationBaseSchema.merge(contactInformationSchema);

export type PersonalInformationFormValues = z.infer<typeof personalInformationSchema>;

export type ContactInformationFormValues = z.infer<typeof contactInformationSchema>;
