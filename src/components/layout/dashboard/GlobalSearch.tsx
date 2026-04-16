"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  InputBase,
  CircularProgress,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAlt";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useRouter } from "next/router";
import axiosInstance from "@/utils/axiosInstance";

const TEAL = "#0D9488";

const STATUS_COLOR: Record<string, string> = {
  active: "#059669", open: "#059669", draft: "#D97706",
  closed: "#6B7280", expired: "#6B7280",
};

const QUICK_LINKS = [
  { label: "Dashboard",    href: "/company/dashboard",    Icon: SpaceDashboardOutlined },
  { label: "Posts",        href: "/company/posts",        Icon: WorkOutlineOutlined },
  { label: "Applications", href: "/company/applications", Icon: PeopleAltOutlined },
  { label: "Settings",     href: "/company/settings",     Icon: TuneOutlined },
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
    <>
      {/* ── Trigger ── */}
      <Box
        ref={anchorRef}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          px: 1.5, height: 34,
          bgcolor: "#F9FAFB", border: "1px solid #E5E7EB",
          borderRadius: "10px", cursor: "text",
          transition: "all 0.15s",
          "&:hover": { borderColor: `${TEAL}50`, bgcolor: "#fff" },
          minWidth: { xs: 120, sm: 200, md: 240 },
        }}
      >
        <SearchOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
        <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF", flex: 1, userSelect: "none" }}>
          Search...
        </Typography>
        <Box sx={{
          display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.35,
          bgcolor: "#F3F4F6", border: "1px solid #E5E7EB",
          borderRadius: "5px", px: "5px", py: "2px",
        }}>
          <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: "#9CA3AF" }}>⌘K</Typography>
        </Box>
      </Box>

      {/* ── Dropdown ── */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1400, width: anchorRef.current?.offsetWidth ? Math.max(anchorRef.current.offsetWidth, 420) : 420 }}
        modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      >
        <ClickAwayListener onClickAway={() => { setOpen(false); setQuery(""); setFocused(-1); }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Input row */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 1.25,
              px: 1.75, py: 1.25, borderBottom: "1px solid #F3F4F6",
            }}>
              {loading
                ? <CircularProgress size={14} sx={{ color: TEAL, flexShrink: 0 }} />
                : <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
              }
              <InputBase
                inputRef={inputRef}
                fullWidth
                placeholder="Search posts, candidates..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setFocused(-1); }}
                onKeyDown={handleKeyDown}
                sx={{ fontSize: "13.5px", color: "#111827", "& input::placeholder": { color: "#9CA3AF" } }}
              />
              {query && (
                <Box
                  onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                  sx={{
                    fontSize: "9.5px", fontWeight: 700, color: "#9CA3AF",
                    bgcolor: "#F3F4F6", border: "1px solid #E5E7EB",
                    borderRadius: "5px", px: "6px", py: "2px", cursor: "pointer",
                    "&:hover": { color: "#374151" },
                  }}
                >
                  ESC
                </Box>
              )}
            </Box>

            <Box sx={{ maxHeight: 400, overflowY: "auto" }}>

              {/* Quick links (no query) */}
              {!query.trim() && (
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ px: 1, pt: 0.5, pb: 0.75, fontSize: "9.5px", fontWeight: 700, color: "#C4C9D4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Quick navigation
                  </Typography>
                  {QUICK_LINKS.map((link, i) => (
                    <Box
                      key={link.href}
                      onClick={() => handleNavigate(link.href)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.25,
                        px: 1.25, py: 0.875, borderRadius: "9px", cursor: "pointer",
                        bgcolor: focused === i ? "#F3F4F6" : "transparent",
                        transition: "background 0.1s",
                        "&:hover": { bgcolor: "#F9FAFB" },
                      }}
                      onMouseEnter={() => setFocused(i)}
                    >
                      <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <link.Icon sx={{ fontSize: 13, color: "#6B7280" }} />
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{link.label}</Typography>
                      <ArrowForwardOutlined sx={{ fontSize: 12, color: "#D1D5DB", ml: "auto" }} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Post results */}
              {postResults.length > 0 && (
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ px: 1, pt: 0.5, pb: 0.75, fontSize: "9.5px", fontWeight: 700, color: "#C4C9D4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Job Posts
                  </Typography>
                  {postResults.map((r, i) => {
                    const idx = i;
                    return (
                      <Box
                        key={r.id}
                        onClick={() => handleNavigate(r.href)}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.25,
                          px: 1.25, py: 0.875, borderRadius: "9px", cursor: "pointer",
                          bgcolor: focused === idx ? "#F3F4F6" : "transparent",
                          "&:hover": { bgcolor: "#F9FAFB" },
                        }}
                        onMouseEnter={() => setFocused(idx)}
                      >
                        <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: `${TEAL}0F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <WorkOutlineOutlined sx={{ fontSize: 13, color: TEAL }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{r.title}</Typography>
                          <Typography noWrap sx={{ fontSize: "11px", color: "#9CA3AF" }}>{r.subtitle}</Typography>
                        </Box>
                        {r.badge && (
                          <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: r.badgeColor, bgcolor: `${r.badgeColor}15`, px: "6px", py: "2px", borderRadius: "5px", flexShrink: 0, textTransform: "capitalize" }}>
                            {r.badge}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Application results */}
              {appResults.length > 0 && (
                <Box sx={{ p: 1, borderTop: postResults.length > 0 ? "1px solid #F3F4F6" : "none" }}>
                  <Typography sx={{ px: 1, pt: 0.5, pb: 0.75, fontSize: "9.5px", fontWeight: 700, color: "#C4C9D4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Candidates
                  </Typography>
                  {appResults.map((r, i) => {
                    const idx = postResults.length + i;
                    return (
                      <Box
                        key={r.id}
                        onClick={() => handleNavigate(r.href)}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.25,
                          px: 1.25, py: 0.875, borderRadius: "9px", cursor: "pointer",
                          bgcolor: focused === idx ? "#F3F4F6" : "transparent",
                          "&:hover": { bgcolor: "#F9FAFB" },
                        }}
                        onMouseEnter={() => setFocused(idx)}
                      >
                        <Box sx={{
                          width: 26, height: 26, borderRadius: "50%",
                          bgcolor: `${TEAL}12`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: TEAL }}>
                            {r.title[0]?.toUpperCase()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{r.title}</Typography>
                          <Typography noWrap sx={{ fontSize: "11px", color: "#9CA3AF" }}>{r.subtitle}</Typography>
                        </Box>
                        {r.badge && (
                          <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: TEAL, bgcolor: `${TEAL}12`, px: "6px", py: "2px", borderRadius: "5px", flexShrink: 0 }}>
                            {r.badge}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Empty state */}
              {showEmpty && (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <SearchOutlined sx={{ fontSize: 32, color: "#E5E7EB", mb: 1 }} />
                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF" }}>No results for "{query}"</Typography>
                  <Typography sx={{ fontSize: "11.5px", color: "#C4C9D4", mt: 0.5 }}>Try a job title or candidate name</Typography>
                </Box>
              )}
            </Box>

            {/* Footer hint */}
            <Box sx={{ px: 2, py: 1, borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 2 }}>
              {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, action]) => (
                <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", bgcolor: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "4px", px: "5px", py: "1px" }}>
                    {key}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", color: "#C4C9D4" }}>{action}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default GlobalSearch;
