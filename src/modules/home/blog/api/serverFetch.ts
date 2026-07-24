import { PublicBlogListResponse, PublicBlogPost } from "../types";

const apiBase = () => (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

/** Server-side (getServerSideProps) fetchers — plain `fetch` against the API,
 * no axios interceptors/cookies needed for these public, unauthenticated reads. */
export async function fetchPublicBlogPostsServer(page = 1, limit = 9): Promise<PublicBlogListResponse | null> {
  try {
    const res = await fetch(`${apiBase()}/blog/public?page=${page}&limit=${limit}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json as PublicBlogListResponse;
  } catch {
    return null;
  }
}

export async function fetchPublicBlogPostBySlugServer(slug: string): Promise<PublicBlogPost | null> {
  try {
    const res = await fetch(`${apiBase()}/blog/public/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as PublicBlogPost) ?? null;
  } catch {
    return null;
  }
}

/** Admin preview — returns a post regardless of status (draft or published).
 * Forwards the incoming request's Cookie header so the admin's own session
 * (httpOnly JWT cookie) authenticates the server-to-server call to the API. */
export async function fetchAdminBlogPostPreviewServer(slug: string, cookieHeader: string | undefined): Promise<PublicBlogPost | null> {
  if (!cookieHeader) return null;
  try {
    const res = await fetch(`${apiBase()}/blog/preview/${encodeURIComponent(slug)}`, {
      headers: { Cookie: cookieHeader },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as PublicBlogPost) ?? null;
  } catch {
    return null;
  }
}
