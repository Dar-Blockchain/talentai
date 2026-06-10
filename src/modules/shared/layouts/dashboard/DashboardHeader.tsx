"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import HeaderNotification from "@/modules/notifications/shared/components/HeaderNotification";
import HeaderChat from "./HeaderChat";
import GlobalSearch from "./GlobalSearch";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import UserAvatar from "../shared/UserAvatar";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  onOpenMobile: () => void;
  breadcrumb?: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const isCandidate = user?.role === "Candidate";

  return (
    <header className="relative h-16 bg-white border-b border-gray-100 shadow-[0_1px_4px_0_rgb(0_0_0/0.06)] flex items-center justify-between px-5 md:px-7 z-10">
      {/* ── Left: mobile menu + logo ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobile}
          className="md:hidden h-9 w-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {isCandidate && (
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/home/logo.svg"
              alt="TalentAI"
              width={130}
              height={36}
              className="object-contain"
            />
          </Link>
        )}
      </div>

      {/* ── Right: search + actions + user ── */}
      <div className="flex items-center gap-2">
        {!isCandidate && (
          <>
            <GlobalSearch />
            <Separator orientation="vertical" className="h-5 bg-gray-200 mx-0.5" />
          </>
        )}

        {/* Action icon cluster */}
        <div className="flex items-center gap-0.5 rounded-xl bg-gray-50 border border-gray-100 px-1 py-1">
          <div data-tour="header-chat">
            <HeaderChat />
          </div>
          <div data-tour="header-notif">
            <HeaderNotification />
          </div>
          <div className="[&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!shadow-none [&_button:hover]:!bg-primary/10 [&_button:hover]:!text-primary">
            <LanguageSwitcher variant="icon" size="small" />
          </div>
        </div>

        <Separator orientation="vertical" className="h-5 bg-gray-200 mx-0.5" />

        {/* User chip */}
        <UserAvatar />
      </div>
    </header>
  );
};

export default Header;
