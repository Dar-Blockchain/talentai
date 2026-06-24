"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/modules/shared/layouts/dashboard/DashboardHeader";
import CandidateQuickNav from "@/modules/shared/layouts/candidate/CandidateQuickNav";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface CandidateWorkspaceLayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
  fillHeight?: boolean;
  leftPanel?: React.ReactNode;
}

const CandidateWorkspaceLayout: React.FC<CandidateWorkspaceLayoutProps> = ({
  children,
  breadcrumb,
  fillHeight = false,
  leftPanel,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Header ── */}
      <Header breadcrumb={breadcrumb} onOpenMobile={() => setMobileOpen(true)} />

      {/* ── Mobile nav drawer ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" />
          <div
            className="relative w-72 h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
                Navigation
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <CandidateQuickNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main scroll area ── */}
      <main
        id="main-scroll"
        className={cn(
          "flex-1 min-h-0",
          fillHeight ? "overflow-hidden" : "overflow-auto custom-scrollbar"
        )}
      >
        <div
          className={cn(
            "px-4 sm:px-6 md:px-8 pb-6 pt-2 sm:pt-3",
            "grid gap-5 items-start",
            fillHeight && "h-full",
            leftPanel
              ? "grid-cols-1 md:grid-cols-[240px_1fr_240px]"
              : "grid-cols-1 md:grid-cols-[1fr_240px]"
          )}
        >
          {/* Left panel (e.g. profile sidebar injected from dashboard) */}
          {leftPanel && (
            <aside className="hidden md:flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
              {leftPanel}
            </aside>
          )}

          {/* Center: page content */}
          <div
            className={cn(
              "min-w-0 flex flex-col gap-4 mt-0 md:mt-4",
              fillHeight && "h-full min-h-0"
            )}
          >
            {/* Horizontal nav — mobile only */}
            <div className="md:hidden">
              <CandidateQuickNav variant="horizontal" />
            </div>

            <div className={cn("flex flex-col", fillHeight && "flex-1 min-h-0")}>
              {children}
            </div>
          </div>

          {/* Right panel: QuickNav — desktop only */}
          <aside className="hidden md:flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
            <CandidateQuickNav />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CandidateWorkspaceLayout;
