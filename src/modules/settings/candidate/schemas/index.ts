import { z } from 'zod';

const optionalUrl = (domainPattern: RegExp, message: string) =>
  z.string().trim().default('').refine(
    (v) => !v || domainPattern.test(v),
    { message }
  );

export const personalInformationSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().trim().min(2, 'Last name must be at least 2 characters'),
  gender:    z.string().trim().min(1, 'Gender is required'),
  timezone:  z.string().trim().min(1, 'Time zone is required'),
  requiredExperienceLevel: z.string().trim().min(1, 'Experience level is required'),
  targetRole: z.string().trim().default(''),

  phone: z.string().trim().default('').refine(
    (v) => !v || /^[\d\s+()-]+$/.test(v),
    { message: 'Invalid phone number format' }
  ),
  location:        z.string().trim().default(''),
  address:         z.string().trim().default(''),
  linkedinUrl:     optionalUrl(/^https?:\/\/(www\.)?linkedin\.com\/.+$/i,   'Must be a valid LinkedIn URL (e.g., https://linkedin.com/in/username)'),
  githubUrl:       optionalUrl(/^https?:\/\/(www\.)?github\.com\/.+$/i,     'Must be a valid GitHub URL (e.g., https://github.com/username)'),
  personalWebsite: optionalUrl(/^https?:\/\/([\da-z.-]+)\.([a-z.]{2,6})/i, 'Invalid website URL'),
});

export const contactInformationSchema = personalInformationSchema.pick({
  phone:           true,
  location:        true,
  address:         true,
  linkedinUrl:     true,
  githubUrl:       true,
  personalWebsite: true,
});

export type PersonalInformationFormValues = z.infer<typeof personalInformationSchema>;
export type ContactInformationFormValues  = z.infer<typeof contactInformationSchema>;
