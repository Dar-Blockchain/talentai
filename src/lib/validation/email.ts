import { z } from "zod";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STARTS_WITH_DIGIT = /^\d/;

/** Single source of truth for email validation across the app. */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .refine((v) => !STARTS_WITH_DIGIT.test(v), "Email cannot start with a number.")
  .refine((v) => EMAIL_FORMAT.test(v), "Please enter a valid email address.");

/** react-hook-form `rules.validate` adapter around {@link emailSchema}. */
export const validateEmail = (value: string): true | string => {
  const result = emailSchema.safeParse(value ?? "");
  return result.success ? true : (result.error.issues[0]?.message ?? "Please enter a valid email address.");
};
