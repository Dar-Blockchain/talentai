"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, ArrowRight, Briefcase, Users, LayoutDashboard, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { useRouter } from "next/router";
import axiosInstance from "@/utils/axiosInstance";

const TEAL = "#6AD39C";  // brand-mint

const STATUS_COLOR: Record<string, string> = {
  active: "#059669", open: "#059669", draft: "#D97706", closed: "#6B7280", expired: "#6B7280",
};

const QUICK_LINKS: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Dashboard",    href: "/company/dashboard",    Icon: LayoutDashboard    },
  { label: "Posts",        href: "/company/posts",        Icon: Briefcase          },
  { label: "Applications", href: "/company/applications", Icon: Users              },
  { label: "Settings",     href: "/settings",             Icon: SlidersHorizontal  },
];

interface SearchResult {
  type: "post" | "application";
  id: string; title: string; subtitle: string;
  badge?: string; badgeColor?: string; href: string;
}

const GlobalSearch: React.FC = () => {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const debounce     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* close on click-outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false); setQuery(""); setFocused(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* keyboard shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => { if (!v) setTimeout(() => inputRef.current?.focus(), 50); return !v; });
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* debounced search */
  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const [postsRes, appsRes] = await Promise.all([
          axiosInstance.get("/post/my-posts", { params: { search: query, limit: 5 } }),
          axiosInstance.get("/job-applications/company/my/summary", { params: { search: query, limit: 5 } }),
        ]);
        const posts: SearchResult[] = (postsRes.data?.results || []).map((p: any) => ({
          type: "post", id: p._id,
          title:    p.jobDetails?.title || "Untitled Post",
          subtitle: [p.jobDetails?.location, p.jobDetails?.employmentType].filter(Boolean).join(" · ") || "Job post",
          badge: p.status, badgeColor: STATUS_COLOR[p.status] || "#6B7280",
          href: `/company/posts/${p._id}`,
        }));
        const apps: SearchResult[] = (appsRes.data?.data || []).map((a: any) => ({
          type: "application", id: a.id,
          title:    [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email || "Unknown Candidate",
          subtitle: a.postTitle || "Application",
          badge: a.matchScore != null ? `${Math.round(a.matchScore)}%` : undefined,
          badgeColor: TEAL, href: `/company/applications`,
        }));
        setResults([...posts, ...apps]);
      } catch { setResults([]); }
      finally  { setLoading(false); }
    }, 300);
  }, [query]);

  const totalItems = query.trim() ? results.length : QUICK_LINKS.length;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, totalItems - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && focused >= 0) {
      const items  = query.trim() ? results : QUICK_LINKS;
      const target = (items as any)[focused];
      if (target) { router.push(target.href); setOpen(false); setQuery(""); }
    }
  }, [focused, results, query, router, totalItems]);

  const navigate = (href: string) => { router.push(href); setOpen(false); setQuery(""); setFocused(-1); };

  const postResults = results.filter((r) => r.type === "post");
  const appResults  = results.filter((r) => r.type === "application");
  const hasResults  = results.length > 0;
  const showEmpty   = query.trim().length > 0 && !loading && !hasResults;

  /* width of anchor for dropdown */
  const dropWidth = anchorRef.current ? Math.max(anchorRef.current.offsetWidth, 420) : 420;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger bar */}
      <div
        ref={anchorRef}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 h-[34px] bg-gray-50 border border-gray-200 rounded-[10px] cursor-text transition-all hover:border-[#6AD39C]/40 hover:bg-[#EDFAF3]/40"
        style={{ minWidth: "clamp(120px, 20vw, 240px)" }}
      >
        <Search className="size-3.5 text-gray-400 shrink-0" />
        <span className="text-[12.5px] text-gray-400 flex-1 select-none">Search...</span>
        <span className="hidden sm:flex items-center gap-0.5 bg-gray-100 border border-gray-200 rounded-[5px] px-[5px] py-[2px]">
          <span className="text-[9.5px] font-bold text-gray-400">⌘K</span>
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 rounded-[14px] border border-gray-200 overflow-hidden z-[1400]"
          style={{ width: dropWidth, boxShadow: "0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)", background: "#fff" }}
        >
          {/* Brand gradient top accent */}
          <div className="h-[3px] bg-brand-gradient w-full" />

          {/* Search input row */}
          <div className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100">
            {loading
              ? <Loader2 className="size-3.5 shrink-0 animate-spin" style={{ color: TEAL }} />
              : <Search className="size-4 text-gray-400 shrink-0" />
            }
            <input
              ref={inputRef}
              className="flex-1 text-[13.5px] text-gray-900 placeholder:text-gray-400 outline-none border-none bg-transparent"
              placeholder="Search posts, candidates..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFocused(-1); }}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="text-[9.5px] font-bold text-gray-400 bg-[#EDFAF3] border border-gray-200 rounded-[5px] px-[6px] py-[2px] hover:text-gray-700 cursor-pointer"
              >
                ESC
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Quick nav */}
            {!query.trim() && (
              <div className="p-2">
                <p className="px-2 pt-1 pb-1.5 text-[9.5px] font-bold text-gray-300 uppercase tracking-widest">
                  Quick navigation
                </p>
                {QUICK_LINKS.map((link, i) => (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    onMouseEnter={() => setFocused(i)}
                    className="flex items-center gap-3 w-full px-2.5 py-[7px] rounded-[9px] cursor-pointer text-left transition-colors"
                    style={{
                      background:   focused === i ? "#F3F4F6" : "transparent",
                      borderLeft:   focused === i ? `2px solid ${TEAL}` : "2px solid transparent",
                    }}
                  >
                    <div className="size-[26px] rounded-[7px] bg-gray-100 flex items-center justify-center shrink-0">
                      <link.Icon size={13} style={{ color: "#6B7280" }} />
                    </div>
                    <span className="text-[13px] font-medium text-gray-700 flex-1">{link.label}</span>
                    <ArrowRight className="size-3 text-gray-300" />
                  </button>
                ))}
              </div>
            )}

            {/* Post results */}
            {postResults.length > 0 && (
              <div className="p-2">
                <p className="px-2 pt-1 pb-1.5 text-[9.5px] font-bold text-gray-300 uppercase tracking-widest">Job Posts</p>
                {postResults.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(r.href)}
                    onMouseEnter={() => setFocused(i)}
                    className="flex items-center gap-3 w-full px-2.5 py-[7px] rounded-[9px] cursor-pointer text-left transition-colors"
                    style={{
                      background: focused === i ? "#F3F4F6" : "transparent",
                      borderLeft: focused === i ? `2px solid ${TEAL}` : "2px solid transparent",
                    }}
                  >
                    <div className="size-[26px] rounded-[7px] flex items-center justify-center shrink-0" style={{ background: `${TEAL}0F` }}>
                      <Briefcase size={13} style={{ color: TEAL }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{r.title}</p>
                      <p className="text-[11px] text-gray-400 truncate">{r.subtitle}</p>
                    </div>
                    {r.badge && (
                      <span
                        className="text-[9.5px] font-bold px-[6px] py-[2px] rounded-[5px] shrink-0 capitalize"
                        style={{ color: r.badgeColor, background: `${r.badgeColor}15` }}
                      >
                        {r.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Application results */}
            {appResults.length > 0 && (
              <div className="p-2" style={{ borderTop: postResults.length > 0 ? "1px solid #F3F4F6" : "none" }}>
                <p className="px-2 pt-1 pb-1.5 text-[9.5px] font-bold text-gray-300 uppercase tracking-widest">Candidates</p>
                {appResults.map((r, i) => {
                  const idx = postResults.length + i;
                  return (
                    <button
                      key={r.id}
                      onClick={() => navigate(r.href)}
                      onMouseEnter={() => setFocused(idx)}
                      className="flex items-center gap-3 w-full px-2.5 py-[7px] rounded-[9px] cursor-pointer text-left transition-colors"
                      style={{
                        background: focused === idx ? "#F3F4F6" : "transparent",
                        borderLeft: focused === idx ? `2px solid ${TEAL}` : "2px solid transparent",
                      }}
                    >
                      <div className="size-[26px] rounded-full flex items-center justify-center shrink-0" style={{ background: `${TEAL}12` }}>
                        <span className="text-[10px] font-bold" style={{ color: TEAL }}>{r.title[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{r.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{r.subtitle}</p>
                      </div>
                      {r.badge && (
                        <span className="text-[9.5px] font-bold px-[6px] py-[2px] rounded-[5px] shrink-0" style={{ color: TEAL, background: `${TEAL}12` }}>
                          {r.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="py-10 text-center">
                <Search className="size-8 mx-auto mb-2 text-gray-200" />
                <p className="text-[13px] font-medium text-gray-400">No results for "{query}"</p>
                <p className="text-[11.5px] text-gray-300 mt-1">Try a job title or candidate name</p>
              </div>
            )}
          </div>

          {/* Keyboard hint footer */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4">
            {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, action]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-gray-400 bg-[#EDFAF3] border border-gray-200 rounded-[4px] px-[5px] py-[1px]">{key}</span>
                <span className="text-[10px] text-gray-300">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
