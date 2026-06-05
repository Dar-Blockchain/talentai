"use client";
import React, { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

interface HamburgerButtonProps {
  userId?:             string;
  unreadMessageCount?: number;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  userId,
  unreadMessageCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = useCallback(() => setMobileOpen((p) => !p), []);

  return (
    <>
      <button
        onClick={toggleDrawer}
        className="relative flex [800px]:hidden items-center justify-center size-[34px] rounded-[10px] border transition-colors cursor-pointer"
        style={{
          borderColor: "rgba(13,148,136,0.2)",
          background: mobileOpen ? "rgba(13,148,136,0.08)" : "rgba(13,148,136,0.04)",
        }}
      >
        <Menu className="size-[18px]" style={{ color: "#0D9488" }} />
        {unreadMessageCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-px leading-none">
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
