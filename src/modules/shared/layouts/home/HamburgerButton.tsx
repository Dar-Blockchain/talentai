"use client";
import React, { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileDrawer from "./MobileDrawer";

interface HamburgerButtonProps {
  userId?: string;
  unreadMessageCount?: number;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  userId,
  unreadMessageCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = useCallback(() => setMobileOpen((prev) => !prev), []);

  return (
    <>
      <button
        type="button"
        onClick={toggleDrawer}
        className={cn(
          "relative flex items-center justify-center",
          "w-[34px] h-[34px] rounded-[10px]",
          "border border-primary/25",
          "[@media(min-width:800px)]:hidden",
          "transition-colors duration-150 cursor-pointer",
          mobileOpen ? "bg-primary/10" : "bg-primary/5",
          "hover:border-primary/40 hover:bg-primary/10"
        )}
      >
        <Menu className="w-[18px] h-[18px] text-primary" />
        {!!unreadMessageCount && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-destructive flex items-center justify-center text-white text-[9px] font-bold leading-none">
            {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
          </span>
        )}
      </button>

      <MobileDrawer
        open={mobileOpen}
        onClose={toggleDrawer}
        userId={userId}
        unreadMessageCount={unreadMessageCount}
      />
    </>
  );
};

export default HamburgerButton;
