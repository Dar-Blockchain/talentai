"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Search, Briefcase, Building2, Target } from "lucide-react";
import { useRouter } from "next/router";
import axiosInstance from "@/utils/axiosInstance";
import { Popover, PopoverTrigger, PopoverContent } from "@/modules/shared/ui/shadcn/popover";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;
// Five result categories in one dropdown adds up fast — cap each tighter
// than a single-category search would need, so the list stays scannable.
const RESULTS_PER_CATEGORY = 3;

const TEAL = "#0D9488";

const STATUS_COLOR: Record<string, string> = {
  active: "#059669", open: "#059669", draft: "#D97706",
  closed: "#6B7280", expired: "#6B7280",
};

const CAMPAIGN_STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#059669", DRAFT: "#D97706", PAUSED: "#D97706",
  CLOSED: "#6B7280", EXPIRED: "#6B7280",
};

interface SearchResult {
  type: "post" | "application" | "employee" | "department" | "campaign";
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

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

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

  // Instant spinner feedback while the debounce settles, ahead of the fetch.
  useEffect(() => {
    if (query.trim()) setLoading(true);
  }, [query]);

  // Fires SEARCH_DEBOUNCE_MS after typing pauses. Aborts the previous
  // in-flight request when a newer search starts — without this, a slower
  // older response could resolve after a faster newer one and overwrite its
  // results with stale data.
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) { setResults([]); setLoading(false); return; }

    const controller = new AbortController();
    const params = { search: trimmed, limit: RESULTS_PER_CATEGORY };

    (async () => {
      try {
        // allSettled — one flaky category (e.g. campaigns) shouldn't blank
        // out results from the other four that succeeded.
        const [postsRes, appsRes, employeesRes, departmentsRes, campaignsRes] = await Promise.allSettled([
          axiosInstance.get("/post/my-posts", { params, signal: controller.signal }),
          axiosInstance.get("/job-applications/company/my/summary", { params, signal: controller.signal }),
          axiosInstance.get("/company-memberships/memberships", { params, signal: controller.signal }),
          axiosInstance.get("/departments", { params, signal: controller.signal }),
          axiosInstance.get("/internal-campaigns", { params, signal: controller.signal }),
        ]);

        // All 5 share one AbortSignal, so if this cycle was superseded by a
        // newer search they'd all reject together — bail without touching
        // results (the newer cycle's own effect run owns setResults now).
        if (controller.signal.aborted) return;

        const posts: SearchResult[] = postsRes.status === "fulfilled"
          ? (postsRes.value.data?.results || []).map((p: any) => ({
              type:       "post",
              id:         p._id,
              title:      p.jobDetails?.title || "Untitled Post",
              subtitle:   [p.jobDetails?.location, p.jobDetails?.employmentType].filter(Boolean).join(" · ") || "Job post",
              badge:      p.status,
              badgeColor: STATUS_COLOR[p.status] || "#6B7280",
              href:       `/company/posts/${p._id}`,
            }))
          : [];

        const apps: SearchResult[] = appsRes.status === "fulfilled"
          ? (appsRes.value.data?.data || []).map((a: any) => ({
              type:       "application",
              id:         a.id,
              title:      [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email || "Unknown Candidate",
              subtitle:   a.postTitle || "Application",
              badge:      a.matchScore != null ? `${Math.round(a.matchScore)}%` : undefined,
              badgeColor: TEAL,
              href:       `/company/applications`,
            }))
          : [];

        const employees: SearchResult[] = employeesRes.status === "fulfilled"
          ? (employeesRes.value.data?.memberships || []).map((m: any) => ({
              type:     "employee",
              id:       m.userId,
              title:    [m.firstName, m.lastName].filter(Boolean).join(" ") || m.username || m.email || "Unnamed",
              subtitle: [m.role, m.department?.name].filter(Boolean).join(" · ") || "Team member",
              href:     `/company/employees/${m.userId}`,
            }))
          : [];

        const departments: SearchResult[] = departmentsRes.status === "fulfilled"
          ? (departmentsRes.value.data?.data || []).map((d: any) => ({
              type:     "department",
              id:       d._id,
              title:    d.name,
              subtitle: d.description || "Department",
              href:     `/company/departments/${d._id}`,
            }))
          : [];

        const campaigns: SearchResult[] = campaignsRes.status === "fulfilled"
          ? (campaignsRes.value.data?.data || []).map((c: any) => ({
              type:       "campaign",
              id:         c._id,
              title:      c.title,
              subtitle:   `${c.targetEmployeeCount ?? 0} participant${c.targetEmployeeCount === 1 ? "" : "s"}`,
              badge:      c.status,
              badgeColor: CAMPAIGN_STATUS_COLOR[c.status] || "#6B7280",
              href:       `/company/campaigns/${c._id}`,
            }))
          : [];

        setResults([...posts, ...apps, ...employees, ...departments, ...campaigns]);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  // Keyboard navigation
  const totalItems = results.length;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, totalItems - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter" && focused >= 0) {
      const target = results[focused];
      if (target) { router.push(target.href); setOpen(false); setQuery(""); }
    }
  }, [focused, results, router, totalItems]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
    setFocused(-1);
  };

  const postResults       = results.filter((r) => r.type === "post");
  const appResults        = results.filter((r) => r.type === "application");
  const employeeResults   = results.filter((r) => r.type === "employee");
  const departmentResults = results.filter((r) => r.type === "department");
  const campaignResults   = results.filter((r) => r.type === "campaign");
  const hasResults    = results.length > 0;
  const showEmpty     = query.trim().length > 0 && !loading && !hasResults;

  // Cumulative offsets — matches setResults' [...posts, ...apps, ...employees,
  // ...departments, ...campaigns] concat order, so focused-index math and
  // keyboard nav line up with what's actually on screen.
  const employeeOffset   = postResults.length + appResults.length;
  const departmentOffset = employeeOffset + employeeResults.length;
  const campaignOffset   = departmentOffset + departmentResults.length;

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

          {/* Employee results */}
          {employeeResults.length > 0 && (
            <div className={cn("p-1", (postResults.length > 0 || appResults.length > 0) && "border-t border-gray-100")}>
              <p className="px-1 pb-[3px] pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#C4C9D4]">
                Employees
              </p>
              {employeeResults.map((r, i) => {
                const idx = employeeOffset + i;
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Department results */}
          {departmentResults.length > 0 && (
            <div className={cn("p-1", (postResults.length > 0 || appResults.length > 0 || employeeResults.length > 0) && "border-t border-gray-100")}>
              <p className="px-1 pb-[3px] pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#C4C9D4]">
                Departments
              </p>
              {departmentResults.map((r, i) => {
                const idx = departmentOffset + i;
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
                      <Building2 size={13} color={TEAL} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-gray-900">{r.title}</p>
                      <p className="truncate text-[11px] text-gray-400">{r.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Campaign results */}
          {campaignResults.length > 0 && (
            <div className={cn("p-1", (postResults.length > 0 || appResults.length > 0 || employeeResults.length > 0 || departmentResults.length > 0) && "border-t border-gray-100")}>
              <p className="px-1 pb-[3px] pt-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#C4C9D4]">
                Campaigns
              </p>
              {campaignResults.map((r, i) => {
                const idx = campaignOffset + i;
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
                      <Target size={13} color={TEAL} />
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
                        {r.badge.toLowerCase()}
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
