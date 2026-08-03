import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Public paths (no auth required) ────────────────────────────────────────
const PUBLIC_PATHS = [
  "/",
  "/demo",
  "/signin",
  "/register",
  "/terms",
  "/privacy",
  "/terms-of-use",
  "/privacy-policy",
  "/unauthorized",
  "/employee/invitation",
  "/campaign",
  "/campaigns/sessions",
  "/interviews",
  "/payments/stripe/callback",
  "/ui-kit",
  "/webinar",
  "/blog"
];

const PUBLIC_PREFIXES = ["/api/", "/_next/", "/favicon", "/logo", "/static/"];

// Auth pages — authenticated users are redirected away
const AUTH_ONLY_PATHS = ["/signin", "/register"];

// ─── Role-based route protection ────────────────────────────────────────────
// Each entry: path prefix → allowed roles (empty means any authenticated role)
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/messages", roles: ["Candidate", "Employee", "Company"] },
  { prefix: "/admin/dashboard",          roles: ["Admin"] },
  { prefix: "/admin/webinars",            roles: ["Admin"] },
  { prefix: "/company",                  roles: ["Company", "Employee"] },
  { prefix: "/profile/company",          roles: ["Company"] },
  // Allow Employee so the page component can show a graceful message before redirecting
  { prefix: "/interviews",            roles: ["Candidate", "Employee", "Company"] },
  { prefix: "/candidate",                roles: ["Candidate"] },
  { prefix: "/employee/invitation",       roles: ["Admin", "Company", "Employee", "Candidate"] },
  { prefix: "/employee",                 roles: ["Employee"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clean(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

function isPublic(pathname: string): boolean {
  const p = clean(pathname);
  if (PUBLIC_PREFIXES.some((prefix) => p.startsWith(prefix))) return true;
  if (PUBLIC_PATHS.some((pub) => p === pub || p.startsWith(pub + "/"))) return true;
  return false;
}

function isAuthOnly(pathname: string): boolean {
  const p = clean(pathname);
  return AUTH_ONLY_PATHS.some((pub) => p === pub || p.startsWith(pub + "/"));
}

// Only these values are valid auth roles
const KNOWN_ROLES = ["Admin", "Company", "Employee", "Candidate"];

// Company membership roles — users with these are treated as Employee
const MEMBER_ROLES = ["RH", "TechLead", "Supervisor", "Manager", "Owner"];

/**
 * Resolve the canonical role from the auth_present cookie value.
 * saveToken() stores the role string directly (e.g. "Employee") so this is
 * a simple normalization — no JWT decode needed.
 */
function resolveRoleFromCookie(value: string): string | null {
  const normalized = value.trim();
  const canonical = KNOWN_ROLES.find((r) => r.toLowerCase() === normalized.toLowerCase()) ?? null;
  if (canonical) return canonical;
  if (MEMBER_ROLES.some((r) => r.toLowerCase() === normalized.toLowerCase())) return "Employee";
  return null;
}

function getAllowedRoles(pathname: string): string[] | null {
  const p = clean(pathname);
  const match = ROLE_ROUTES.find((r) => p === r.prefix || p.startsWith(r.prefix + "/"));
  return match ? match.roles : null;
}

function getDashboardByRole(role: string): string {
  if (role === "Admin") return "/admin/dashboard";
  if (role === "Company") return "/company/dashboard";
  if (role === "Employee") return "/employee/dashboard";
  return "/candidate/dashboard";
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const pathname = clean(request.nextUrl.pathname);

  // Always pass through static assets and API routes
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // auth_present stores the user's role (e.g. "Employee") and is set client-side
  // by saveToken() after OTP verification. We use it — not jwt_token — for route
  // protection because jwt_token is an httpOnly cookie set by the backend API
  // domain and is therefore invisible to middleware running on the frontend domain.
  const authPresent = request.cookies.get("auth_present")?.value;

  // Legacy sessions: auth_present = "1" was stored before the role was saved in
  // the cookie. Clear it and send to /signin so the user re-authenticates once
  // and gets a fresh cookie with the proper role value.
  if (authPresent === "1") {
    const res = isPublic(pathname)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/signin", request.url));
    res.cookies.delete("auth_present");
    return res;
  }

  const isAuthenticated = !!authPresent;
  const role = isAuthenticated ? resolveRoleFromCookie(authPresent!) : null;

  // auth_present present but role unrecognised → stale/corrupted cookie → force re-login.
  if (isAuthenticated && !role) {
    const res = NextResponse.redirect(new URL("/signin?force_logout=1", request.url));
    res.cookies.delete("auth_present");
    return res;
  }

  // Authenticated user on signin/register → redirect to their landing
  if (isAuthenticated && isAuthOnly(pathname)) {
    const destination = getDashboardByRole(role!);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Unauthenticated users can access any path listed in PUBLIC_PATHS / PUBLIC_PREFIXES
  if (!isAuthenticated && !isPublic(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role check for authenticated users — fail closed if role cannot be determined
  if (isAuthenticated) {
    const allowedRoles = getAllowedRoles(pathname);
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|css|js)$).*)",
  ],
};
