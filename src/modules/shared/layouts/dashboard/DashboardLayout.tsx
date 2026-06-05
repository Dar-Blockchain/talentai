import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { navigation } from "@/constants/navigation";
import { useIsMobile, useIsSmallDesktop } from "@/modules/shared/hooks/useMediaQuery";
import OnboardingTour from "@/components/features/company/OnboardingTour";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader  from "./DashboardHeader";
import { SidebarProvider } from "@/modules/shared/ui/shadcn/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  tightenMainPaddingTop?:    boolean;
  tightenMainPaddingBottom?: boolean;
  fillMainHeight?:           boolean;
}

const DRAWER_WIDTH    = 240;
const COLLAPSED_WIDTH = 64;
const HEADER_HEIGHT   = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tightenMainPaddingTop    = false,
  tightenMainPaddingBottom = false,
  fillMainHeight           = false,
}) => {
  const router         = useRouter();
  const isMobile       = useIsMobile();
  const isSmallDesktop = useIsSmallDesktop();

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    navigation.forEach((item) => router.prefetch(item.href));
  }, [router]);

  const effectiveCollapsed = collapsed || isSmallDesktop;
  const drawerWidth        = effectiveCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  useEffect(() => {
    document.body.style.setProperty(
      "--layout-sidebar-width",
      isMobile ? "0px" : `${drawerWidth}px`,
    );
  }, [drawerWidth, isMobile]);

  const paddingX = "px-3 sm:px-5 md:px-6";
  const paddingB = tightenMainPaddingBottom ? "pb-2 sm:pb-3"         : "pb-3 sm:pb-5 md:pb-6";
  const paddingT = tightenMainPaddingTop    ? "pt-1 sm:pt-2 md:pt-2" : "pt-3 sm:pt-5 md:pt-6";

  return (
    <SidebarProvider
      open={!effectiveCollapsed}
      onOpenChange={(open) => setCollapsed(!open)}
      openMobile={mobileOpen}
      onOpenMobileChange={setMobileOpen}
    >
      <OnboardingTour />

      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Fixed header — tracks sidebar width */}
        <div
          className="fixed top-0 right-0 z-[1200]"
          style={{
            left:       isMobile ? 0 : drawerWidth,
            height:     HEADER_HEIGHT,
            transition: "left 0.22s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <DashboardHeader isMobile={isMobile} onOpenMobile={() => setMobileOpen(true)} />
        </div>

        {/* Page content */}
        <div
          className={[
            "flex-1 min-h-0 bg-[#F7FAF9]",
            paddingX, paddingB, paddingT,
            fillMainHeight
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto overflow-x-hidden custom-scrollbar",
          ].join(" ")}
          style={{ marginTop: HEADER_HEIGHT }}
        >
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
