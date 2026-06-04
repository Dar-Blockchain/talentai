import type { MutableRefObject } from "react";
export { validators } from "./validators";

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
