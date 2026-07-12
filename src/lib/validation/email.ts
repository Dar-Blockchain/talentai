import { z } from "zod";
import type { KeyboardEvent } from "react";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STARTS_WITH_DIGIT = /^\d/;
/** Characters allowed to appear anywhere in an email address while typing. */
const ALLOWED_EMAIL_KEY = /^[a-zA-Z0-9@._%+-]$/;

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

/**
 * Blocks keystrokes that can never be part of a valid email: a digit as the
 * very first character, or any character outside the email charset.
 *
 * Note: `type="email"` inputs don't support the selection API — reading
 * `.selectionStart`/`.selectionEnd` on them throws an InvalidStateError in
 * Chrome/Firefox. So we can't detect cursor position and instead only guard
 * the case where the field is currently empty.
 */
export function emailKeyDownGuard(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
  const input = e.currentTarget;
  if (input.value === "" && /\d/.test(e.key)) {
    e.preventDefault();
    return;
  }
  if (!ALLOWED_EMAIL_KEY.test(e.key)) e.preventDefault();
}
