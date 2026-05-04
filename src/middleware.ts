import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Public paths (no auth required) ────────────────────────────────────────
const PUBLIC_PATHS = [
  "/signin",
  "/register",
  "/home/candidate",
  "/home/company",
  "/unauthorized",
  "/interview/results",
  "/invitation",
  "/campaign",
  "/interview/hr",  // public interview links (ref=link) — auth handled inside the page
  "/jobs",          // public job landing pages
];

const PUBLIC_PREFIXES = ["/api/", "/_next/", "/favicon", "/logo", "/static/"];

// Auth pages — authenticated users are redirected away
const AUTH_ONLY_PATHS = ["/signin", "/register"];

// ─── Role-based route protection ────────────────────────────────────────────
// Each entry: path prefix → allowed roles (empty means any authenticated role)
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/dashboard/admin",     roles: ["Admin"] },
  { prefix: "/company",             roles: ["Company", "Employee"] },
  { prefix: "/profile/company",     roles: ["Company"] },
  { prefix: "/dashboard/candidate", roles: ["Candidate"] },
  { prefix: "/dashboard/member",    roles: ["Candidate"] },
  { prefix: "/profile/candidate",   roles: ["Candidate"] },
  { prefix: "/interview/report",    roles: ["Company", "Admin"] },
  { prefix: "/chat",                roles: ["Candidate", "Company"] },
  { prefix: "/assessment",          roles: ["Candidate"] },
  { prefix: "/employee",            roles: ["Employee"] },
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

/** Decode JWT payload without verification (Edge runtime safe) */
function getRoleFromToken(token: string): string | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    const rawRole =
      payload.role ??
      payload.userRole ??
      payload.roleType ??
      payload.type ??
      payload.user?.role ??
      payload.user?.userRole ??
      payload.roles ??
      null;

    const pickOne = (v: unknown): string | null => {
      if (!v) return null;
      if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : null;
      return typeof v === "string" ? v : null;
    };

    const roleStr = pickOne(rawRole);
    if (!roleStr) return null;

    const normalized = roleStr.trim();
    const canonical =
      KNOWN_ROLES.find((r) => r.toLowerCase() === normalized.toLowerCase()) ?? null;
    if (canonical) return canonical;

    if (MEMBER_ROLES.some((r) => r.toLowerCase() === normalized.toLowerCase())) {
      return "Employee";
    }
    return null;
  } catch {
    return null;
  }
}

function getAllowedRoles(pathname: string): string[] | null {
  const p = clean(pathname);
  const match = ROLE_ROUTES.find((r) => p === r.prefix || p.startsWith(r.prefix + "/"));
  return match ? match.roles : null;
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through static assets and API routes
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("api_token")?.value;
  const isAuthenticated = !!token;
  const role = token ? getRoleFromToken(token) : null;

  // Token exists but role cannot be decoded → corrupted/invalid token → force logout
  if (isAuthenticated && !role) {
    const res = NextResponse.redirect(new URL("/signin?force_logout=1", request.url));
    res.cookies.delete("api_token");
    return res;
  }

  // Authenticated user on signin/register → redirect to their landing
  if (isAuthenticated && isAuthOnly(pathname)) {
    const destination = role === "Admin"
      ? "/dashboard/admin"
      : role === "Company"
      ? "/company/dashboard"
      : role === "Employee"
      ? "/employee/dashboard"
      : "/dashboard/candidate";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Unauthenticated user on protected route → signin with returnUrl
  if (!isAuthenticated && !isPublic(pathname)) {
    const fullUrl = request.nextUrl.pathname + request.nextUrl.search;
    const returnUrl = encodeURIComponent(fullUrl);
    return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url));
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
