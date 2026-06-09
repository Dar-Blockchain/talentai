"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardMainProps {
  children: React.ReactNode;
  fillMainHeight?: boolean;
  tightenMainPaddingTop?: boolean;
  tightenMainPaddingBottom?: boolean;
  className?: string;
}

/**
 * Main scrollable content area that sits below the fixed header.
 * Uses a cool-gray surface so white cards and panels pop visually.
 */
const DashboardMain: React.FC<DashboardMainProps> = ({
  children,
  fillMainHeight = false,
  tightenMainPaddingTop = false,
  tightenMainPaddingBottom = false,
  className,
}) => {
  return (
    <main
      className={cn(
        // offset for fixed 64 px header
        "mt-16 flex-1 min-w-0 min-h-0",
        // surface — whisper-light warm-white so cards pop without tint fatigue
        "bg-[#F8FAF9]",
        // fill vs scroll mode
        fillMainHeight
          ? "flex flex-col overflow-hidden"
          : "h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden custom-scrollbar",
        // horizontal padding (responsive)
        "px-4 sm:px-6 md:px-7",
        // vertical padding
        tightenMainPaddingTop
          ? "pt-3 sm:pt-4"
          : "pt-5 sm:pt-6 md:pt-7",
        tightenMainPaddingBottom
          ? "pb-3 sm:pb-4"
          : "pb-5 sm:pb-6 md:pb-7",
        className
      )}
    >
      {children}
    </main>
  );
};

export default DashboardMain;
