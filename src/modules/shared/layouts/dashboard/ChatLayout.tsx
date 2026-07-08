"use client";

import React from "react";
import Header from "./DashboardHeader";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 64;

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col">
      {/* Fixed header */}
      <div className="fixed left-0 right-0 top-0 z-[1200]" style={{ height: HEADER_HEIGHT }}>
        <Header onOpenMobile={() => {}} />
      </div>

      {/* Content — full width, no sidebar */}
      <div
        className="flex flex-1 flex-col overflow-hidden bg-gray-50 p-3 sm:p-5 md:p-6"
        style={{ marginTop: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
