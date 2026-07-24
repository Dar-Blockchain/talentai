"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Search, Briefcase, Users, LayoutDashboard, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useRouter } from "next/router";
import axiosInstance from "@/utils/axiosInstance";
import { Popover, PopoverTrigger, PopoverContent } from "@/modules/shared/ui/shadcn/popover";
import { cn } from "@/lib/utils";

const TEAL = "#0D9488";

const STATUS_COLOR: Record<string, string> = {
  active: "#059669", open: "#059669", draft: "#D97706",
  closed: "#6B7280", expired: "#6B7280",
};

const QUICK_LINKS = [
  { label: "Hiring Dashboard", href: "/company/dashboard?tab=hiring", Icon: LayoutDashboard },
  { label: "Team Dashboard",   href: "/company/dashboard?tab=team",   Icon: LayoutDashboard },
  { label: "Posts",            href: "/company/posts",            Icon: Briefcase },
  { label: "Applications",     href: "/company/applications",     Icon: Users },
  { label: "Settings",         href: "/settings",                 Icon: SlidersHorizontal },
];

interface SearchResult {
  type: "post" | "application";
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  href: string;
}

const GlobalSearch: React.FC = () => {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(-1);

  const anchorRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const debounce   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) setTimeout(() => inputRef.current?.focus(), 50);
          return !v;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Debounced search
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
          type:       "post",
          id:         p._id,
          title:      p.jobDetails?.title || "Untitled Post",
          subtitle:   [p.jobDetails?.location, p.jobDetails?.employmentType].filter(Boolean).join(" · ") || "Job post",
          badge:      p.status,
          badgeColor: STATUS_COLOR[p.status] || "#6B7280",
          href:       `/company/posts/${p._id}`,
        }));

        const apps: SearchResult[] = (appsRes.data?.data || []).map((a: any) => ({
          type:     "application",
          id:       a.id,
          title:    [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email || "Unknown Candidate",
          subtitle: a.postTitle || "Application",
          badge:    a.matchScore != null ? `${Math.round(a.matchScore)}%` : undefined,
          badgeColor: TEAL,
          href:     `/company/applications`,
        }));

        setResults([...posts, ...apps]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  // Keyboard navigation
  const totalItems = query.trim()
    ? results.length
    : QUICK_LINKS.length;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, totalItems - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && focused >= 0) {
      const items = query.trim() ? results : QUICK_LINKS;
      const target = items[focused];
      if (target) { router.push((target as any).href); setOpen(false); setQuery(""); }
    }
  }, [focused, results, query, router, totalItems]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
    setFocused(-1);
  };

  const postResults   = results.filter((r) => r.type === "post");
  const appResults    = results.filter((r) => r.type === "application");
  const hasResults    = results.length > 0;
  const showEmpty     = query.trim().length > 0 && !loading && !hasResults;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) { setQuery(""); setFocused(-1); }
      }}
    >
      {/* ── Trigger ── */}
      <PopoverTrigger asChild>
        <div
          ref={anchorRef}
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex h-[34px] w-full cursor-text items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3 transition-all duration-150 hover:border-teal-500/30 hover:bg-white"
        >
          <Search size={14} color="#9CA3AF" className="shrink-0" />
          <span className="flex-1 select-none text-[12.5px] text-gray-400">Search...</span>
          <div className="hidden items-center gap-[3px] rounded-[5px] border border-gray-200 bg-gray-100 px-[5px] py-[2px] sm:flex">
            <span className="text-[9.5px] font-bold text-gray-400">⌘K</span>
          </div>
        </div>
      </PopoverTrigger>

      {/* ── Dropdown ── */}
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[420px] max-w-[90vw] overflow-hidden rounded-[14px] border border-gray-200 p-0 shadow-[0_16px_40px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.06)]"
        style={{ width: anchorRef.current?.offsetWidth ? Math.max(anchorRef.current.offsetWidth, 420) : 420 }}
        onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}
      >
        {/* Input row */}
        <form
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2.5 border-b border-gray-100 px-3.5 py-2.5"
        >
          {loading
            ? <Loader2 size={14} color={TEAL} className="shrink-0 animate-spin" />
            : <Search size={16} color="#9CA3AF" className="shrink-0" />
          }
          <input
            ref={inputRef}
            placeholder="Search posts, candidates..."
            name="global-search-query"
            autoComplete="off"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocused(-1); }}
            onKeyDown={handleKeyDown}
            className="w-full flex-1 bg-transparent text-[13.5px] text-gray-900 outline-none placeholder:text-gray-400"
          />
          {query && (
            <div
              onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              className="cursor-pointer rounded-[5px] border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[9.5px] font-bold text-gray-400 hover:text-gray-700"
            >
              ESC
            </div>
          )}
        </form>

        <div className="max-h-[400px] overflow-y-auto">

          {/* Quick links (no query) */}
          {!query.trim() && (
            <div className="p-1">
              <p className="px-1 pb-[3px] pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#C4C9D4]">
                Quick navigation
              </p>
              {QUICK_LINKS.map((link, i) => (
                <div
                  key={link.href}
                  onClick={() => handleNavigate(link.href)}
                  onMouseEnter={() => setFocused(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] transition-colors duration-100 hover:bg-gray-50",
                    focused === i ? "bg-gray-100" : "bg-transparent",
                  )}
                >
                  <div className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-gray-100">
                    <link.Icon size={13} color="#6B7280" />
                  </div>
                  <span className="text-[13px] font-medium text-gray-700">{link.label}</span>
                  <ArrowRight size={12} color="#D1D5DB" className="ml-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Post results */}
          {postResults.length > 0 && (
            <div className="p-1">
              <p className="px-1 pb-[3px] pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#C4C9D4]">
                Job Posts
              </p>
              {postResults.map((r, i) => {
                const idx = i;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleNavigate(r.href)}
                    onMouseEnter={() => setFocused(idx)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] hover:bg-gray-50",
                      focused === idx ? "bg-gray-100" : "bg-transparent",
                    )}
                  >
                    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px]" style={{ backgroundColor: `${TEAL}0F` }}>
                      <Briefcase size={13} color={TEAL} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-gray-900">{r.title}</p>
                      <p className="truncate text-[11px] text-gray-400">{r.subtitle}</p>
                    </div>
                    {r.badge && (
                      <span
                        className="shrink-0 rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-bold capitalize"
                        style={{ color: r.badgeColor, backgroundColor: `${r.badgeColor}15` }}
                      >
                        {r.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Application results */}
          {appResults.length > 0 && (
            <div className={cn("p-1", postResults.length > 0 && "border-t border-gray-100")}>
              <p className="px-1 pb-[3px] pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#C4C9D4]">
                Candidates
              </p>
              {appResults.map((r, i) => {
                const idx = postResults.length + i;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleNavigate(r.href)}
                    onMouseEnter={() => setFocused(idx)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] hover:bg-gray-50",
                      focused === idx ? "bg-gray-100" : "bg-transparent",
                    )}
                  >
                    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${TEAL}12` }}>
                      <span className="text-[10px] font-bold" style={{ color: TEAL }}>
                        {r.title[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-gray-900">{r.title}</p>
                      <p className="truncate text-[11px] text-gray-400">{r.subtitle}</p>
                    </div>
                    {r.badge && (
                      <span
                        className="shrink-0 rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-bold"
                        style={{ color: TEAL, backgroundColor: `${TEAL}12` }}
                      >
                        {r.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="py-10 text-center">
              <Search size={32} color="#E5E7EB" className="mx-auto mb-2" />
              <p className="text-[13px] font-medium text-gray-400">No results for "{query}"</p>
              <p className="mt-1 text-[11.5px] text-[#C4C9D4]">Try a job title or candidate name</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2">
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, action]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="rounded border border-gray-200 bg-gray-100 px-[5px] py-px text-[9px] font-bold text-gray-400">
                {key}
              </span>
              <span className="text-[10px] text-[#C4C9D4]">{action}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GlobalSearch;
