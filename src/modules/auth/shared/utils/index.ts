import type { MutableRefObject } from "react";
import Cookies from "js-cookie";
export { validators } from "./validators";

// ─── Session persistence ───────────────────────────────────────────────────────

const COOKIE_OPTIONS = { expires: 30, path: "/", sameSite: "strict" } as const;

/** Writes the JWT and user role to cookies after a successful OTP verification. */
export function persistSession(token: string, role: string): void {
  Cookies.set("api_token", token, COOKIE_OPTIONS);
  Cookies.set("user_role", role,  COOKIE_OPTIONS);
}

// ─── Shared form constants ────────────────────────────────────────────────────
export const COMPANY_SIZES = [
  "1–10 employees",
  "10–50 employees",
  "50–200 employees",
  "200–500 employees",
  "500+ employees",
] as const;

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Other",
] as const;

export function extractInvitationEmail(returnUrl?: string): string {
  if (!returnUrl) return "";
  try {
    const url   = new URL(decodeURIComponent(returnUrl), window.location.origin);
    const token = url.searchParams.get("token");
    if (!token) return "";
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return "";
    const payload = JSON.parse(atob(base64));
    return payload.userEmail ?? payload.email ?? payload.inviteeEmail ?? "";
  } catch {
    return "";
  }
}

export function resolveRedirectPath(
  role: string | undefined,
  profileId: string | undefined,
  returnUrl: string | undefined
): string {
  if (role === "Admin") return "/admin/dashboard";
  if (!profileId)
    return returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/register";
  if (returnUrl) return decodeURIComponent(returnUrl);
  if (role === "Employee") return "/employee/dashboard";
  if (role === "Company")  return "/company/dashboard";
  return "/candidate/dashboard";
}

/** Abort any in-flight request and start a fresh controller. */
export function refreshAbort(ref: MutableRefObject<AbortController | null>): AbortSignal {
  ref.current?.abort();
  ref.current = new AbortController();
  return ref.current.signal;
}
