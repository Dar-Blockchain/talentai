"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Header from "@/modules/shared/layouts/dashboard/DashboardHeader";
import CandidateQuickNav from "@/modules/shared/layouts/candidate/CandidateQuickNav";
import CandidateNavDrawer from "@/modules/shared/layouts/candidate/CandidateNavDrawer";

interface CandidateWorkspaceLayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
  fillHeight?: boolean;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const CandidateWorkspaceLayout: React.FC<CandidateWorkspaceLayoutProps> = ({
  children,
  breadcrumb,
  fillHeight = false,
  leftPanel,
  rightPanel,
}) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header + mobile drawer — drawer owns its own open state via trigger prop */}
      <CandidateNavDrawer
        trigger={(openDrawer) => (
          <Header breadcrumb={breadcrumb} onOpenMobile={openDrawer} />
        )}
      />

      {/* Main scroll area */}
      <main
        id="main-scroll"
        className={cn(
          "flex-1 min-h-0",
          fillHeight ? "overflow-hidden" : "overflow-auto custom-scrollbar"
        )}
      >
        <div
          className={cn(
            "px-4 sm:px-6 md:px-8 pb-6 pt-2 sm:pt-3 grid gap-5 items-start",
            fillHeight && "h-full",
            leftPanel
              ? "grid-cols-1 md:grid-cols-[240px_1fr_240px]"
              : "grid-cols-1 md:grid-cols-[1fr_240px]"
          )}
        >
          {/* Left panel (injected per-page, e.g. profile sidebar on dashboard) */}
          {leftPanel && (
            <aside className="hidden md:flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
              {leftPanel}
            </aside>
          )}

          {/* Center: page content */}
          <div
            className={cn(
              "min-w-0 flex flex-col",
              fillHeight ? "h-full min-h-0" : "gap-4"
            )}
          >
            {children}
          </div>

          {/* Right panel: custom or QuickNav — desktop only */}
          <aside className="hidden md:flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
            {rightPanel ?? <CandidateQuickNav />}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CandidateWorkspaceLayout;
