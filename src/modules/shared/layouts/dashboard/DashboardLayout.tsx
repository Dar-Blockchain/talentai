"use client";

import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";
import DashboardMain from "./DashboardMain";
import { navigation } from "./navigation";
import { useRouter } from "next/router";
import OnboardingTour from "@/modules/company/tour";


interface DashboardLayoutProps {
  children: React.ReactNode;
  tightenMainPaddingTop?: boolean;
  tightenMainPaddingBottom?: boolean;
  fillMainHeight?: boolean;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const HEADER_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tightenMainPaddingTop = false,
  tightenMainPaddingBottom = false,
  fillMainHeight = false,
}) => {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 1280
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    navigation.forEach((item) => router.prefetch(item.href));
  }, [router]);

  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

  const breadcrumb = useMemo(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const current = navigation.find((i) => path.includes(i.href));
    return current?.label || "Dashboard";
  }, []);

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  useEffect(() => {
    document.body.style.setProperty("--layout-sidebar-width", `${sidebarWidth}px`);
  }, [sidebarWidth]);

  return (
    <div className="flex h-[100dvh]">
      <OnboardingTour />
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="fixed top-0 right-0 z-[1200] max-md:!left-0 max-md:!w-full transition-[left,width] duration-300"
          style={{ left: sidebarWidth, height: HEADER_HEIGHT, width: `calc(100% - ${sidebarWidth}px)` }}
        >
          <Header breadcrumb={breadcrumb} mobileOpen={mobileOpen} onOpenMobile={() => setMobileOpen((o) => !o)} />
        </div>

        <DashboardMain
          fillMainHeight={fillMainHeight}
          tightenMainPaddingTop={tightenMainPaddingTop}
          tightenMainPaddingBottom={tightenMainPaddingBottom}
        >
          {children}
        </DashboardMain>
      </div>
    </div>
  );
};

export default DashboardLayout;
