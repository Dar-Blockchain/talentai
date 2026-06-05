"use client";
import React from "react";
import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { RootState } from "@/store/store";
import HeaderNotification from "@/modules/notifications/shared/components/HeaderNotification";
import HeaderChat        from "./HeaderChat";
import GlobalSearch      from "./GlobalSearch";
import LanguageSwitcher  from "@/components/ui/LanguageSwitcher";
import UserAvatar        from "@/modules/shared/layouts/shared/UserAvatar";

interface DashboardHeaderProps {
  onOpenMobile: () => void;
  isMobile:     boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenMobile, isMobile }) => {
  const user        = useSelector((state: RootState) => state.user.connectedUser.user);
  const isCandidate = user?.role === "Candidate";

  return (
    <div className="relative h-16 bg-white border-b border-gray-100/80 flex items-center justify-between px-4 md:px-6 shadow-card">
      {/* Brand gradient bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-gradient" />

      {/* Left */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onOpenMobile}
            className="size-[34px] rounded-[9px] bg-[#EDFAF3] border border-[#A8EAC8] flex items-center justify-center text-[#6AD39C] hover:bg-[#D1F5E4] transition"
            aria-label="Open menu"
          >
            <Menu className="size-[18px]" />
          </button>
        )}
        {isCandidate && (
          <Link href="/" className="inline-block">
            <Image src="/images/home/logo.svg" alt="TalentAI" width={140} height={38} className="object-contain" />
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {!isCandidate && <GlobalSearch />}
        {!isCandidate && (
          <div className="w-px h-[22px] mx-0.5 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
        )}
        <div data-tour="header-chat"><HeaderChat /></div>
        <div data-tour="header-notif"><HeaderNotification /></div>
        <LanguageSwitcher variant="icon" size="small" />
        <div className="w-px h-[22px] mx-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
        <UserAvatar />
      </div>
    </div>
  );
};

export default DashboardHeader;
