import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import { useIsMobile } from "@/modules/shared/hooks/useMediaQuery";
import DashboardHeader from "@/modules/shared/layouts/dashboard/DashboardHeader";
import CandidateQuickNav from "./CandidateQuickNav";

interface CandidateWorkspaceLayoutProps {
  children:    React.ReactNode;
  breadcrumb?: string;
  fillHeight?: boolean;
}

const HEADER_HEIGHT = 64;
const NAV_WIDTH     = 240;

const CandidateWorkspaceLayout: React.FC<CandidateWorkspaceLayoutProps> = ({
  children,
  fillHeight = false,
}) => {
  const { t }        = useTranslation("auth");
  const isLoggingOut = useSelector(isLoggingOutCheck);
  const isMobile     = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 backdrop-blur-[6px]">
          <div className="flex flex-col items-center gap-4 bg-white rounded-[20px] px-10 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#E8EAED]">
            <Loader2 className="size-10 animate-spin" style={{ color: "#8310FF" }} />
            <div className="text-center">
              <p className="font-bold text-base text-[#0F172A]">{t("logout.signing_out")}</p>
              <p className="text-[0.8125rem] text-[#94A3B8] mt-1">{t("logout.please_wait")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 z-[1200]" style={{ height: HEADER_HEIGHT }}>
        <DashboardHeader isMobile={isMobile} onOpenMobile={() => setMobileOpen(true)} />
      </div>

      {/* Mobile right drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[280px] bg-[#F9FAFB] p-4 overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="mb-3 p-1 text-gray-500 hover:text-gray-700">
              <X className="size-4" />
            </button>
            <CandidateQuickNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main scroll area */}
      <div
        id="main-scroll"
        className={[
          "flex-1 px-3 sm:px-5 md:px-6 pb-3 sm:pb-5 md:pb-6 pt-1 sm:pt-2",
          fillHeight ? "overflow-hidden" : "overflow-auto custom-scrollbar",
        ].join(" ")}
        style={{ marginTop: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-[10px] items-start"
          style={{ height: fillHeight ? "100%" : "auto" }}
        >
          {/* Content column */}
          <div
            className="min-w-0 flex flex-col gap-[6px] mt-0 md:mt-4"
            style={{ height: fillHeight ? "100%" : "auto", minHeight: fillHeight ? 0 : undefined }}
          >
            <div className="md:hidden">
              <CandidateQuickNav variant="horizontal" />
            </div>
            <div
              className="flex flex-col"
              style={{ flex: fillHeight ? 1 : undefined, minHeight: fillHeight ? 0 : undefined }}
            >
              {children}
            </div>
          </div>

          {/* Desktop sticky nav column */}
          <div className="hidden md:block sticky top-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
            <CandidateQuickNav />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateWorkspaceLayout;
