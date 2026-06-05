import React from "react";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import DashboardHeader from "./DashboardHeader";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 64;

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const { t }        = useTranslation("auth");
  const isLoggingOut = useSelector(isLoggingOutCheck);

  return (
    <div className="flex flex-col h-screen">
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 backdrop-blur-[6px]">
          <div className="relative overflow-hidden flex flex-col items-center gap-4 bg-white rounded-[20px] px-10 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#A8EAC8]/40">
            {/* Brand gradient top accent */}
            <div className="w-full h-[3px] bg-brand-gradient rounded-t-[20px] absolute top-0 left-0" />
            <Loader2 className="size-10 animate-spin" style={{ color: "#BD85FF" }} />
            <div className="text-center">
              <p className="font-bold text-base text-[#0F172A]">{t("logout.signing_out")}</p>
              <p className="text-[0.8125rem] text-[#94A3B8] mt-1">{t("logout.please_wait")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 z-[1200]" style={{ height: HEADER_HEIGHT }}>
        <DashboardHeader isMobile={false} onOpenMobile={() => {}} />
      </div>

      <div
        className="flex-1 bg-[#F7FAF9] flex flex-col overflow-hidden p-3 sm:p-5 md:p-6"
        style={{ marginTop: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
